import { system, BlockVolume } from "@minecraft/server";

/** позиционно-детерминированный шум без Math.random (чтобы края были рваными, но повторяемыми) */
function hash3i(x, y, z) {
    let h = (x * 374761393 + y * 668265263) ^ (z * 2147483647);
    h = (h ^ (h >>> 13)) * 1274126177;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295; // 0..1
}

/** цепочки «ослабления» блоков: шаг 1 = лёгкие трещины, шаг 2 = сильные */
const DAMAGE_CHAINS = {
    "minecraft:stone": ["minecraft:cobblestone", "minecraft:gravel"],
    "minecraft:stone_bricks": ["minecraft:cracked_stone_bricks", "minecraft:mossy_stone_bricks"],
    "minecraft:mossy_stone_bricks": ["minecraft:stone_bricks", "minecraft:cracked_stone_bricks"],
    "minecraft:deepslate_bricks": ["minecraft:cracked_deepslate_bricks", "minecraft:cobbled_deepslate"],
    "minecraft:deepslate_tiles": ["minecraft:cracked_deepslate_tiles", "minecraft:cobbled_deepslate"],
    "minecraft:nether_bricks": ["minecraft:cracked_nether_bricks", "minecraft:netherrack"],
    "minecraft:polished_blackstone_bricks": ["minecraft:cracked_polished_blackstone_bricks", "minecraft:polished_blackstone"],
    "minecraft:grass_block": ["minecraft:dirt", "minecraft:coarse_dirt"],
    "minecraft:dirt": ["minecraft:coarse_dirt"],
    "minecraft:mossy_cobblestone": ["minecraft:cobblestone"],
    "minecraft:chiseled_red_sandstone": ["minecraft:red_sandstone"],
    "minecraft:chiseled_sandstone": ["minecraft:sandstone"],
    // цепочка окисления меди — «омоложением» назад
    "minecraft:oxidized_copper": ["minecraft:weathered_copper", "minecraft:exposed_copper"],
    "minecraft:weathered_copper": ["minecraft:exposed_copper", "minecraft:copper_block"],
    "minecraft:exposed_copper": ["minecraft:copper_block"],
    "minecraft:oxidized_cut_copper": ["minecraft:weathered_cut_copper", "minecraft:exposed_cut_copper"],
    "minecraft:weathered_cut_copper": ["minecraft:exposed_cut_copper", "minecraft:cut_copper"],
    "minecraft:exposed_cut_copper": ["minecraft:cut_copper"]
};

const DEFAULT_PROTECTED = new Set([
    "minecraft:bedrock",
    "minecraft:barrier",
    "minecraft:command_block",
    "minecraft:chain_command_block",
    "minecraft:repeating_command_block",
    "minecraft:structure_block",
    "minecraft:jigsaw"
]);

function breakBlockWithLoot(dim, loc) {
    // Используем destroy, чтобы выпали дропы
    dim.runCommand(`setblock ${loc.x} ${loc.y} ${loc.z} air destroy`);
}

/**
 * Ослабление блока: либо замена (setType), либо полный слом (runCommand destroy).
 * @param {Block} block
 * @param {Dimension} dim
 * @param {BlockLocation} loc
 * @param {number} steps
 * @returns {boolean} true если блок изменён
 */
function degradeBlock(block, dim, loc, steps = 1) {
    const chain = DAMAGE_CHAINS[block.typeId];
    if (!chain || chain.length === 0) {
        // если для блока нет цепочки деградации — считаем что его можно просто сломать
        breakBlockWithLoot(dim, loc);
        return true;
    }

    // берём нужный этап из цепочки
    const idx = Math.min(steps - 1, chain.length - 1);
    const nextId = chain[idx];

    if (nextId === "minecraft:air") {
        // для "воздуха" ломаем с дропами
        breakBlockWithLoot(dim, loc);
    } else {
        // для трещин/ослаблений — просто заменяем
        block.setType(nextId);
    }

    return true;
}

