import { consumeUsedItem, countItems, removeItems, spawnSpiderbot, addAction, consumeUsedItemNew } from "core/utilities/core_utilities.js"
import { system, world } from "@minecraft/server"


export const robosphere = {
    onUseOn(e, { params }) {
        const origin = e.block.above(); // Блок над местом использования
        const dim = origin.dimension;

        // Все потенциальные позиции спавна (в порядке приоритета)
        const candidates = [
            origin.location, // Прямо над местом клика
            { x: origin.location.x + 1, y: origin.location.y, z: origin.location.z },
            { x: origin.location.x - 1, y: origin.location.y, z: origin.location.z },
            { x: origin.location.x, y: origin.location.y, z: origin.location.z + 1 },
            { x: origin.location.x, y: origin.location.y, z: origin.location.z - 1 },
            { x: origin.location.x + 1, y: origin.location.y, z: origin.location.z + 1 },
            { x: origin.location.x + 1, y: origin.location.y, z: origin.location.z - 1 },
            { x: origin.location.x - 1, y: origin.location.y, z: origin.location.z + 1 },
            { x: origin.location.x - 1, y: origin.location.y, z: origin.location.z - 1 },
            { x: origin.location.x, y: origin.location.y + 1, z: origin.location.z }, // Один блок выше
            { x: origin.location.x, y: origin.location.y - 1, z: origin.location.z }  // Один блок ниже
        ];

        // Фильтруем только свободные (воздушные) блоки
        const freeSpots = candidates.filter(pos => {
            const block = dim.getBlock(pos);
            return block && block.isAir;
        });

        if (freeSpots.length < 2) return; // Недостаточно места для спавна

        // Спавн мобов
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

        // Эффект партиклов
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
export const nectar_collector = {
    onUseOn(e) {
        if (!FlowerIDs.includes(e.block.typeId)) return;
        const nectar = new ItemStack("horizon:nectar", 2)
        e.block.dimension.spawnItem(nectar, e.block.location)
        for (let i = 0; i < 7; i++) e.block.dimension.spawnParticle("minecraft:honey_drip_particle", { x: e.block.location.x, y: e.block.location.y + 0.7, z: e.block.location.z })
        e.block.setType("air")
        const itemStack = e.itemStack
        const durability = itemStack.getComponent('minecraft:durability');
        const inventory = e.source.getComponent("minecraft:inventory").container;
        let unbreaking = 0;
        // Проверяемьлыдды
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