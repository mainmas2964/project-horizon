// scheduler_safe.js
import { world, system, Entity, Block } from "@minecraft/server";

const SAVE_KEY = "mypack:scheduler_tasks";
const META_KEY = "mypack:scheduler_tasks_meta";
const CHUNK_SIZE = 30000;
const SAVE_INTERVAL_TICKS = 100;

export class TickTaskScheduler {
    constructor(maxTasksPerTick = 50) {
        this.tasks = [];
        this.maxTasksPerTick = maxTasksPerTick;
        this.taskIndex = 0;
        this.factories = new Map();

        // загружаем сохранённые задачи в безопасном контексте
        system.run(() => {
            try { this._loadTasks(); }
            catch (e) { console.warn("[sched] load error:", e); }
        });

        // основной цикл обработки
        system.runInterval(this.processTasks.bind(this), 1);

        // периодическое безопасное сохранение
        system.runInterval(() => {
            try { this._saveTasks(); }
            catch (e) { console.warn("[sched] save error:", e); }
        }, SAVE_INTERVAL_TICKS);
    }

    /**
     * factory(data, resolveTarget) -> callback(target, data, taskMeta) => boolean
     * После регистрации фабрики - попытаемся прикрепить callback к уже загруженным задачам этого типа.
     */
    registerTaskFactory(type, factory) {
        if (!type || typeof factory !== "function") throw new Error("Bad factory");
        this.factories.set(type, factory);

        // attach factory to already-loaded tasks of this type
        try {
            for (const task of this.tasks) {
                if (task.type === type && !task.callback) {
                    try {
                        const cb = factory(task.data, () => this._resolveTarget(task.targetSpec));
                        if (typeof cb !== "function") {
                            console.warn(`[sched] factory for '${type}' did not return a function — saved task ${task.id} will be ignored until fixed.`);
                            continue;
                        }
                        task.callback = cb;
                    } catch (e) {
                        console.warn(`[sched] factory for '${type}' threw while restoring task ${task.id}:`, e);

                    }
                }
            }
        } catch (e) {
            console.warn("[sched] attachFactoryToTasks error:", e);
        }
    }

    /**
     * Добавляет задачу.
     * Если persist:true и type не указан — persist отменяется.
     * Если persist:true и type указан, но фабрики ещё нет — задача всё равно будет сохранена,
     * и фабрика прикрепится позднее, когда вызовут registerTaskFactory.
     */
    addTask(callback, {
        delay = 0,
        repeat = 0,
        priority = "normal",
        target = null,
        persist = false,
        type = null,
        data = null,
        customId = null,
        replace = false
    } = {}) {
        // persist validation: if persist requested but no type — we cannot persist
        if (persist && !type) {
            console.warn(`[sched] addTask: persist:true but no type provided — task won't persist`);
            persist = false;
        } else if (persist && type && !this.factories.has(type)) {
            // фабрики ещё нет — это допустимо, но предупреждаем
            console.warn(`[sched] addTask: persist:true for type='${type}' but factory not registered yet — will persist and restore when factory registers`);
        }

        const id = customId ?? (Date.now() + Math.random());

        // dedupe by id
        const existingIndex = this.tasks.findIndex(t => t.id === id);
        if (existingIndex !== -1) {
            if (replace) this.tasks.splice(existingIndex, 1);
            else {
                console.warn(`[sched] Task with id '${id}' already exists — skipping addTask`);
                return null;
            }
        }

        const nextRun = (system.currentTick ?? 0) + (delay | 0);
        const targetSpec = this._serializeTarget(target);

        const task = {
            id,
            callback: callback || null,
            persist: !!persist,
            type: persist ? type : null,
            data: persist ? data : null,
            delay: delay | 0,
            repeat: repeat | 0,
            priority,
            target,
            targetSpec,
            nextRun
        };

        // if factory already exists and task.persist && !task.callback -> attach now
        if (task.persist && task.type && !task.callback && this.factories.has(task.type)) {
            try {
                const cb = this.factories.get(task.type)(task.data, () => this._resolveTarget(task.targetSpec));
                if (typeof cb === "function") task.callback = cb;
                else console.warn(`[sched] factory for '${task.type}' did not return function on addTask.`);
            } catch (e) {
                console.warn("[sched] factory threw during addTask:", e);
            }
        }

        this.tasks.push(task);
        return id;
    }

    removeTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
    }

    processTasks() {
        const nowTick = system.currentTick ?? 0;
        let executed = 0;
        let processed = 0;

        const priorityOrder = { high: 0, normal: 1, low: 2 };
        this.tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

        while (executed < this.maxTasksPerTick && processed < this.tasks.length) {
            const index = (this.taskIndex + processed) % this.tasks.length;
            const task = this.tasks[index];

            // resolve target if needed
            if (!task.target && task.targetSpec) {
                task.target = this._resolveTarget(task.targetSpec) || null;
            }

            // remove if target invalid
            if (task.target && !this.isTargetValid(task.target)) {
                this.tasks.splice(index, 1);
                if (index < this.taskIndex) this.taskIndex = Math.max(0, this.taskIndex - 1);
                continue;
            }

            if (nowTick >= task.nextRun) {
                // lazy attach factory -> callback if available now
                if (!task.callback && task.persist && task.type && this.factories.has(task.type)) {
                    try {
                        const cb = this.factories.get(task.type)(task.data, () => this._resolveTarget(task.targetSpec));
                        if (typeof cb === "function") task.callback = cb;
                        else {
                            console.warn(`[sched] factory for '${task.type}' returned non-function while processing task ${task.id}; removing task.`);
                            this.tasks.splice(index, 1);
                            if (index < this.taskIndex) this.taskIndex = Math.max(0, this.taskIndex - 1);
                            continue;
                        }
                    } catch (e) {
                        console.warn("[sched] factory threw during lazy attach:", e);
                        this.tasks.splice(index, 1);
                        if (index < this.taskIndex) this.taskIndex = Math.max(0, this.taskIndex - 1);
                        continue;
                    }
                }

                // if still no callback for persistent task — keep it in queue but skip execution (so it can be attached later)
                if (!task.callback) {
                    // skip this task execution (it will be attempted again later)
                    processed++;
                    continue;
                }

                // safety: ensure callback is a function
                if (typeof task.callback !== "function") {
                    console.warn("[sched] task callback is not a function — removing task", task.id);
                    this.tasks.splice(index, 1);
                    if (index < this.taskIndex) this.taskIndex = Math.max(0, this.taskIndex - 1);
                    continue;
                }

                // execute callback
                let keep = false;
                try {
                    keep = task.callback(task.target, task.data, task);
                } catch (e) {
                    console.warn("[sched] task callback threw:", e);
                    this.tasks.splice(index, 1);
                    if (index < this.taskIndex) this.taskIndex = Math.max(0, this.taskIndex - 1);
                    continue;
                }

                executed++;

                if (keep === false || task.repeat === 0) {
                    this.tasks.splice(index, 1);
                    if (index < this.taskIndex) this.taskIndex = Math.max(0, this.taskIndex - 1);
                } else {
                    task.nextRun = nowTick + task.repeat;
                }
            }
            processed++;
        }

        this.taskIndex = (this.taskIndex + processed) % (this.tasks.length || 1);
    }

    isTargetValid(target) {
        try {
            if (target instanceof Entity) return !!target.isValid;
            if (target instanceof Block) return !!target.isValid;
        } catch {
            return false;
        }
        return false;
    }

    _serializeTarget(target) {
        if (!target) return null;
        try {
            if (target?.id && typeof target.id === "string") {
                return { kind: "entity", id: target.id };
            }
            if (target?.dimension) {
                const dimId = target.dimension?.id ?? target.dimension?.type ?? null;
                let loc = null;
                if (target.location && typeof target.location === "object") loc = target.location;
                else if (typeof target.x === "number") loc = { x: target.x, y: target.y, z: target.z };
                if (loc) {
                    return { kind: "block", dimension: dimId, x: Math.floor(loc.x), y: Math.floor(loc.y), z: Math.floor(loc.z) };
                }
            }
        } catch (e) {
            console.warn("[sched] serialize target failed:", e);
        }
        return null;
    }

    _resolveTarget(spec) {
        if (!spec) return null;
        try {
            if (spec.kind === "entity") return world.getEntity(spec.id);
            if (spec.kind === "block") {
                const dim = world.getDimension(spec.dimension);
                return dim?.getBlock({ x: spec.x, y: spec.y, z: spec.z }) ?? null;
            }
        } catch {
            return null;
        }
    }

    _saveTasks() {
        // Всё обращение к dynamic props в system.run
        system.run(() => {
            try {
                const persistable = this.tasks
                    .filter(t => t.persist && t.type)
                    .map(t => ({
                        id: t.id,
                        type: t.type,
                        data: t.data,
                        delay: t.delay,
                        repeat: t.repeat,
                        priority: t.priority,
                        targetSpec: t.targetSpec ?? null,
                        nextRun: t.nextRun
                    }));

                const json = JSON.stringify(persistable);
                if (json.length <= CHUNK_SIZE) {
                    world.setDynamicProperty(META_KEY, undefined);
                    world.setDynamicProperty(SAVE_KEY, json);
                } else {
                    const chunks = [];
                    for (let i = 0; i < json.length; i += CHUNK_SIZE) chunks.push(json.slice(i, i + CHUNK_SIZE));
                    for (let i = 0; i < chunks.length; i++) {
                        world.setDynamicProperty(`${SAVE_KEY}:chunk:${i}`, chunks[i]);
                    }
                    world.setDynamicProperty(META_KEY, JSON.stringify({ chunks: chunks.length }));
                    world.setDynamicProperty(SAVE_KEY, undefined);
                }
            } catch (e) {
                console.warn("[sched] _saveTasks error:", e);
            }
        });
    }

    _loadTasks() {
        system.run(() => {
            try {
                const metaRaw = world.getDynamicProperty(META_KEY);
                let json = null;
                if (metaRaw) {
                    let meta;
                    try { meta = JSON.parse(metaRaw); } catch { meta = null; }
                    if (meta?.chunks) {
                        let builder = "";
                        for (let i = 0; i < meta.chunks; i++) {
                            const c = world.getDynamicProperty(`${SAVE_KEY}:chunk:${i}`);
                            if (typeof c === "string") builder += c;
                            else { builder = null; break; }
                        }
                        json = builder;
                    }
                } else {
                    const single = world.getDynamicProperty(SAVE_KEY);
                    if (typeof single === "string") json = single;
                }

                if (!json) return;

                const arr = JSON.parse(json);
                if (!Array.isArray(arr)) return;

                for (const rec of arr) {
                    // Load tasks even if factory not present yet — attach callback lazily
                    const task = {
                        id: rec.id,
                        callback: null,
                        persist: true,
                        type: rec.type ?? null,
                        data: rec.data ?? null,
                        delay: rec.delay ?? 0,
                        repeat: rec.repeat ?? 0,
                        priority: rec.priority ?? "normal",
                        targetSpec: rec.targetSpec ?? null,
                        nextRun: rec.nextRun ?? (system.currentTick ?? 0)
                    };

                    // try to attach callback immediately if factory exists
                    if (task.type && this.factories.has(task.type)) {
                        try {
                            const cb = this.factories.get(task.type)(task.data, () => this._resolveTarget(task.targetSpec));
                            if (typeof cb === "function") task.callback = cb;
                            else console.warn(`[sched] factory for '${task.type}' returned non-function while loading saved task ${task.id}`);
                        } catch (e) {
                            console.warn(`[sched] factory threw while loading task ${task.id}:`, e);
                        }
                    } else if (!task.type) {
                        console.warn(`[sched] loaded task ${task.id} has no type — it will be ignored for persistence`);
                    } else {
                        // factory missing — leave callback=null, we will try to attach later when factory registers
                        console.warn(`[sched] loaded task ${task.id} of type='${task.type}' — factory not registered yet, will attach when available`);
                    }

                    // try to resolve immediate runtime target
                    task.target = task.targetSpec ? this._resolveTarget(task.targetSpec) : null;

                    this.tasks.push(task);
                }
            } catch (e) {
                console.warn("[sched] _loadTasks error:", e);
            }
        });
    }
}
