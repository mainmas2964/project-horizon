import { world, ItemEnchantableComponent, system } from '@minecraft/server';

system.beforeEvents.startup.subscribe(eventData => {
    eventData.itemComponentRegistry.registerCustomComponent('horizon:durability', {
        onMineBlock(e) {
            const { itemStack, source } = e;
            const durability = itemStack.getComponent('minecraft:durability');
            const inventory = source.getComponent("minecraft:inventory").container;
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

            if (source) {
                if ((Math.ceil(Math.random() * 100)) <= (100 / (unbreaking + 1))) {
                    if (durability.damage + 1 <= durability.maxDurability) {
                        durability.damage += 1;
                        inventory.setItem(source.selectedSlotIndex, itemStack);
                    } else {
                        inventory.setItem(source.selectedSlotIndex, undefined);
                        source.playSound('random.break');
                    }
                }
            }
        }
    });
});