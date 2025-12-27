import { world, system } from "@minecraft/server"
import { ActionFormData, MessageFormData } from "@minecraft/server-ui"
import { classManager } from "./ClassesOrigins_system/OriginsClassesManager.js"
import { abilitiesLoc } from "./texts.js"

const abilitiesMain = {
    "teleportation": { icon: "textures/items/abilities/teleportation", item: "horizon:teleportation" },
    "redstone_impulse": { icon: "textures/items/abilities/redstone_impulse", item: "horizon:redstone_impulse" },
    "drone_station_t1": { icon: "textures/items/abilities/drone_station_t1", item: "horizon:drone_station_t1" },
    "builder_wand": { icon: "textures/items/builder_wand", item: "horizon:builder_wand" }
}

world.afterEvents.itemUse.subscribe(event => {
    if (event.itemStack.typeId != "horizon:abilities_tablet") return;

    const player = event.source;
    const classp = classManager.getPlayerClass(player);

    if (!classp || !Array.isArray(classp.availableAbilities)) {
        return;
    }
    //
    const maxSlots = classp.abilitySlots || 1;

    let loc = player.hasTag("ru") ? "ru" : "en";

    const mainMenu = new ActionFormData()
        .title("Abilities Manager")
        .body(loc === "ru" ? `Доступно слотов: ${maxSlots}` : `Available slots: ${maxSlots}`);

    mainMenu.button(loc === "ru" ? "Слот 1 (Основной)" : "Slot 1 (Primary)", "textures/ui/icon_setting");

    if (maxSlots >= 2) {
        mainMenu.button(loc === "ru" ? "Слот 2 (Вторичный)" : "Slot 2 (Secondary)", "textures/ui/icon_setting");
    } else {

        mainMenu.button(loc === "ru" ? "§8Слот 2 (Закрыто)" : "§8Slot 2 (Locked)", "textures/ui/lock_icon");
    }

    mainMenu.button(loc === "ru" ? "Очистить всё" : "Clear All", "textures/ui/cancel");

    mainMenu.show(player).then(res => {
        if (res.canceled) return;


        if (res.selection === 2) {
            clearAbilites(player);
            player.sendMessage(loc === "ru" ? "§eВсе способности удалены." : "§eAll abilities cleared.");
            return;
        }

        if (res.selection === 1 && maxSlots < 2) {
            player.sendMessage(loc === "ru" ? "§cВаш класс не может использовать вторую способность." : "§cYour class cannot use a second ability.");

            player.playSound("note.bass");
            return;
        }

        const slotId = res.selection + 1;

        showAbilitySelection(player, classp.availableAbilities, loc, slotId);
    });
});

function showAbilitySelection(player, abilitiesList, loc, slotId) {
    let abui = new ActionFormData();
    abui.title(loc === "ru" ? `Выбор: Слот ${slotId}` : `Select: Slot ${slotId}`);
    abui.body("");

    for (const key of abilitiesList) {
        let name = abilitiesLoc[loc][key].name;
        abui.button(name, abilitiesMain[key].icon);
    }

    abui.show(player).then(res => {
        if (res.canceled) return;

        const selectedAbilityKey = abilitiesList[res.selection];
        if (!selectedAbilityKey) return;

        const otherSlotId = slotId === 1 ? 2 : 1;
        const currentAbilityInOtherSlot = getAbilityFromSlot(player, otherSlotId);

        if (currentAbilityInOtherSlot === selectedAbilityKey) {
            player.sendMessage(loc === "ru" ? "§cЭта способность уже установлена в другом слоте!" : "§cThis ability is already equipped in the other slot!");
            return;
        }

        const form = new MessageFormData()
            .title(abilitiesLoc[loc][selectedAbilityKey].name)
            .body(abilitiesLoc[loc][selectedAbilityKey].description)
            .button1("§a✔")
            .button2("§c✖");

        form.show(player).then(confirmRes => {
            if (confirmRes.canceled || confirmRes.selection === 1) return;

            if (confirmRes.selection === 0) {
                applyAbility(player, selectedAbilityKey, slotId);
                player.sendMessage(loc === "ru" ? `§aСпособность установлена в Слот ${slotId}!` : `§aAbility set to Slot ${slotId}!`);
            }
        });
    });
}

function applyAbility(player, abilityKey, slotId) {
    const oldAbilityKey = getAbilityFromSlot(player, slotId);

    if (oldAbilityKey && abilitiesMain[oldAbilityKey]) {
        player.runCommand(`clear "${player.name}" ${abilitiesMain[oldAbilityKey].item}`);
        player.removeTag(`ability_slot_${slotId}:${oldAbilityKey}`);
    }

    player.runCommand(`give "${player.name}" ${abilitiesMain[abilityKey].item} 1 0 { "item_lock": {"mode":"lock_in_inventory"}, "keep_on_death":{} }`);

    player.addTag(`ability_slot_${slotId}:${abilityKey}`);
}


function getAbilityFromSlot(player, slotId) {
    const tags = player.getTags();
    const prefix = `ability_slot_${slotId}:`;

    for (const tag of tags) {
        if (tag.startsWith(prefix)) {
            return tag.replace(prefix, "");
        }
    }
    return null;
}

function clearAbilites(player) {
    for (const key in abilitiesMain) {
        player.runCommand(`clear "${player.name}" ${abilitiesMain[key].item}`);
    }
    const tags = player.getTags();
    for (const tag of tags) {
        if (tag.startsWith("ability_slot_1:") || tag.startsWith("ability_slot_2:")) {
            player.removeTag(tag);
        }
    }
}

export { clearAbilites }