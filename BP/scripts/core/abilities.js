import { world, system } from "@minecraft/server"
import { ActionFormData, MessageFormData } from "@minecraft/server-ui"
import { ClassManager } from "./PlayerClass.js"
import { classManager } from "./OriginsClassesManager.js"
import { abilitiesLoc } from "./texts.js"
const abilitiesMain = {
    "teleportation": {
        icon: "textures/items/teleportation",
        name: "Teleportation",
        description: "Ability that allow teleport to you",
        item: "horizon:teleportation"
    }
}
world.afterEvents.itemUse.subscribe(event => {
    if (event.itemStack.typeId != "horizon:abilities_tablet") return;
    const classp = classManager.getPlayerClass(event.source);
    if (!classp || !Array.isArray(classp.availableAbilities)) {
        console.warn("Invalid player class or missing abilities list");
        return;
    }
    let loc
    if (event.source.hasTag("ru")) loc = "ru"
    if (event.source.hasTag("en")) loc = "en"
    const abilitiesList = classp.availableAbilities
    let abui = new ActionFormData
    abui.title("Abilities select")
    abui.body("");

    for (const key of abilitiesList) {
        abui.button(abilitiesLoc[loc][key].name, abilitiesMain[key].icon)
    }
    abui.show(event.source).then(res => {
        if (res.canceled) return;
        const selectedAbility = abilitiesList[res.selection];
        if (!selectedAbility) return;
        const form = new MessageFormData()
            .title(abilitiesLoc[loc][selectedAbility].name)
            .body(abilitiesLoc[loc][selectedAbility].description)
            .button1("§a✔")
            .button2("§c✖");
        form.show(event.source).then(res => {
            if (res.canceled || res.selection === 1) {
                return;
            }
            if (res.selection === 0) {
                applyAbility(event.source, selectedAbility)
            }

        });
    })
})
function applyAbility(player, ability) {
    for (const key in abilitiesMain) { player.dimension.runCommand(`clear ${player.name} ${abilitiesMain[key].item}`) }
    player.dimension.runCommand(`give ${player.name} ${abilitiesMain[ability].item} 1 0 { "item_lock": {"mode":"lock_in_inventory"} }`)
}
function clearAbilites(player) {
    for (const key in abilitiesMain) { player.dimension.runCommand(`clear ${player.name} ${abilitiesMain[key].item}`) }
}