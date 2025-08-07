import { startSculkSpread } from "./sculk_infection.js";
import { getDistance } from "./sculk_utils.js";
import { getTarget } from "./sculk_target.js";
import { world, system } from "@minecraft/server";

const ALLOWED_BLOCKS = ["minecraft:stone", "minecraft:diamond_block", "minecraft:dirt", "minecraft:grass_block"];
const CATALYST_RADIUS = 6;
const TARGET_MAX_DISTANCE = 500;
const SCULK_COST = 1;

//
// Поиск ближайшего доступного места для нового катализатора (оптимизировано)
//
function findNearestCatalystPosition(origin, target, dimension, radius) {
    let bestPos = null;
    let bestDistance = Infinity;


    for (let i = 0; i < 20; i++) {  // Вместо полного перебора, 20 случайных попыток
        let pos = {
            x: origin.x + (Math.random() * radius * 2 - radius),
            y: origin.y + (Math.random() * 3 - 1),
            z: origin.z + (Math.random() * radius * 2 - radius),
        };

        let dist = getDistance(pos, target);
        let block = dimension.getBlock(pos);
        let aboveBlock = dimension.getBlock({ x: pos.x, y: pos.y + 1, z: pos.z });

        if (block && ALLOWED_BLOCKS.includes(block.typeId) && aboveBlock?.typeId === "minecraft:air") {
            if (dist < bestDistance) {
                bestPos = pos;
                bestDistance = dist;
            }
        }
    }
    return bestPos;
}

//
// Запуск логики каталиста
//
function catalystLogic(catalystBlock) {
    startSculkSpread(catalystBlock, { radius: 10, count: 20, speed: 1, maxSpread: 20 });

    const target = getTarget();
    if (!target) {
        catalystBlock.setType("minecraft:sculk");
        return;
    }

    const catalystPos = catalystBlock.location;
    const distanceToTarget = getDistance(catalystPos, target);
    if (distanceToTarget > TARGET_MAX_DISTANCE) {
        catalystBlock.setType("minecraft:sculk");
        return;
    }

    const dimension = catalystBlock.dimension;
    let newPos = findNearestCatalystPosition(catalystPos, target, dimension, CATALYST_RADIUS);

    if (!newPos) {
        newPos = catalystPos;
    }

    let candidateBlock = dimension.getBlock(newPos);
    if (candidateBlock && ALLOWED_BLOCKS.includes(candidateBlock.typeId)) {
        candidateBlock.setType("sculk_addon:catalyst");
        console.warn(`[Catalyst] Новый катализатор: X:${newPos.x}, Y:${newPos.y}, Z:${newPos.z}`);

        // ✅ Исправлено: новый катализатор сразу активируется
        system.runTimeout(() => catalystLogic(candidateBlock), 5);
    }

    catalystBlock.setType("minecraft:sculk");
}

//
// Подключаем каталист к событиям и автозапуску
//
world.afterEvents.playerPlaceBlock.subscribe((event) => {
    if (event.block.typeId === "sculk_addon:catalyst") {
        console.warn("[Catalyst] Катализатор запущен!");
        catalystLogic(event.block);
    }
});