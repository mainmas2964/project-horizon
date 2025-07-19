import { system, world, Player } from "@minecraft/server";
import { startSculkSpread } from "./sculk_infection.js";

const SCULK_RADIUS = 2; // Радиус заражения
const DAMAGE_RADIUS = 4; // Радиус урона
const DAMAGE_AMOUNT = 5; // Урон (количество сердец)
const DURABILITY_LOSS = 5; // Сколько прочности теряет клинок при использовании
const SCULK_PARTICLES = ["sculk_charge", "sculk_spread"]; // Частицы скалка
const CUSTOM_PARTICLE = "horizon:sculk_xpls"; // Кастомная частица

// Подписываемся на событие использования предмета
world.afterEvents.itemUse.subscribe((event) => {
    const { itemStack, source } = event;

    if (itemStack.typeId !== "horizon:dagger_steel_triple_sculk") return;
    if (!(source instanceof Player)) return;

    const dimension = source.dimension;
    const pos = source.location;


    // Заражаем блоки скалком
    const centerBlock = dimension.getBlock({ x: Math.floor(pos.x), y: Math.floor(pos.y) - 1, z: Math.floor(pos.z) });
    if (centerBlock) {
        startSculkSpread(centerBlock, {
            radius: SCULK_RADIUS,
            speed: 5,
            count: 2,
            maxSpread: 15
        });

        for (const particle of SCULK_PARTICLES) {
            spawnParticles(dimension, pos, particle, 10);
        }
        spawnParticles(dimension, pos, CUSTOM_PARTICLE, 5);
    }

    // Наносим урон существам в радиусе
    damageNearbyEntities(source, DAMAGE_RADIUS, DAMAGE_AMOUNT);

    //Уменьшаем прочность предмета
    reduceItemDurability(source, itemStack, DURABILITY_LOSS);
});

/**
 * Наносит урон сущностям в радиусе и испускает частицы
 */
function damageNearbyEntities(player, radius, damage) {
    const dimension = player.dimension;
    const entities = dimension.getEntities({
        location: player.location,
        maxDistance: radius,
        excludeTypes: ["player"]
    });

    for (const entity of entities) {
        entity.applyDamage(damage);

        spawnParticles(dimension, entity.location, CUSTOM_PARTICLE, 5);
    }
}

/**
 * Создаёт частицы в указанной точке
 */
function spawnParticles(dimension, position, particleId, count) {
    for (let i = 0; i < count; i++) {
        let offsetX = (Math.random() - 0.5) * 2;
        let offsetY = Math.random();
        let offsetZ = (Math.random() - 0.5) * 2;

        dimension.spawnParticle(particleId, {
            x: position.x + offsetX,
            y: position.y + offsetY,
            z: position.z + offsetZ
        });
    }
}


function reduceItemDurability(player, itemStack, amount) {
    const durability = itemStack.getComponent("minecraft:durability");
    if (!durability) return;

    durability.damage += amount; // Уменьшаем прочность    console.warn(`[DEBUG] Прочность клинка уменьшена: ${durability.damage}/${durability.maxDurability}`);

    if (durability.damage >= durability.maxDurability) {
        player.getComponent("minecraft:inventory").container.setItem(player.selectedSlot, undefined);
    }
}