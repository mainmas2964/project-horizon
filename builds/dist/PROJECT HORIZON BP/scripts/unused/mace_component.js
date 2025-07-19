import { world, EntityDamageCause, EquipmentSlot, ItemStack } from "@minecraft/server";

// pipiska
const MACE_ITEMS = ["horizon:heavy_chestplate_chestplate"]; // Список предметов
const DAMAGE_MULTIPLIER = 2.5; // Урон по сущностям при падении
const FALL_DAMAGE_REDUCTION = 0.5; // Уменьшение урона от падения 
const SEARCH_RADIUS = 3; // Радиус поиска сущностей
const PARTICLE_SMASH = "horizon:smash_ground_particle"; // jjjhshajanakkdkfjd

console.warn("Mace script loaded!");

// pipiska
world.afterEvents.entityHurt.subscribe(event => {
    let entity = event.hurtEntity;
    if (!entity || entity.typeId !== "minecraft:player") return;

    // Проверяем что  урон
    if (event.damageSource.cause !== EntityDamageCause.fall) return;

    // есть ли у игрока нагрудник из списка
    let chestItem = entity.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Chest);
    if (!chestItem || !MACE_ITEMS.includes(chestItem.typeId)) return;

    console.warn("Mace chestplate detected:", chestItem.typeId);

    // Получаем ничего
    let dimension = entity.dimension;

    // Получаем скорость падения
    let velocity = entity.getVelocity();
    let fallSpeed = Math.abs(velocity.y);

    // Уменьшаем урон от падения
    let reducedDamage = event.damage * FALL_DAMAGE_REDUCTION;
    entity.applyDamage(reducedDamage);

    console.warn("Reduced fall damage applied:", reducedDamage);

    // Получаем всех существ в радиусе SEARCH_RADIUS
    let position = entity.location;
    let entitiesAround = dimension.getEntities().filter(target => {
        let dx = target.location.x - position.x;
        let dy = target.location.y - position.y;
        let dz = target.location.z - position.z;
        let distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        return distance <= SEARCH_RADIUS && target.id !== entity.id;
    });

    console.warn("Entities found:", entitiesAround.length);

    // Добавляем кастомные частицы
    dimension.spawnParticle(PARTICLE_SMASH, position);

    // Наносим урон существам
    for (let target of entitiesAround) {
        target.applyDamage(fallSpeed * DAMAGE_MULTIPLIER);
        console.warn("Damage applied to:", target.typeId);
    }
});