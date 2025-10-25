// scheduler_safe.js
import { world, system, Entity, Block } from "@minecraft/server";

const CHUNK_SIZE = 30000;
const SAVE_INTERVAL_TICKS = 100;

export class TickTaskScheduler {
    constructor({ maxTasksPerTick = 50, saveKey = "default:scheduler_tasks", metaKey = "default:scheduler_meta" } = {}) {
        this.maxTasksPerTick = maxTasksPerTick;
        this.SAVE_KEY = saveKey;
        this.META_KEY = metaKey;
        this.taskIndex = 0;
        this.factories = new Map();
        this._loaded = false;
        this.tasks = [];

        console.warn("[sched] constructor: scheduler initialized");


        system.runInterval(this.processTasks.bind(this), 1);

        system.runInterval(() => {
            if (!this._loaded) return;

            this._saveTasks();
        }, SAVE_INTERVAL_TICKS);
    }

    loadTasks() {
        if (this._loaded) {
            console.warn("[sched] loadTasks: already loaded");
            return;
        }
        system.run(() => {
            try {
                this._loadTasks();
                this._loaded = true;
                console.warn("[sched] loadTasks: done, tasks loaded:", this.tasks.length);
            } catch (e) {
                //console.warn("[sched] loadTasks error:", e);
            }
        });
    }

    saveNow() {
        this._saveTasks();
        console.warn("[sched] saveNow: saved.");
    }

    debugDumpSaved() {
        system.run(() => {
            try {
                const metaRaw = world.getDynamicProperty(this.META_KEY);
                const raw = world.getDynamicProperty(this.SAVE_KEY);
                console.warn("[sched.debug] META:", typeof metaRaw === "string" ? metaRaw.slice(0, 1000) : metaRaw);
                console.warn("[sched.debug] SAVE (prefix):", typeof raw === "string" ? raw.slice(0, 1000) : raw);
                if (metaRaw) {
                    try {
                        const meta = JSON.parse(metaRaw);
                        if (meta?.chunks) {
                            console.warn(`[sched.debug] saved as ${meta.chunks} chunks`);
                            for (let i = 0; i < meta.chunks; i++) {
                                const c = world.getDynamicProperty(`${this.SAVE_KEY}:chunk:${i}`);
                                console.warn(`[sched.debug] chunk ${i} len:`, typeof c === "string" ? c.length : String(c));
                            }
                        }
                    } catch (e) {
                        console.warn("[sched.debug] meta parse error", e);
                    }
                }
            } catch (e) {
                console.warn("[sched.debug] failed to dump saved:", e);
            }
        });
    }

    registerTaskFactory(type, factory) {
        if (!type || typeof factory !== "function") throw new Error("Bad factory");
        this.factories.set(type, factory);
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

    }

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
        if (persist && !type) {
            //console.warn(`[sched] addTask: persist:true but no type provided — task won't persist`);
            persist = false;
        } else if (persist && type && !this.factories.has(type)) {
            //console.warn(`[sched] addTask: persist:true for type='${type}' but factory not registered yet — will persist and restore when factory registers`);
        }

        const id = customId ?? (Date.now() + Math.random());

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

        if (task.persist && task.type && !task.callback && this.factories.has(task.type)) {
            const cb = this.factories.get(task.type)(task.data, () => this._resolveTarget(task.targetSpec));
            if (typeof cb === "function") task.callback = cb;
            else console.warn(`[sched] factory for '${task.type}' did not return function on addTask`);
        }

        this.tasks.push(task);
        console.warn(`[sched] addTask called: persist=${persist}, type=${type}, id=${customId ?? 'generated'}`);





