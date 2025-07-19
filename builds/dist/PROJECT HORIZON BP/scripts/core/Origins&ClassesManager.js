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
  name: "Predecessor",
  tags: ["predecessor"],
  availableClasses: ["prospector", "redstone_engineer"]

}))
originManager.register(new Origin({
  id: "bee",
  name: "Bee",
  description: "A bee, you can eat a flowers , and produce a honey",
  tags: ["bee_origin"],
  availableClasses: ["prospector", "redstone_engineer"],
  dynamicProperties: {
    "stingers": 7
  }


}))
originManager.register(new Origin({
  id: "demon",
  name: "Demon",
  description: "A demonic origin\n\n Passive : \n\n §b[ Fire resistance ] \n\n you already have a fire resistance [ don't work on cursed/ash fire ] \n\n §5Abilities \n\n [ A fire strength ] \n\n you can do an a fire attack with 25% chance",
  tags: ["demon", "firer"],
  availableClasses: ["prospector", "redstone_engineer"]
}))
classManager.register(new PlayerClass({
  id: "prospector",
  name: "Prospector",
  description: "A basic class",
  tags: ["prospector", "basicCraft1"],
  availableAbilities: ["teleportation"]

}));
classManager.register(new PlayerClass({
  id: "redstone_engineer",
  name: "Redstone engineer",
  description: "Redstone engineers very good at redstone, as well as automation! \n\n§b[ Passive ] : \n\n§c[ Redstone powered ] \n\n§5if you using a Redstone block, you will get an a §ySpeed and strength §5 effect \n\n[ More redstone and components ]\n\n§rWith 60% chance you mine a more dust from Redstone ore \n\n§b[Mobile workbench T-REdst] \n\n§5Redstone components \n\nComponents for utilitycraft addon (experimental)",
  tags: ["engineer", "redstone_engineer"]
}))









