import { getBiomass } from "./sculk_biomass.js";
import { getTarget } from "./sculk_target.js";
import { world, system } from "@minecraft/server";

// Событие п
world.afterEvents.itemUse.subscribe((event) => {
    const { itemStack, source: player } = event;

    if (itemStack?.typeId === "minecraft:recovery_compass") {
        showSculkInfo(player);
    }
});

//  Функция отображения информации 
function showSculkInfo(player) {
    if (!player) return;

    let biomass = getBiomass(player);
    let target = getTarget();

    let message = `§a[SCULK INFO] §r\n`;
    message += `§bБиомасса: §e${biomass}\n`;

    if (target) {
        message += `§6Текущая цель: §eX:${target.x}, Y:${target.y}, Z:${target.z}`;
    } else {
        message += `§cЦель скалка не установлена!`;
    }

    player.sendMessage(message);
}