/**
 * Реалистичный взрыв с falloff и стадиями разрушения.
 * @param {Entity} entity - источник взрыва
 * @param {number} power - множитель 0..∞, влияет на «глубину» повреждений
 * @param {number} radius - радиус в блоках
 * @param {object} opts - настройки производительности/поведения
 */
export function explosion(entity, power = 1, radius = 8, opts = {}) {
    const {
        // геометрия/плавность
        yWeight = 0.80,      // <1 — воронка более «приплюснута» по вертикали
        falloffK = 1.35,     // экспонента кривой убывания урона с расстоянием
        noise = 0.10,        // +/- процент «зазубренности» края
        // эффекты/ванильная физика
        createFx = true,     // ванильный звук/частицы/нокаут без разрушения блоков
        allowUnderwater = true,
        // разрушение
        dropItems = false,   // true = через setblock ... air destroy (медленнее, но с дропами)
        protectedTypes = DEFAULT_PROTECTED,
        // производительность
        batchSize = 1500     // сколько блоков трогать за тик
    } = opts;

    const { x, y, z } = entity.location;
    const dim = entity.dimension;

    // ограничивающий бокс по радиусу
    const from = { x: Math.floor(x - radius), y: Math.max(-64, Math.floor(y - radius)), z: Math.floor(z - radius) };
    const to = { x: Math.floor(x + radius), y: Math.min(319, Math.floor(y + radius)), z: Math.floor(z + radius) };
    const volume = new BlockVolume(from, to);

    // фильтруем воздух и недеструктаблы сразу, бежим только по загруженным чанкам
    const blockFilter = {
        excludeTypes: Array.from(protectedTypes).concat(["minecraft:air"])
    };

    // allowUnloadedChunks=true — API сам тихо пропустит выгруженное. :contentReference[oaicite:3]{index=3}
    const listVolume = dim.getBlocks(volume, blockFilter, true); // :contentReference[oaicite:4]{index=4}
    const iterator = listVolume.getBlockLocationIterator();      // :contentReference[oaicite:5]{index=5}

    const r2 = radius * radius;

    const processBatch = () => {
        let processed = 0;

        for (const loc of iterator) {
            if (++processed > batchSize) { system.run(processBatch); return; } // не блокируем тики. :contentReference[oaicite:6]{index=6}

            // сферический falloff с «сплющенной» высотой
            const dx = loc.x + 0.5 - x;
            const dy = (loc.y + 0.5 - y) * yWeight;
            const dz = loc.z + 0.5 - z;
            const d2 = dx * dx + dy * dy + dz * dz;
            if (d2 > r2) continue;

            // нормализованная дистанция и плавная кривая урона
            const d = Math.sqrt(d2) / radius;             // 0..1
            let p = Math.max(0, 1 - Math.pow(d, falloffK)); // базовая «сила» в точке
            // неровность контура, чтобы «дырка» была живой
            const jitter = (hash3i(loc.x, loc.y, loc.z) - 0.5) * 2 * noise; // -noise..+noise
            p = (p * (1 + jitter)) * power;

            const block = dim.getBlock(loc);
            if (!block || !block.isValid || block.isAir) continue; // быстрая отсечка. :contentReference[oaicite:7]{index=7}

            // 4 стадии (пороговые значения можно тюнить через power/falloffK)
            if (p > 0.80) {
                // сильная зона — всегда ломаем (lootMode переключается через dropItems)
                if (dropItems) {
                    breakBlockWithLoot(dim, loc);
                } else {
                    block.setType("minecraft:air");
                }
                continue;
            }

            if (p > 0.55) { // сильные трещины / осыпание
                if (!degradeBlock(block, dim, loc, 2) && p > 0.65) {
                    breakBlockWithLoot(dim, loc);
                }
                continue;
            }

            if (p > 0.35) { // лёгкие трещины
                degradeBlock(block, dim, loc, 1);
                continue;
            }

            if (p > 0.18) { // редкие «сколы»
                if (hash3i(loc.x * 3, loc.y * 5, loc.z * 7) > 0.70) {
                    degradeBlock(block, dim, loc, 1);
                }
            }

        }
    };

    system.run(processBatch); // стартуем джоб. :contentReference[oaicite:10]{index=10}
}
