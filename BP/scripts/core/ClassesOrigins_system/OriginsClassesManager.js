import { world, system } from "@minecraft/server";
import { Origin, openOriginSelectionMenu, openOriginConfirmMenu, OriginManager } from "./Origin.js"
import { ClassManager, openAvailableClassMenu, openClassConfirmMenu, PlayerClass } from "./PlayerClass.js"
import { ActionFormData, ModalFormData, MessageFormData } from "@minecraft/server-ui";
import { consumeUsedItem, countItems, removeItems, spawnSpiderbot, addAction, FlowerIDs } from "core/utilities/core_utilities.js"
const originManager = new OriginManager();
const classManager = new ClassManager()
import "./register/classes.js"
import "./register/origins.js"
import "./Abilities.js"
export { originManager, classManager }
import { registerClass } from "./register/classes.js"
import { registerOrigin } from "./register/origins.js"
import { TickTaskScheduler } from "core/tickSystem/tick.js"
const scheduler = new TickTaskScheduler({ maxTasksPerTick: 15, metaKey: "horizon:originsclasses_manager", saveKey: "horizon:originsclasses_manager_save" })

const effectKey = {
  "firer": {
    effect: "fire_resistance",
    duration: 200,
    amplifier: 1,
    showparticles: false
  },
  "nostingers": {
    effect: "fatal_poison",
    duration: 200,
    amplifier: 1,
    showparticles: false
  },
  "morehealth": {
    effect: "health_boost",
    duration: 200,
    amplifier: 1,
    showparticles: false
  },
  "robot": {
    effect: "saturation",
    duration: 200,
    amplifier: 1,
    showparticles: false
  }
}
export { scheduler }
scheduler.registerTaskFactory("effects", (data, resolveTarget) => {
  return (target) => {
    if (!target) return true;
    target.addEffect(data.effect, data.duration, { amplifier: data.amplifier, showParticles: false });
    if (!target.hasTag(data.key)) return false;
    return true;
  };
});
scheduler.registerTaskFactory("tick_task", (data, resolveTarget) => {
  return () => {
    world.sendMessage("Task1");
    return true; // оставляем задачу
  };
});
scheduler.registerTaskFactory("bee_nectar_collecting", (data, resolveTarget) => {
  return (target) => {
    if (!target.isSneaking || !FlowerIDs.includes(target.dimension.getBlock(target.location).typeId)) return false;
    scheduler.resolveCurrentData(data.id, ["data", "timer"], data.timer + 1)
    if (data.timer >= 10) {
      console.warn("hello")
    }
    return true;
  }
})
scheduler.loadTasks()


// 2. Добавляем задачу при использовании предмета

function processEffects(player, key) {
  scheduler.addTask(null, {
    delay: 1,
    repeat: 5,
    priority: "normal",
    persist: true,
    type: "effects",
    data: {
      effect: effectKey[key].effect,
      duration: effectKey[key].duration,
      amplifier: effectKey[key].amplifier,
      key: key
    },
    customId: `effect_${effectKey[key].effect}_${player.id}`,
    replace: true,
    target: player
  });
}
export { processEffects, effectKey }

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
world.afterEvents.playerJoin.subscribe(data => {
  const player = world.getEntity(data.playerId)
  for (const tag of player.getTags()) {
    player.addTag(tag);
    if (!effectKey[tag]) continue;
    processEffects(player, tag)

  }
})
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
registerClass(classManager)
registerOrigin(originManager)