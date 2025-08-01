import { world, system } from "@minecraft/server";
import { ActionFormData, ModalFormData, MessageFormData } from "@minecraft/server-ui";
import { classLoc } from "./texts.js"
import { clearAbilites } from "./abilities.js"
export class PlayerClass {
  constructor({ id, name, description, tags = [], effects = [], dynamicProperties = {}, availableAbilities = [] }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.tags = tags;
    this.effects = effects;
    this.dynamicProperties = dynamicProperties;
    this.availableAbilities = availableAbilities
  }
  //none commit 00000

  applyTo(player, loc) {
    player.addTag(this.id);
    for (const tag of this.tags) {
      player.addTag(tag);
    }

    for (const [key, value] of Object.entries(this.dynamicProperties)) {
      player.setDynamicProperty(key, value);
    }

    if (this.onPick) this.onPick(player);
    player.sendMessage(`§a[You chosen §b${classLoc[loc][this.id].name} class ]`);
  }

  removeFrom(player) {
    player.removeTag(this.id);
    for (const tag of this.tags) {
      player.removeTag(tag);
    }
    clearAbilites(player)
    for (const effect of this.effects) {
      player.removeEffect(effect.id);
    }

    for (const key of Object.keys(this.dynamicProperties)) {
      player.setDynamicProperty(key, undefined); // Или подходящее значение
    }

    player.removeTag("guideUC_horizon");
  }

}
export class ClassManager {
  constructor() {
    this.classes = {};
  }

  register(cls) {
    this.classes[cls.id] = cls;
  }

  getById(id) {
    return this.classes[id];
  }

  getPlayerClass(player) {
    for (const cls of Object.values(this.classes)) {
      if (player.getTags().includes(cls.id)) return cls;
    }
    return null;
  }

  assignClassToPlayer(player, classId, loc) {
    const newClass = this.getById(classId);
    if (!newClass) {
      player.sendMessage(`§c [ Class "${classId}" is not defined ]`);
      return;
    }

    const current = this.getPlayerClass(player);
    if (current) current.removeFrom(player);

    newClass.applyTo(player, loc);
  }

  listClasses() {
    return Object.values(this.classes);
  }
}
export function openAvailableClassMenu(player, allowedClassIds, classManager, loc) {
  const form = new ActionFormData()
    .title("class choosing")
    .body("Choose class:");

  const availableClasses = allowedClassIds
    .map(id => classManager.getById(id))
    .filter(Boolean);

  for (const cls of availableClasses) {
    form.button(classLoc[loc][cls.id].name);
  }

  form.show(player).then(res => {
    if (res.canceled) return;

    const selectedClass = availableClasses[res.selection];
    if (selectedClass) {
      openClassConfirmMenu(player, selectedClass, classManager, allowedClassIds, loc);
    }
  });
}
export function openClassConfirmMenu(player, cls, classManager, allowedClassids, loc) {
  const form = new MessageFormData()
    .title(`${classLoc[loc][cls.id].name}`)
    .body(`§f${classLoc[loc][cls.id].description}`)
    .button1("§a✔")
    .button2("§c✖");

  form.show(player).then(res => {
    if (res.canceled || res.selection === 1) {
      openAvailableClassMenu(player, allowedClassids, classManager, loc); // Назад к списку классов
      return;
    }
    if (res.selection === 0) {
      classManager.assignClassToPlayer(player, cls.id, loc)
    }
  });
}
