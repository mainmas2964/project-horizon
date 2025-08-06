import { world, system } from "@minecraft/server";
import { consumeUsedItem, countItems, removeItems, spawnSpiderbot, addAction, consumeUsedItemNew } from "./utilities/core_utilities.js"
import { ActionFormData, ModalFormData, MessageFormData } from "@minecraft/server-ui";
import { openAvailableClassMenu, openClassConfirmMenu } from "./PlayerClass.js"
import { originsLoc } from "./texts.js"
export class Origin {
  constructor({ id, name, tags = [], effects = [], onJoin = null, availableClasses = [], dynamicProperties = {} }) {
    this.id = id;
    this.name = name;
    this.tags = tags;
    this.effects = effects;
    this.availableClasses = availableClasses;
    this.dynamicProperties = dynamicProperties;

  }

  applyTo(player, loc) {
    player.addTag(this.id);
    for (const tag of this.tags) {
      player.addTag(tag);
    }

    for (const [key, value] of Object.entries(this.dynamicProperties)) {
      player.setDynamicProperty(key, value);
    }

    player.sendMessage(`§a [ You have chosen §b${originsLoc[loc][this.id].name} origin ]`);
  }


  removeFrom(player) {
    player.removeTag(this.id);
    for (const tag of this.tags) {
      player.removeTag(tag);
    }

    for (const effect of this.effects) {
      player.removeEffect(effect.id);
    }

    for (const key of Object.keys(this.dynamicProperties)) {
      player.setDynamicProperty(key, undefined); // Или 0/null, в зависимости от типа
    }
  }


}
export class OriginManager {
  constructor() {
    this.origins = {}; // { id: Origin }
    this.playerOrigins = new Map();
  }

  register(origin) {
    this.origins[origin.id] = origin;
  }

  getOriginById(id) {
    return this.origins[id] ?? null;
  }
  getPlayerOrigin(player) {
    for (const origin of Object.values(this.origins)) {
      if (player.getTags().includes(origin.id)) return origin;
    }
    return null;
  }



  assignToPlayer(player, originId, loc) {
    const newOrigin = this.getOriginById(originId);
    if (!newOrigin) {
      player.sendMessage(`§cOrigin "${originId}" не найден.`);
      return;
    }


    const current = this.getPlayerOrigin(player);
    if (current) {
      current.removeFrom(player);
    }

    newOrigin.applyTo(player, loc);
    this.playerOrigins.set(player.id, originId);
  }
  clearPlayerOrigin(player) {
    const current = this.getPlayerOrigin(player);
    if (current) {
      current.removeFrom(player);
      this.playerOrigins.delete(player.id);
      player.sendMessage("§cOrigin is deleted");
    }
  }
  listOrigins() {
    return Object.values(this.origins);
  }

  reinitializeAllOrigins() {
    for (const origin of Object.values(this.origins)) {
      origin.unregisterAllEvents();
    }
  }
}

export function openOriginSelectionMenu(player, originManager, classManager, loc) {
  const form = new ActionFormData()
    .title("Origin choosing \n выбор происхождения")
    .body("");

  const originslist = originManager.listOrigins();
  for (const origin of originslist) {
    form.button(originsLoc[loc][origin.id].name);
  }

  form.show(player).then(res => {
    if (res.canceled) return;
    const selectedOrigin = originslist[res.selection];
    if (!selectedOrigin) return;
    openOriginConfirmMenu(player, selectedOrigin, originManager, classManager, loc);

  });
}
export function openOriginConfirmMenu(player, origin, originManager, classManager, loc) {
  const form = new MessageFormData()
    .title(`Origin: ${originsLoc[loc][origin.id].name}`)
    .body(`§f${originsLoc[loc][origin.id].description}`)
    .button1("§a✔")
    .button2("§c✖");

  form.show(player).then(res => {
    if (res.canceled || res.selection === 1) {
      openOriginSelectionMenu(player, originManager); // Назад к списку
      return;
    }
    if (res.selection === 0) {
      originManager.assignToPlayer(player, origin.id, loc)
      const id = {
        id: "horizo"
      }
      if (origin.availableClasses?.length > 0) {
        consumeUsedItemNew(player, 1)
        openAvailableClassMenu(player, origin.availableClasses, classManager, loc);
      }
    }
  });
}