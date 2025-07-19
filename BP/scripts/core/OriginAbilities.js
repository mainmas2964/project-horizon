
import { world, system, ItemStack, EquipmentSlot, ItemTypes, BlockPermutation, ItemEnchantableComponent, EnchantmentTypes } from "@minecraft/server"
import { addAction } from "./dynamic_actionbar.js"
function consumeUsedItem(player, amount = 1) {
  const equip = player.getComponent("minecraft:equippable");
  if (!equip) return false;

  const heldItem = equip.getEquipment("Mainhand");
  if (!heldItem) return false;

  // Копия и уменьшение количества
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
export {
  consumeUsedItem
}
const stoneKeywords = ["stone", "cobble", "granite", "andesite", "diorite", "deepslate"];
function hasKeyword(typeId, keywords) {
  const id = typeId.toLowerCase();
  return keywords.some(keyword => id.includes(keyword));
}

function classifyBlock(typeId) {
  const id = typeId.toLowerCase();
  if (stoneKeywords.some(k => id.includes(k))) return "stone";
  if (id.includes("ore")) return "ore";
  return "other";
}

// ITEM USING
// BLOCK BREAK
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

const UseItemFunctionsMap = {
  "redstone_engineer": (data => {
    if (data.itemStack.typeId != "minecraft:redstone_block") return;
    data.source.addEffect("speed", 350, { showParticles: false, amplifier: 2 })
    data.source.addEffect("strength", 350, { showParticles: false, amplifier: 2 })
    consumeUsedItem(data.source, 1)
  }),
  "bee_origin": (data => {
    if (FlowerIDs.includes(data.itemStack.typeId)) {
      let stingers = data.source.getDynamicProperty("stingers")
      if (stingers >= 7) return;
      addAction(data.source, `§l§6 ${stingers + 1} (+1)`)
      data.source.setDynamicProperty("stingers", stingers + 1)
      data.source.addEffect("regeneration", 100)
      consumeUsedItem(data.source, 1)
      try { data.source.removeTag("nostingers") }
      catch { }
    }
    else if (FlowerIDs.includes(data.itemStack.typeId)) { addAction(data.source, "§l§6 7") }
  })
}
const UseItemCompleteFunctionsMap = {
  "predecessor": (data => {
    if (data.itemStack.typeId != "minecraft:cookie") return;
    data.source.addEffect("regeneration", 100, { amplifier: 2 })
  }),
  "bee_origin": (data => {
    if (data.itemStack.typeId != "minecraft:honey_bottle") return;
    data.source.addEffect("regeneration", 100, { amplifier: 2 })
  })
}
const HitEntityPlMap = {
  "bee_origin": (data => {
    if (data.damagingEntity.getVelocity().y > -0.1 || data.hitEntity.getEffect("fatal_poison")) return;
    let stingers = data.damagingEntity.getDynamicProperty("stingers")
    if (stingers > 0) {
      addAction(data.damagingEntity, `§l§6[ ${stingers - 1} (-1) ]`)
      data.hitEntity.addEffect("fatal_poison", 150, { amplifier: 2 });
      data.damagingEntity.setDynamicProperty("stingers", stingers - 1)
      if ((stingers - 1) > 0) return;
      data.damagingEntity.addTag("nostingers")
      data.hitEntity.applyDamage(90);
      data.damagingEntity.applyDamage(90)
    }
    else {
      addAction(data.damagingEntity, `§l§6[0! ]`)

    }
  })
}
const BreakBlockFunctionsMap = {
  "redstone_engineer": (data => {
    if (Math.random() > 0.90) return;
    if (!RedstoneOres.includes(data.block.typeId)) return;
    const redstone = new ItemStack("minecraft:redstone", 10)
    system.run(() => {
      data.block.dimension.spawnItem(redstone, data.block)
    })
  }),
  "predecessor": (data => {
    const blcl = classifyBlock(data.block.typeId)
    if (blcl != "other" && !data.itemStack.getComponent(ItemEnchantableComponent.componentId)?.getEnchantment("silk_touch")) {
      if (blcl === "stone" && Math.random() < 0.01) {
        system.run(() => {
          data.block.dimension.spawnEntity("minecraft:xp_orb", data.block.center())
        })
      }
      else if (blcl === "ore" && Math.random() < 0.3) {
        system.run(() => {
          data.block.dimension.spawnEntity("minecraft:xp_orb", data.block.center())
        })
      }
    }


  })
}
const InteractFunctionsMap = {
  "bee_origin": (data => {
    if (data.player.inputInfo.getButtonState("Sneak") != "Pressed" && !FlowerIDs.includes(data.block.typeid)) return;
    let stingers = data.player.getDynamicProperty("stingers")
    addAction(data.player, `§l§6${stingers + 1} (+1)`)
    data.player.setDynamicProperty("stingers", stingers + 1)
  })
}
const EntityHurtFunctionsMap = {
  "bee_origin": (data => {
    data.hurtEntity.applyDamage(2)
  }),
  "demon": (data => {
    if (Math.random() > 0.30) return;
    data.hurtEntity.addEffect("resistance", 150)
    const entities = data.hurtEntity.dimension.getEntities({ location: data.hurtEntity.location, maxDistance: 4 })
    for (const key of entities) {
      if (key.id === data.hurtEntity.id) continue;
      key.setOnFire(5);
      key.applyDamage(5);
    }
  })
}


function dispatchByTag(entity, map, event) {
  for (const tag of entity.getTags()) {
    const func = map[tag];
    if (func) func(event);
  }
}

world.beforeEvents.playerBreakBlock.subscribe(event => { dispatchByTag(event.player, BreakBlockFunctionsMap, event) })
world.afterEvents.itemUse.subscribe(e => dispatchByTag(e.source, UseItemFunctionsMap, e));
world.afterEvents.itemCompleteUse.subscribe(e => { dispatchByTag(e.source, UseItemCompleteFunctionsMap, e) })
world.afterEvents.entityHitEntity.subscribe(e => { dispatchByTag(e.damagingEntity, HitEntityPlMap, e) })
//world.afterEvents.playerInteractWithBlock.subscribe(event => { dispatchByTag(event.player, InteractFunctionsMap, event) })
world.afterEvents.entityHurt.subscribe(e => { dispatchByTag(e.hurtEntity, EntityHurtFunctionsMap, e) })
