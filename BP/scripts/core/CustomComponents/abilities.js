
import { consumeUsedItem, countItems, removeItems, addAction, spawnSpiderbot } from "core/utilities/core_utilities.js"
import { system, world, EntityDamageCause } from "@minecraft/server"
const FlowerIDs = [
    "minecraft:dandelion",
    "minecraft:poppy",
    "minecraft:blue_orchid",
    "minecraft:allium",
    "minecraft:azure_bluet",
    "minecraft:red_tulip",
    "minecraft:orange_tulip",
    "minecraft:white_tulip",
    "minecraft:pink_tulip",
    "minecraft:oxeye_daisy",
    "minecraft:cornflower",
    "minecraft:lily_of_the_valley",
    "minecraft:sunflower",
    "minecraft:rose_bush",
    "minecraft:peony",
    "minecraft:lilac"
];


const redstoneCraftedBlocks = [
    "minecraft:lever",
    "minecraft:redstone_torch",
    "minecraft:noteblock",
    "minecraft:tripwire_hook",
    "minecraft:redstone_lamp",
    "minecraft:piston",
    "minecraft:sticky_piston",
    "minecraft:target",
    "minecraft:dropper",
    "minecraft:dispenser",
    "minecraft:observer",
    "minecraft:redstone_block",
    "minecraft:crafter",
    "minecraft:detector_rail",
    "minecraft:unpowered_comparator",
    "minecraft:powered_comparator",
    "minecraft:unpowered_comparator",
    "minecraft:powered_repeater",
    "minecraft:unpowered_repeater",
    "minecraft:redstone_wire"
];



