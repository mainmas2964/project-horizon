import { world, system, BlockVolume } from "@minecraft/server"
import { TickTaskScheduler } from "core/tickSystem/tick.js"
import { getDistance } from "core/utilities/core_utilities.js"
const sculkSystem = new TickTaskScheduler({
    maxTasksPerTick: 15,
    metaKey: "horizon:sculk",
    saveKey: "horizon:sculk_save"
})
function infectWithSculk(blockTarget, radius = 1) {
    if (!blockTarget) return;
    const dim = blockTarget.dimension;
    const { x, y, z } = blockTarget.location;

    const from = { x: x - radius, y: y - radius, z: z - radius };
    const to = { x: x + radius, y: y + radius, z: z + radius };

    const volume = new BlockVolume(from, to);
    const locations = dim.getBlocks(volume, {
        excludeTypes: ["minecraft:air"], includeTypes: ["minecraft:stone",
            "minecraft:dirt",
            "minecraft:grass_block",
            "minecraft:sand",
            "minecraft:gravel"]
    });

    for (const loc of locations.getBlockLocationIterator()) {
        const dx = loc.x - x;
        const dy = loc.y - y;
        const dz = loc.z - z;

        if (dx * dx + dy * dy + dz * dz > radius * radius) continue;

        const block = dim.getBlock(loc);
        if (block) block.setType("minecraft:sculk");


    }
}
function findNearestNextInfectPos(origin, target, dimension, radius) {
    let bestPos = null;
    let bestDistance = Infinity;

    for (let i = 0; i < 10; i++) {
        let pos = {
            x: origin.x + (Math.random() * radius * 2 - radius),
            y: origin.y + (Math.random() * 3 - 1),
            z: origin.z + (Math.random() * radius * 2 - radius),
        };

        let block = dimension.getBlock(pos);
        if (!block || block.typeId === "minecraft:air") continue;

        let dist = getDistance(pos, target);
        if (dist < bestDistance) {
            bestPos = pos;
            bestDistance = dist;
        }
    }
    return bestPos;
}
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function findRandomInfectPos(origin, dimension, radius = 1) {
    for (let i = 0; i < 10; i++) {
        let pos = {
            x: origin.x + randInt(-radius, radius),
            y: origin.y + randInt(-1, 1),
            z: origin.z + randInt(-radius, radius),
        };

        let block = dimension.getBlock(pos);
        if (block && block.typeId !== "minecraft:air" && block.above().typeId == "minecraft:air" && block.typeId != "minecrafr:sculk") {
            return pos;
        }
    }
    return null;
}
sculkSystem.registerTaskFactory("sculk_worm_infection_entity_target", (data, resolveTarget) => {
    return (target) => {
        if (data.biomass <= 0 || (!target && data.waitingTime < 0)) return false;
        if (!target) {
            sculkSystem.resolveCurrentData(data.id, ["data", "waitingTime"], data.waitingTime - 1)
            return true;
        }


        infectWithSculk(target, 0.5);

        let nextPos = null;
        let targetEntity = null;
        if (data.targetEntityId) {
            targetEntity = world.getEntity(data.targetEntityId);
            if (targetEntity) {
                nextPos = findNearestNextInfectPos(
                    target.location,
                    targetEntity.location,
                    target.dimension,
                    1
                );
            }
        }
        if (!nextPos) {
            nextPos = findRandomInfectPos(target.location, target.dimension, 1);
        }
        if (targetEntity && getDistance(targetEntity.location, target.location) <= 3) {
            targetEntity.applyDamage(5);
        }
        if (nextPos) {
            sculkSystem.resolveCurrentTarget(data.id, target.dimension.getBlock(nextPos))
            sculkSystem.resolveCurrentData(data.id, ["data", "biomass"], data.biomass - 1)
            target.dimension.spawnParticle("minecraft:sculk_soul_particle", nextPos)
            target.dimension.spawnParticle("sculk_charge_pop_particle", nextPos)
            return true;


        }

    }
});

sculkSystem.loadTasks()

export function startSculkInfect(biomass, targetEntityID, source) {
    sculkSystem.addTask(null, {
        delay: 5,
        repeat: 1,
        priority: "normal",
        persist: true,
        type: "sculk_worm_infection_entity_target",
        data: {
            biomass: biomass,
            targetEntityId: targetEntityID
        },
        target: source.dimension.getBlockBelow(source.location),
        replace: true
    });
}
world.afterEvents.itemUse.subscribe(data => {
    const { source, itemStack } = data;
    if (itemStack.typeId !== "minecraft:echo_shard") return;

    const entity = source.getEntitiesFromViewDirection({
        maxDistance: 20,
        ignoreBlockCollision: true
    });
    const id = Math.floor(Date.now() * 100)

    sculkSystem.addTask(null, {
        delay: 5,
        customId: id,
        repeat: 1,
        priority: "normal",
        persist: true,
        type: "sculk_worm_infection_entity_target",
        data: {
            biomass: 100,
            targetEntityId: entity.length > 0 ? entity[0].entity.id : false,
            id: id,
            waitingTime: 100000
        },
        target: source.dimension.getBlockBelow(source.location),
        replace: true
    });
});
