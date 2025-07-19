import { world } from "@minecraft/server";

export function getBiomass(player) {
    if (!player) return 0;
    return world.getDynamicProperty(`sculkBiomass_${player.id}`) || 0;
}

export function setBiomass(player, value) {
    if (!player) return;
    world.setDynamicProperty(`sculkBiomass_${player.id}`, Math.max(0, value));
}

export function addBiomass(player, amount) {
    if (!player) return;
    setBiomass(player, getBiomass(player) + amount);
}

// === Пополнение биомассы при использовании echo_shard ===
world.afterEvents.itemUse.subscribe((event) => {
    const { itemStack, source: player } = event;

    if (itemStack?.typeId === "minecraft:echo_shard") {
        addBiomass(player, 500);
        player.sendMessage("§aВы получили +500 скалк-биомассы!");
    }
});