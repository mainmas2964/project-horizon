import { world, system, EquipmentSlot, ItemEnchantableComponent } from "@minecraft/server";

// Список блоков, которые нельзя разрушить
const UNBREAKABLE_BLOCKS = [
    "minecraft:bedrock",
    "minecraft:barrier",
    "minecraft:command_block",
    "minecraft:structure_block",
    "minecraft:jigsaw",
    "minecraft:end_portal_frame",
    "minecraft:end_gateway",
    "minecraft:reinforced_deepslate",
    "horizon:obsidian_diamond_ore",
    "minecraft:obsidian",
    "minecraft:water",
    "minecraft:lava",
    "horizon:steel_block"
];

// определение того куда игрок смотрит
function getMiningPlane(viewDirection) {
    if (Math.abs(viewDirection.y) > Math.abs(viewDirection.x) && Math.abs(viewDirection.y) > Math.abs(viewDirection.z)) {
        return "horizontal"; // если игрок смотрит вверх, то вверх
    }
    return "vertical"; // если вбок то вбок
}

// функция крч
function getMiningDirection(viewDirection) {
    if (Math.abs(viewDirection.x) > Math.abs(viewDirection.z)) {
        return { axis: "z", sign: viewDirection.x >= 0 ? -1 : 1 }; // Копаем ВЛЕВО/ВПРАВО
    } else {
        return { axis: "x", sign: viewDirection.z >= 0 ? 1 : -1 }; // Копаем ВПЕРЁД/НАЗАД
    }
}

// регистрация без смс 
system.beforeEvents.startup.subscribe(eventData => {
    eventData.itemComponentRegistry.registerCustomComponent("horizon:aoe_mining", {
        onMineBlock(event) {
            const { block, itemStack, source } = event;

            const radius = 1;

            // это я хз
            const viewDirection = source.getViewDirection();
            const plane = getMiningPlane(viewDirection);
            const { axis, sign } = getMiningDirection(viewDirection);

            // это тоже, писал код под действием пива
            for (let dx = -radius; dx <= radius; dx++) {
                for (let dy = -radius; dy <= radius; dy++) {
                    let targetX = block.location.x;
                    let targetY = block.location.y;
                    let targetZ = block.location.z;

                    if (plane === "horizontal") {
                        targetX += dx;
                        targetZ += dy;
                    } else {
                        if (axis === "x") {
                            targetX += dx;
                            targetY += sign * dy;
                        } else {
                            targetZ += dx;
                            targetY += sign * dy;
                        }
                    }

                    const targetBlock = block.dimension.getBlock({ x: targetX, y: targetY, z: targetZ });

                    // проверяем что блок вообще можно сломать 
                    if (targetBlock && !targetBlock.isAir && !UNBREAKABLE_BLOCKS.includes(targetBlock.typeId)) {
                        block.dimension.runCommand(`setblock ${targetX} ${targetY} ${targetZ} air destroy`);
                    }
                }
            }

            // снятие прочности (fuck Microsoft )
            const durability = itemStack.getComponent("minecraft:durability");
            const inventory = source.getComponent("minecraft:inventory").container;
            const ench = itemStack.getComponent(ItemEnchantableComponent.componentId);
            let unbreaking = 0;

            if (ench) {
                unbreaking = ench.getEnchantment("unbreaking")?.level || 0;
            }

            if (source) {
                if (Math.ceil(Math.random() * 100) <= 100 / (unbreaking + 1)) {
                    if (durability.damage + 1 <= durability.maxDurability) {
                        durability.damage += 1;
                        inventory.setItem(source.selectedSlotIndex, itemStack);
                    } else {
                        inventory.setItem(source.selectedSlotIndex, undefined);
                        source.playSound("random.break");
                    }
                }
            }
        }
    });
});