        return id;


    }

    removeTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
    }
    resolveCurrentTarget(taskId, newTarget) {
        this.tasks.filter(t => t.id == taskId)[0].target = newTarget
    }
    resolveAllCurrentData(taskId, alldata) {
        this.tasks.filter(t => t.id == taskId)[0].data = alldata
    }
    resolveCurrentData(taskId, keyPath, newValue) {
        let task = this.tasks.find(t => t.id === taskId);
        if (!task) return false;

        let temp = task;
        for (let i = 0; i < keyPath.length - 1; i++) {
            if (!temp[keyPath[i]]) return false;
            temp = temp[keyPath[i]];
        }

        temp[keyPath[keyPath.length - 1]] = newValue;
        return true;
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

            if (!task.target && task.targetSpec) {
                task.target = this._resolveTarget(task.targetSpec) || null;
            }

            if (task.target && !this.isTargetValid(task.target)) {
                this.tasks.splice(index, 1);
                if (index < this.taskIndex) this.taskIndex = Math.max(0, this.taskIndex - 1);
                continue;
            }

            if (nowTick >= task.nextRun) {
                if (!task.callback && task.persist && task.type && this.factories.has(task.type)) {

                    const cb = this.factories.get(task.type)(task.data, () => this._resolveTarget(task.targetSpec));
                    if (typeof cb === "function") task.callback = cb;
                    else {
                        console.warn(`[sched] factory for '${task.type}' returned non-function while processing task ${task.id}; removing task.`);
                        this.tasks.splice(index, 1);
                        if (index < this.taskIndex) this.taskIndex = Math.max(0, this.taskIndex - 1);
                        continue;
                    }

                }

                if (!task.callback) {
                    processed++;
                    continue;
                }

                if (typeof task.callback !== "function") {
                    console.warn("[sched] task callback is not a function — removing task", task.id);
                    this.tasks.splice(index, 1);
                    if (index < this.taskIndex) this.taskIndex = Math.max(0, this.taskIndex - 1);
                    continue;
                }

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

        if (target instanceof Entity) return !!target.isValid;
        if (target instanceof Block) return !!target.isValid;
        return false;
    }
    //для дополнительной безопасности при тестированний
    _serializeTarget(target) {
        if (target?.id) {
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

    }

    _resolveTarget(spec) {
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
        system.run(() => {
            try {
                //console.warn(`[sched] _saveTasks: total tasks = ${this.tasks.length}`);
                //console.warn(`[sched] _saveTasks: persistable tasks = ${this.tasks.filter(t => t.persist && t.type).length}`);

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
                    world.setDynamicProperty(this.META_KEY, undefined);
                    world.setDynamicProperty(this.SAVE_KEY, json);
                    //console.warn(`[sched] saved tasks in one chunk`);
                } else {
                    const chunks = [];
                    for (let i = 0; i < json.length; i += CHUNK_SIZE) chunks.push(json.slice(i, i + CHUNK_SIZE));
                    for (let i = 0; i < chunks.length; i++) {
                        world.setDynamicProperty(`${this.SAVE_KEY}:chunk:${i}`, chunks[i]);
                    }
                    world.setDynamicProperty(this.META_KEY, JSON.stringify({ chunks: chunks.length }));
                    world.setDynamicProperty(this.SAVE_KEY, undefined);
                    //console.warn(`[sched] saved tasks in ${chunks.length} chunks`);
                }
            } catch (e) {
                console.warn("[sched] _saveTasks error:", e);
            }
        });
    }

    _loadTasks() {
        system.run(() => {

            const metaRaw = world.getDynamicProperty(this.META_KEY);
            let json = null;
            if (metaRaw) {
                let meta;
                try { meta = JSON.parse(metaRaw); } catch { meta = null; }
                if (meta?.chunks) {
                    let builder = "";
                    for (let i = 0; i < meta.chunks; i++) {
                        const c = world.getDynamicProperty(`${this.SAVE_KEY}:chunk:${i}`);
                        if (typeof c === "string") builder += c;
                        else { builder = null; break; }
                    }
                    json = builder;
                    console.warn(`[sched] _loadTasks: loaded ${meta.chunks} chunks, total length: ${json?.length}`);
                }
            } else {
                const single = world.getDynamicProperty(this.SAVE_KEY);
                if (typeof single === "string") {
                    json = single;
                }
            }

            if (!json) {
                console.warn("[sched] _loadTasks: no saved data found");
                return;
            }

            const arr = JSON.parse(json);
            console.warn(`[sched] _loadTasks: parsed array length = ${arr.length}`, arr);
            if (!Array.isArray(arr)) {
                console.warn("[sched] _loadTasks: parsed data is not an array");
                return;
            }


            for (const rec of arr) {
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
                    nextRun: rec.nextRun ?? (system.currentTick ?? 0),
                    target: null
                };

                if (task.type && this.factories.has(task.type)) {

                    const cb = this.factories.get(task.type)(task.data, () => this._resolveTarget(task.targetSpec));
                    console.warn(`[sched] loaded task: ${task.id}`);
                    if (typeof cb === "function") task.callback = cb;
                    else console.warn(`[sched] factory for '${task.type}' returned non-function while loading saved task ${task.id}`);
                }

                task.target = task.targetSpec ? this._resolveTarget(task.targetSpec) : null;

                this.tasks.push(task);
            }

        });
    }
}
