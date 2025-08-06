
import { world, system } from "@minecraft/server"






const RedstoneOres = ["minecraft:redstone_ore", "minecraft:deepslate_redstone_ore"]
const FlowerIDs = [
    "minecraft:dandelion",
    "minecraft:poppy",
    "minecraft:blue_orchid",
    "minecraft:allium",
    "minecraft:azure_bluet",
    "minecraft:red_tulip",
    "minecraft:orange_tulip",
    "minecraft:white_tulip",
    "minecraft:pink_tulip",
    "minecraft:oxeye_daisy",
    "minecraft:cornflower",
    "minecraft:lily_of_the_valley",
    "minecraft:sunflower",
    "minecraft:rose_bush",
    "minecraft:peony",
    "minecraft:lilac"
];
export function consumeUsedItemNew(player, amount = 1) {
    const equip = player.getComponent("minecraft:equippable");
    if (!equip) return false;

    const heldItem = equip.getEquipment("Mainhand");
    if (!heldItem) return false;

    // Копия и уменьшение количества используемых предметов
    if (heldItem.amount > amount) {
        heldItem.amount -= amount;
        equip.setEquipment("Mainhand", heldItem);
        return true;
    } else if (heldItem.amount === amount) {
        equip.setEquipment("Mainhand", undefined);
        return true;
    }

    return false; // недостаточно предметов
}
export function consumeUsedItem(player, usedStack, amount = 1) {
    const inv = player.getComponent("minecraft:inventory")?.container;
    if (!inv) return false;

    let toRemove = amount;

    for (let i = 0; i < inv.size; i++) {
        const slot = inv.getItem(i);
        if (!slot || slot.typeId !== usedStack.typeId) continue;
        if (!slot.isStackableWith(usedStack)) continue;

        if (slot.amount > toRemove) {
            slot.amount -= toRemove;
            inv.setItem(i, slot);
            return true;
        } else {
            toRemove -= slot.amount;
            inv.setItem(i, undefined);
            if (toRemove <= 0) return true;
        }
    }

    return false;
}


export function countItems(inventory, itemType) {
    let count = 0;
    for (let i = 0; i < inventory.size; i++) {
        let item = inventory.getItem(i);
        if (item && item.typeId === itemType) count += item.amount;
    }
    return count;
}


export function removeItems(inventory, itemType, amount) {
    for (let i = 0; i < inventory.size; i++) {
        let item = inventory.getItem(i);
        if (item && item.typeId === itemType) {
            if (item.amount > amount) {
                item.amount -= amount;
                inventory.setItem(i, item);
                return;
            } else {
                amount -= item.amount;
                inventory.setItem(i, undefined);
            }
        }
    }
}


export function hasKeyword(typeId, keywords) {
    const id = typeId.toLowerCase();
    return keywords.some(keyword => id.includes(keyword));
}


function classifyBlock(typeId) {
    const id = typeId.toLowerCase();
    if (stoneKeywords.some(k => id.includes(k))) return "stone";
    if (id.includes("ore")) return "ore";
    return "other";
}

export function addAction(player, text) {
    player.dimension.runCommand(`title ${player.name} actionbar ${text}`)
}

export function spawnSpiderbot(dimension, block, player, tag) {
    dimension.spawnParticle("horizon:spidermine_spawn_particle", block.center());
    dimension.playSound("horizon:spidermine_spawn", block.center())

    system.runTimeout(() => {
        const bot = dimension.spawnEntity("horizon:spiderbot_hybrid_t1", block.center());
        bot.getComponent("minecraft:tameable").tame(player);
        bot.addTag(tag); // уникальный тег, привязанный к игроку
    }, 6);
}

export function isWeapon(typeId) {
    const id = typeId.toLowerCase();
    return ["sword", "axe", "dagger", "mace", "blade", "weapon", "katana"].some(k => id.includes(k));
}
export function getWeaponTier(typeId) {
    const id = typeId.toLowerCase();

    if (hasKeyword(id, ["netherite"])) return 3;
    if (hasKeyword(id, ["diamond"])) return 2;
    if (hasKeyword(id, ["iron"])) return 2;
    if (hasKeyword(id, ["stone"])) return 1.2;
    if (hasKeyword(id, ["wood", "wooden"])) return 1;
    if (hasKeyword(id, ["steel"])) return 1.4;
    if (hasKeyword(id, ["copper"])) return 1.1;
    if (hasKeyword(id, ["redstone"])) return 1.6;



    return 0;
}