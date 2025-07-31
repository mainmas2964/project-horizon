import { world, system } from "@minecraft/server";
import { Origin, openOriginSelectionMenu, openOriginConfirmMenu, OriginManager } from "./Origin.js"
import { ClassManager, openAvailableClassMenu, openClassConfirmMenu, PlayerClass } from "./PlayerClass.js"
import { ActionFormData, ModalFormData, MessageFormData } from "@minecraft/server-ui";
const originManager = new OriginManager();
const classManager = new ClassManager()
export { originManager, classManager }
system.runInterval(() => {
  for (const player of world.getPlayers()) {
    const tags = player.getTags()
    for (const tag of tags) {
      switch (tag) {
        case "firer": {
          player.addEffect("fire_resistance", 300, { showParticles: false })
        } break;
        case "nostingers": {
          player.addEffect("slowness", 300, { showParticles: false })
          player.addEffect("poison", 300, { showParticles: false })
        } break;
        case "morehealth": {
          player.addEffect("health_boost", 300, { amplifier: 1, showParticles: false })
        }
      }
    }
  }
}, 100)
world.afterEvents.itemUse.subscribe(event => {
  if (event.itemStack.typeId === "horizon:scroll_of_oc") {
    if (event.source.hasTag("en")) {
      openOriginSelectionMenu(event.source, originManager, classManager, "en")
    }
    else if (event.source.hasTag("ru")) {
      openOriginSelectionMenu(event.source, originManager, classManager, "ru")
    }
    else {
      const form = new MessageFormData()
        .title("lang/язык")
        .body("choose language n/выберите язык")
        .button1("русский")
        .button2("english")
      form.show(event.source).then(res => {
        if (res.selection === 0) {
          event.source.addTag("ru")
          openOriginSelectionMenu(event.source, originManager, classManager, "ru");
        }
        else if (res.selection === 1) {
          event.source.addTag("en");
          openOriginSelectionMenu(event.source, originManager, classManager, "en");
        }
      })
    }
    // после выбора откроется меню классов
  }
});
originManager.register(new Origin({
  id: "predecessor",
  tags: ["predecessor"],
  availableClasses: ["prospector", "redstone_engineer", "mechanist"]

}))
originManager.register(new Origin({
  id: "bee",
  tags: ["bee_origin"],
  availableClasses: ["prospector", "redstone_engineer", "mechanist"],
  dynamicProperties: {
    "stingers": 7
  }


}))
originManager.register(new Origin({
  id: "demon",
  tags: ["demon", "firer"],
  availableClasses: ["prospector", "redstone_engineer", "mechanist"]
}))
/*
originManager.register(new Origin({
  id: "portal_guard",
  tags: ["portal_guard", "guard", "mage"],
  availableClasses: ["prospector", "redstone_engineer"]
}))
*/
classManager.register(new PlayerClass({
  id: "prospector",
  tags: ["prospector", "basicCraft1", "morehealth"],
  availableAbilities: ["teleportation"]

}));
classManager.register(new PlayerClass({
  id: "redstone_engineer",
  tags: ["engineer", "redstone_engineer", "engineer_level_r", "engineer_level_c"],
  availableAbilities: ["redstone_impulse"],
  dynamicProperties: {
    "charge": 0
  }
}))
classManager.register(new PlayerClass({
  id: "mechanist",
  tags: ["mechanist", "engineer_level_c", "engineer_level_r"],
  availableAbilities: ["drone_station_t1"]
}))









const abilitiesIcons = {
  "teleportation": {
    icon: "textures/items/teleportation",
    name: "Teleportation"
  }
}
world.afterEvents.itemUse.subscribe(event => {
  if (event.itemStack.typeId != "horizon:abilities_tablet") return;
  const classp = classManager.getPlayerClass(event.source);
  if (!classp || !Array.isArray(classp.availableAbilities)) {
    console.warn("Invalid player class or missing abilities list");
    return;
  }

  const abilitiesList = classp.availableAbilities
  let abui = new ActionFormData
  abui.title("Origin choosing \n выбор происхождения")
  abui.body("");

  for (const key of abilitiesList) {
    abui.button(abilitiesIcons[key].name)
  }
})