export const drone_station_t1 = {
    onUseOn(e) {
        if (e.source.isSneaking) return
        if (e.source.getItemCooldown("ability") > 0) return;

        const { x, y, z } = e.block.location;
        const blockabove = e.block.dimension.getBlock({ x, y: y + 1, z });
        if (!blockabove.isAir) return;

        const inventory = e.source.getComponent("minecraft:inventory").container;
        if (countItems(inventory, "minecraft:redstone") < 12) return;

        const dimension = e.source.dimension;
        const tag1 = `spiderbot1_${e.source.id}`;
        const tag2 = `spiderbot2_${e.source.id}`;

        const bots1 = dimension.getEntities({ tags: [tag1] });
        const bots2 = dimension.getEntities({ tags: [tag2] });

        const has1 = bots1.length > 0;
        const has2 = bots2.length > 0;

        if (!has1 && !has2) {
            spawnSpiderbot(dimension, blockabove, e.source, tag1);
            removeItems(inventory, "minecraft:redstone", 12);
        } else if (has1 && !has2) {
            spawnSpiderbot(dimension, blockabove, e.source, tag2);
            removeItems(inventory, "minecraft:redstone", 12);
        } else if (!has1 && has2) {
            spawnSpiderbot(dimension, blockabove, e.source, tag1);
            removeItems(inventory, "minecraft:redstone", 12);
        } else {
            const bot0 = bots1[0];

            if (bot0) {
                try {
                    bot0.dimension.playSound("horizon:spidermine_dead", bot0.location);
                    bot0.dimension.spawnParticle("horizon:spidermine_spawn_particle", bot0.location);
                }
                catch { }

                system.runTimeout(() => {
                    bot0.removeTag(tag1)
                    bot0.remove()
                }, 2);
            }

            // Переназначение тегов: bot2 → bot1
            const bot1 = bots2[0];
            if (bot1) {
                bot1.removeTag(tag2);
                bot1.addTag(tag1);
            }

            // Новый бот → tag2
            spawnSpiderbot(dimension, blockabove, e.source, tag2);

            removeItems(inventory, "minecraft:redstone", 8);
        }

        e.source.startItemCooldown("ability", 100);
    },
    onUse(e) {
        if (!e.source.isSneaking) return;
        if (e.source.getItemCooldown("ability") > 0) return
        const entities = e.source.dimension.getEntities({ maxDistance: 20, families: ["robots_f"], location: e.source.location })
        if (entities.length === 0) return;
        let inventory = e.source.getComponent("minecraft:inventory").container;
        if (countItems(inventory, "minecraft:redstone") < 2) return;
        for (const entity of entities) {
            const healthComp = entity.getComponent("minecraft:health");
            if ((healthComp.currentValue + 10) > healthComp.defaultValue) continue
            if (entity?.getComponent("tameable")?.tamedToPlayer.name != e.source.name) continue
            entity.dimension.playSound("horizon:repair", entity.location)
            entity.dimension.spawnParticle("horizon:heal_particle", entity.location)
            healthComp.setCurrentValue(Math.min(healthComp.currentValue + 10, healthComp.defaultValue))

            e.source.startItemCooldown("ability", 20)
        }
        removeItems(inventory, "minecraft:redstone", 2)
    }
}
export const teleport = {
    onUse(e) {
        if (e.source.getItemCooldown("ability") > 0) return;
        const player = e.source;
        const entities = player.getEntitiesFromViewDirection({ maxDistance: 10 });
        const loc = player.location
        const block = player.getBlockFromViewDirection({ maxDistance: 10 })
        let inventory = player.getComponent("minecraft:inventory").container;
        const dir = player.getViewDirection();
        if (entities.length > 0) {
            if (countItems(inventory, "minecraft:lapis_lazuli" < 3)) return
            const target = entities[0].entity;
            const dx = loc.x - target.location.x;
            const dz = loc.z - target.location.z;
            const length = Math.sqrt(dx * dx + dz * dz) || 1;

            player.teleport({
                x: target.location.x + dx / length,
                y: target.location.y,
                z: target.location.z + dz / length
            }, { checkForBlocks: false });
            player.dimension.spawnParticle("horizon:magic_particle_0", player.location)

            target.applyDamage(4, { cause: EntityDamageCause.entityAttack, damagingEntity: player });

            target.dimension.spawnParticle("horizon:katana_hurt", {
                x: target.location.x,
                y: target.location.y + 1,
                z: target.location.z
            })
            e.source.startItemCooldown("ability", 10)
            system.runTimeout(() => {
                player.dimension.playSound("horizon:teleport", player.location)
                player.teleport(loc, { checkForBlocks: true });
                player.dimension.spawnParticle("horizon:magic_particle_0", loc)

            }, 10);
            removeItems(inventory, "minecraft:lapis_lazuli", 3)

        } else

            if (block) {

                if (countItems(inventory, "minecraft:lapis_lazuli") < 1) return;
                player.dimension.spawnParticle("horizon:magic_particle_0", player.location)
                player.dimension.playSound("horizon:teleport", player.location)
                player.teleport({
                    x: block.block.location.x - dir.x * 2,
                    y: block.block.location.y - dir.y * 2,
                    z: block.block.location.z - dir.z * 2
                })
                player.dimension.spawnParticle("horizon:magic_particle_0", player.location)
                player.dimension.playSound("horizon:teleport", player.location)
                e.source.startItemCooldown("ability", 10)
                removeItems(inventory, "minecraft:lapis_lazuri", 1)
            }

            else {
                if (countItems(inventory, "minecraft:lapis_lazuli") < 1) return
                const eye = player.getHeadLocation();
                player.dimension.spawnParticle("horizon:magic_particle_0", player.location)
                player.dimension.playSound("horizon:teleport", player.location)
                player.teleport({
                    x: eye.x + dir.x * 10,
                    y: eye.y + dir.y * 10,
                    z: eye.z + dir.z * 10
                }, { checkForBlocks: false });

                player.dimension.spawnParticle("horizon:magic_particle_0", player.location)
                player.dimension.playSound("horizon:teleport", player.location)
                e.source.startItemCooldown("ability", 10)
                removeItems(inventory, "minecraft:lapis_lazuli", 1)
            }
    }
}
export const redstone_impulse = {
    onUse(e) {
        if (e.source.getItemCooldown("ability") > 0) return
        let inventory = e.source.getComponent("minecraft:inventory").container;
        if (countItems(inventory, "minecraft:redstone") < 8) return;
        const { x, y, z } = e.source.location

        const from1 = {
            x: Math.floor(x - 5),
            y: Math.floor(y - 5),
            z: Math.floor(z - 5)
        };

        const to1 = {
            x: Math.floor(x + 5),
            y: Math.floor(y + 5),
            z: Math.floor(z + 5)
        };
        const charge = e.source.getDynamicProperty("charge")
        const volume = new BlockVolume(from1, to1);
        const locations = e.source.dimension.getBlocks(volume, { includeTypes: redstoneCraftedBlocks }, true)
        const redstone = locations.getCapacity()
        if (redstone > 500) {
            for (const loc of locations.getBlockLocationIterator()) {
                if (0.90 < Math.random()) {
                    e.source.dimension.getBlock(loc).setType("minecraft:air")
                }

            }
        }
        const newcharge = 100 + (redstone * 0.5)
        e.source.setDynamicProperty("charge", charge + newcharge)

        removeItems(inventory, "minecraft:redstone", 8)
        addAction(e.source, `${charge + newcharge} (+ ${newcharge})`)
        e.source.startItemCooldown("ability", 400)
    }
}
