import { world } from "@minecraft/server";

// === Установка цели при размещении алмазного блока ===
world.afterEvents.playerPlaceBlock.subscribe((event) => {
    if (event.block.typeId === "minecraft:diamond_block") {
        const pos = event.block.location;
        world.setDynamicProperty("sculkTarget", JSON.stringify(pos)); // Сохраняем координаты
        event.player.sendMessage(`§aЦель Sculk установлена: ${pos.x}, ${pos.y}, ${pos.z}`);
        console.warn(`[DEBUG] sculkTarget сохранён: ${JSON.stringify(pos)}`);
    }
});

// === Удаление цели при разрушении алмазного блока ===
world.afterEvents.playerBreakBlock.subscribe((event) => {
    if (event.block.typeId === "minecraft:diamond_block") {
        world.setDynamicProperty("sculkTarget", null); // Удаляем цель
        event.player.sendMessage("§cЦель Sculk удалена.");
        console.warn("[DEBUG] sculkTarget удалён.");
    }
});

// === Получение текущей цели Sculk ===
export function getTarget() {
    try {
        const target = world.getDynamicProperty("sculkTarget");
        return target ? JSON.parse(target) : null;
    } catch (error) {
        console.error("[ERROR] Не удалось получить sculkTarget!", error);
        return null;
    }
}