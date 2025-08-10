import { startSculkSpread } from "./sculk_infection.js";
import { world, system } from "@minecraft/server";

export function createSculkCore(x, y, z) {
    const dimension = world.getDimension("overworld");
    const coreBlock = dimension.getBlock({ x, y, z });

    if (!coreBlock) return;

    coreBlock.setType("sculk_addon:core_main");
    startCoreSpread(coreBlock);
}

function startCoreSpread(block) {
    if (!block || block.typeId !== "sculk_addon:core_main") return;

    startSculkSpread(block, {
        radius: 15,
        speed: 1,
        count: 30,
        maxSpread: 100000,
        sculkAddonBlock: [
            "minecraft:sculk_shrieker",
            "minecraft:sculk_sensor",
            "minecraft:sculk_catalyst",
            "sculk_prds:sculk_grass",
            "sculk_prds:sculk_grass_2",
            "sculk_prds:sculk_kust"
        ],
        growthChance: [0.01, 0.01, 0.01, 0.01, 0.01, 0.01]
    });
}