import { consumeUsedItem, countItems, removeItems, spawnSpiderbot, addAction, consumeUsedItemNew, placeNextBatch, isPlaneShape, buildBlockQueue } from "core/utilities/core_utilities.js"
import { system, world, BlockVolume } from "@minecraft/server"
import { MessageFormData } from "@minecraft/server-ui"




export const builder_wand = {

    onUseOn(e, { params }) {
        const { source, block, itemStack } = e;
        const pos1 = source.getDynamicProperty("pos1");
        const pos2 = source.getDynamicProperty("pos2");

        if (!pos1) {
            source.setDynamicProperty("pos1", block.location);
            world.sendMessage("pos1 set");
            return;
        }

        if (!pos2) {
            source.setDynamicProperty("pos2", block.location);
            world.sendMessage("pos2 set");
            return;
        }

        const blocksVolume = new BlockVolume(pos1, pos2);
        const isPlaneMode = source.isSneaking;
        const inv = source.getComponent("inventory").container;

        const blocks = source.dimension.getBlocks(blocksVolume, { includeTypes: ["minecraft:air"] }, true);

        buildBlockQueue(blocks, source, pos1, pos2, isPlaneMode, 500, (blockQueue) => {
            const countblocks = blockQueue.length;
            const typeId = block.typeId;

            let message = new MessageFormData()
                .body(`You need ${countblocks}x ${typeId}, you have ${countItems(inv, typeId)}\nBuild a box?`)
                .title("Builder Wand")
                .button1("Yes")
                .button2("No");

            message.show(source).then(res => {
                if (res.selection === 0) {
                    placeNextBatch(blockQueue, inv, typeId, source, params.batch_size, params.ticks_delay, params.durability, params.durability_value, itemStack);
                }
            });
        });

        source.setDynamicProperty("pos1", undefined);
        source.setDynamicProperty("pos2", undefined);
    }

}



export const robosphere = {
    onUseOn(e, { params }) {
        const origin = e.block.above();
        const dim = origin.dimension;

        const candidates = [
            origin.location,
            { x: origin.location.x + 1, y: origin.location.y, z: origin.location.z },
            { x: origin.location.x - 1, y: origin.location.y, z: origin.location.z },
            { x: origin.location.x, y: origin.location.y, z: origin.location.z + 1 },
            { x: origin.location.x, y: origin.location.y, z: origin.location.z - 1 },
            { x: origin.location.x + 1, y: origin.location.y, z: origin.location.z + 1 },
            { x: origin.location.x + 1, y: origin.location.y, z: origin.location.z - 1 },
            { x: origin.location.x - 1, y: origin.location.y, z: origin.location.z + 1 },
            { x: origin.location.x - 1, y: origin.location.y, z: origin.location.z - 1 },
            { x: origin.location.x, y: origin.location.y + 1, z: origin.location.z },
            { x: origin.location.x, y: origin.location.y - 1, z: origin.location.z }
        ];

        const freeSpots = candidates.filter(pos => {
            const block = dim.getBlock(pos);
            return block && block.isAir;
        });

        if (freeSpots.length < 2) return;

        const pos1 = freeSpots[0];
        const pos2 = freeSpots[1];

        const s1 = dim.spawnEntity(params.spiderbot, {
            x: pos1.x + 0.5,
            y: pos1.y,
            z: pos1.z + 0.5
        });

        const s2 = dim.spawnEntity(params.spiderbot, {
            x: pos2.x + 0.5,
            y: pos2.y,
            z: pos2.z + 0.5
        });

        s1.getComponent("minecraft:tameable").tame(e.source);
        s2.getComponent("minecraft:tameable").tame(e.source);
        if (e.source.hasTag("better_spidermines")) {
            s1.addEffect("resistance", 20000000, { amplifier: 1, showParticles: false })
            s2.addEffect("resistance", 20000000, { amplifier: 1, showParticles: false })
        }

        dim.spawnParticle("horizon:spidermine_spawn_particle", {
            x: pos1.x + 0.5,
            y: pos1.y + 0.5,
            z: pos1.z + 0.5
        });

        dim.spawnParticle("horizon:spidermine_spawn_particle", {
            x: pos2.x + 0.5,
            y: pos2.y + 0.5,
            z: pos2.z + 0.5
        });

        dim.playSound("horizon:spidermine_spawn", origin.location);
        consumeUsedItemNew(e.source, 1);
    }
}
export const invisibility_scroll = {
    onCompleteUse(e) {
        e.source.addEffect("minecraft:invisibility", 1200, { amplifier: 1 });
        consumeUsedItem(e.source, 1)
        if (e.source.hasTag("mage")) e.source.addEffect("minecraft:invisibility", 3200, { amplifier: 1 });
    }
}
export const pollen_collector = {
    onUseOn(e) {
        if (!FlowerIDs.includes(e.block.typeId)) return;
        const pollen = new ItemStack("horizon:pollen", 2)
        e.block.dimension.spawnItem(pollen, e.block.location)
        for (let i = 0; i < 7; i++) e.block.dimension.spawnParticle("minecraft:honey_drip_particle", { x: e.block.location.x, y: e.block.location.y + 0.7, z: e.block.location.z })
        e.block.setType("air")
        const itemStack = e.itemStack
        const durability = itemStack.getComponent('minecraft:durability');
        const inventory = e.source.getComponent("minecraft:inventory").container;
        let unbreaking = 0;

        if (itemStack.hasComponent("minecraft:enchantable")) {
            const ench = itemStack.getComponent(ItemEnchantableComponent.componentId);
            if (ench) { // Проверяем ь и компонент зачарования
                const unbreakingEnchantment = ench.getEnchantment("unbreaking");
                if (unbreakingEnchantment) { // Проверяемвововоы
                    unbreaking = unbreakingEnchantment.level;
                }
            }
        }

        if (e.source) {
            if ((Math.ceil(Math.random() * 100)) <= (100 / (unbreaking + 1))) {
                if (durability.damage + 1 <= durability.maxDurability) {
                    durability.damage += 1;
                    inventory.setItem(e.source.selectedSlotIndex, itemStack);
                } else {
                    inventory.setItem(e.source.selectedSlotIndex, undefined);
                    e.source.playSound('random.break');
                }
            }
        }
    }
}
export const stinger_weapon = {
    onHitEntity(e) {
        if (!e.attackingEntity.hasTag("bee_origin")) return;
        const dmg = (Math.abs(e.attackingEntity.getVelocity().x) + Math.abs(e.attackingEntity.getVelocity().y) * 0.8 + Math.abs(e.attackingEntity.getVelocity().z)) * 17;
        if (!e.hitEntity) return;
        system.runTimeout(() => {
            e.hitEntity.applyDamage(dmg);
        })
    }
}