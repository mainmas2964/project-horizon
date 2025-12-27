import { world, system, CustomCommandParamType, CommandPermissionLevel, CustomCommandStatus } from "@minecraft/server"
import { TickTaskScheduler } from "core/tickSystem/tick.js"
import { startSculkInfect, startSculkInfectRandom } from "core/sculk/sculk_infection.js"
import { approachNeverReach, randInt } from "core/utilities/math.js"
import { addAction } from "core/utilities/core_utilities.js"
const StorylineSched = new TickTaskScheduler({ maxTasksPerTick: 2, saveKey: "horizon:storyline_savekey", metaKey: "horizon:storyline_metakey" })
StorylineSched.registerTaskFactory("globalstory", data => {
    return () => {
        const state = data.state
        switch (state) {
            case 0: {
                const flag0 = world.getDynamicProperty("s:flag0") ?? false
                if (flag0 === true) {
                    StorylineSched.resolveCurrentData(data.id, ["data", "state"], 1);
                    return true;
                } else {
                    world.sendMessage("§cСолнечная активность аномально возрасла . . . ")
                    for (const key of world.getAllPlayers()) {
                        key.addEffect("blindness", 250, { showParticles: false })
                        key.spawnParticle("horizon:vhs_particle", key.location)
                        key.playSound("horizon:break", { volume: 50, pitch: 1 })
                    }
                    world.setDynamicProperty("s:flag0", true)
                    world.setDynamicProperty("diff", 5)

                    for (const player of world.getAllPlayers()) {
                        const tid = `tracker_${player.id}`;

                        StorylineSched.addTask(null, {
                            type: "tracker",
                            delay: 20,
                            repeat: 5,
                            replace: true,
                            persist: true,
                            customId: tid,
                            target: player,
                            data: {
                                id: tid,
                                state: 0,
                                progress: 0,
                                eventstate: 0
                            }
                        });
                    }

                    return true;
                }
            }
        }
    }
})
StorylineSched.registerTaskFactory("tracker", (data, resolveTarget) => {
    return (target) => {

        // Если флаг false — выход
        if (world.getDynamicProperty("s:flag0") === false) return true;

        // Проверка измерения — правильно через .dimension.id
        if (target.dimension.id === "minecraft:nether") {

            // Эффект визера
            target.addEffect("wither", 20, { amplifier: 1, showParticles: true });
            target.addEffect("blindness", 100, { amplifier: 1, showParticles: true });
            target.playSound("horizon:vhs")


            // Наносим урон (1 ед. — можно изменить)
            // applyDamage — ОФИЦИАЛЬНО документирован в @minecraft/server

            // Твой текст
            addAction(target, "§cИзлучение убивает вас изнутри");
            return true;
        }
        if (target.location.y <= -1) {
            StorylineSched.resolveCurrentData(data.id, ["data", "eventstate"], data.eventstate + 1)
            if (data.eventstate > 100 && data.eventstate < 102) {
                target.addEffect("darkness", 200)
                target.playSound("horizon:break")
                target.sendMessage("Вы чувствуете себя небезопасно находясь здесь")
                return true;
            }
            if (data.eventstate > 500 && data.eventstate < 502) {
                target.addEffect("darkness", 250)
                target.playSound("horizon:windly")
                target.sendMessage("За вами следят?")
                return true;
            }
            if (data.eventstate > 1005 && data.eventstate < 1007) {
                target.sendMessage("Кто здесь?")
                target.playSound("horizon:coming_of_void")
                return true;
            }
            if (data.eventstate >= 2500) {

                StorylineSched.resolveCurrentData(data.id, ["data", "eventstate"], 0)
                target.playSound("horizon:vhs")
                target.addEffect("blindness", 100, { amplifier: 1, showParticles: true });
                target.sendMessage("ОНИ тут")
                const entity = target.dimension.spawnEntity("horizon:sculk_void", { x: target.location.x + randInt(-20, 20), y: -50, z: target.location.z + randInt(-20, 20) })
                startSculkInfect(150, target, entity, Math.random())
                return true;
            }
        }

        return true;
    }
})
StorylineSched.loadTasks()
system.beforeEvents.startup.subscribe((init) => {
    init.customCommandRegistry.registerCommand({
        name: "horizon:storyline",
        description: "Storyline descr",
        mandatoryParameters: [
            { name: "xyz", type: CustomCommandParamType.Location }, { name: "storyline", type: CustomCommandParamType.Integer }, { name: "option", type: CustomCommandParamType.Integer }
        ],
        permissionLevel: CommandPermissionLevel.GameDirectors
    }, (origin, xyz, storyline, option) => {
        switch (storyline) {
            case 1: {
                system.run(() => {
                    const id = `globalstory`;
                    console.warn("1")
                    StorylineSched.addTask(null, {
                        repeat: 1,
                        replace: true,
                        priority: "low",
                        customId: id,
                        persist: true,
                        data: {
                            state: 0,
                            progress: 0,
                            id: id,
                            sculk_activity: 0
                        },
                        type: "globalstory"

                    })
                    world.setDynamicProperty("s:flag0", false)
                })
            } break;
            case 2: {
                world.setDynamicProperty("s:flag0", false)
            } break;
            case 3: {
                world.setDynamicProperty("diff", option)
            } break;
        }
    })

})
world.afterEvents.playerJoin.subscribe(e => {
    const player = world.getEntity(e.playerId)

    StorylineSched.addTask(null, {
        type: "tracker",
        delay: 100,
        repeat: 5,
        replace: true,
        persist: true,
        customId: `tracker_${e.playerId}`,
        target: player,
        data: {
            id: `tracker_${e.playerId}`,
            state: 0,
            progress: 0,
            eventstate: 0
        }

    })
})
const MONSTER_TYPES = [
    "minecraft:zombie",
    "minecraft:skeleton",
    "minecraft:creeper",
    "minecraft:spider",
    "minecraft:husk",
    "minecraft:stray",
    "minecraft:drowned",
    "minecraft:witch",
    "minecraft:pillager",
    "minecraft:vindicator",
    "minecraft:ravager"
];

// Возможные баффы
const EFFECT_POOL = [
    "strength",
    "resistance",
    "fire_resistance",
    "speed",
    "health_boost",
    "jump_boost",
    "haste",
    "water_breathing",
    "night_vision",
    "slow_falling",
    "conduit_power"
];


// Событие создания сущности
world.afterEvents.entitySpawn.subscribe((ev) => {
    const entity = ev.entity;

    // Проверяем флаг мира
    const flag0 = world.getDynamicProperty("s:flag0");
    if (flag0 !== true) return;

    // Проверяем сложность
    const diff = Number(world.getDynamicProperty("diff")) || 1;

    // Проверяем, монстр ли это
    if (!MONSTER_TYPES.includes(entity.typeId)) return;

    // Вычисляем шанс баффа
    // Пример: diff = 1 => 10% шанс, diff = 5 => 50%
    const chance = diff * 0.15;

    if (Math.random() <= chance) {
        // Количество эффектов: от 1 до diff (но не больше доступных)
        const effectCount = Math.min(
            1 + Math.floor(Math.random() * diff),
            EFFECT_POOL.length
        );

        for (let i = 0; i < effectCount; i++) {
            const effect = EFFECT_POOL[Math.floor(Math.random() * EFFECT_POOL.length)];

            // Накладываем эффект
            entity.addEffect(effect, 20 * 60, {
                amplifier: diff - 1,
                showParticles: false
            });
        }
    }
});