import { createSculkCore } from "./sculk_core.js";
import { world } from "@minecraft/server";

// Подписываемся на событие установки блока
world.afterEvents.playerPlaceBlock.subscribe((event) => {
    if (event.block.typeId === "minecraft:gold_block") {
        const pos = event.block.location;
        console.warn(`[DEBUG] Обнаружена установка золотого блока на (${pos.x}, ${pos.y}, ${pos.z}).`);
        
        // Запускаем создание Sculk Core
        createSculkCore(pos.x, pos.y, pos.z);
    }
});