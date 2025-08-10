import { system } from "@minecraft/server";
import { getDistance, isValidPosition, pickRandom } from "./sculk_utils.js";

const DEFAULT_RADIUS = 5;
const DEFAULT_SPEED = 3;
const DEFAULT_SPREAD_COUNT = 3;
const DEFAULT_MAX_SPREAD = 1000;
const VALID_BLOCKS = [
    "minecraft:stone",
    "minecraft:dirt",
    "minecraft:grass_block",
    "minecraft:sand",
    "minecraft:gravel"
];
const MAX_BLOCK_CHECKS = 25;

let spreadQueue = [];
let totalSpread = 0; // общий счётчик
let isRunning = false;

export function startSculkSpread(startBlock, options = {}) {
    if (!startBlock?.location || !startBlock.dimension) return;

    spreadQueue.push({ block: startBlock, options });
    if (!isRunning) {
        isRunning = true;
        processSpreadQueueRecursive();
    }
}

/**
 * Рекурсивная обработка очереди
 */
function processSpreadQueueRecursive() {
    if (spreadQueue.length === 0 || totalSpread >= (spreadQueue[0]?.options.maxSpread || DEFAULT_MAX_SPREAD)) {
        isRunning = false;
        return;
    }

    let { block, options } = spreadQueue.shift();

    spreadSculk(block, options);

    // Запускаем следующий цикл через задержку
    system.runTimeout(() => processSpreadQueueRecursive(), options.speed || DEFAULT_SPEED);
}

/**
 * Распространяем скалк вокруг блока
 */
function spreadSculk(block, options) {
    if (!block?.location) return;
    const spreadCount = options.count || DEFAULT_SPREAD_COUNT;
    const spreadRadius = options.radius || DEFAULT_RADIUS;
    const dimension = block.dimension;

    let candidates = getNearbyBlocks(block.location, spreadRadius, dimension);
    if (candidates.length === 0) return;

    let selectedBlocks = pickRandom(candidates, Math.min(spreadCount, candidates.length));

    for (let target of selectedBlocks) {
        infectBlock(target, options, dimension);
        totalSpread++;

        if (totalSpread < (options.maxSpread || DEFAULT_MAX_SPREAD)) {
            spreadQueue.push({ block: target.block, options });
        }
    }
}

/**
 * Получаем случайные блоки рядом
 */
function getNearbyBlocks(origin, radius, dimension) {
    let candidates = [];

    for (let i = 0; i < MAX_BLOCK_CHECKS; i++) {
        let x = origin.x + (Math.random() * (2 * radius) - radius);
        let y = origin.y + (Math.random() * 5 - 2);
        let z = origin.z + (Math.random() * (2 * radius) - radius);
        let pos = { x: Math.round(x), y: Math.round(y), z: Math.round(z) };

        if (getDistance(origin, pos) > radius) continue;
        if (pos.y < -64 || pos.y > 320) continue;

        let block = dimension.getBlock(pos);
        if (block && VALID_BLOCKS.includes(block.typeId) && isValidPosition(pos, dimension)) {
            candidates.push({ pos, block });
        }

        if (candidates.length >= MAX_BLOCK_CHECKS) break;
    }

    return candidates;
}

/**
 * Заражает блок скалком
 */
function infectBlock(target, options, dimension) {
    if (!target?.block) return;

    target.block.setType("minecraft:sculk");

    let abovePos = { x: target.pos.x, y: target.pos.y + 1, z: target.pos.z };
    let aboveBlock = dimension.getBlock(abovePos);

    if (aboveBlock?.typeId === "minecraft:air" && options.sculkAddonBlock && options.growthChance) {
        let blockList = Array.isArray(options.sculkAddonBlock) ? options.sculkAddonBlock : [options.sculkAddonBlock];
        let chanceList = Array.isArray(options.growthChance) ? options.growthChance : [options.growthChance];

        for (let i = 0; i < blockList.length; i++) {
            if (Math.random() < (chanceList[i] || 0)) {
                aboveBlock.setType(blockList[i]);
                break;
            }
        }
    }
}
