import { world, system, ItemStack, EquipmentSlot, EntityDamageCause, BlockPermutation, ItemEnchantableComponent, BlockVolume, BlockVolumeBase, EntityTameableComponent } from "@minecraft/server"
// Механика улучшенной невидимости
import { consumeUsedItem, countItems, removeItems } from "core/utilities/core_utilities.js"
world.afterEvents.entityHitEntity.subscribe(event => {
  if (event.damagingEntity.getEffect("minecraft:invisibility")) {
    const effect = event.damagingEntity.getEffect("minecraft:invisibility").duration;
    if (event.damagingEntity.hasTag("horizon: adv_invisible")) {
      const invisible = event.damagingEntity.getEffect("minecraft:invisibility");
      event.damagingEntity.removeEffect("minecraft:invisibility");
      system.runTimeout(() => {
        event.damagingEntity.addEffect("minecraft:invisibility", effect, { amplifier: 1 })
      }, 50)
    } else {
      event.damagingEntity.removeEffect("minecraft:invisibility")
    }
  }
  else {
    return;
  }
});
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
function hasKeyword(id, keywords) {
  return keywords.some(keyword => id.includes(keyword));
}
function getWeaponTier(typeId) {
  const id = typeId.toLowerCase();

  if (hasKeyword(id, ["netherite"])) return 3;
  if (hasKeyword(id, ["diamond"])) return 2;
  if (hasKeyword(id, ["iron"])) return 2;
  if (hasKeyword(id, ["stone"])) return 1.2;
  if (hasKeyword(id, ["wood", "wooden"])) return 1;
  if (hasKeyword(id, ["steel"])) return 2.1;
  if (hasKeyword(id, ["copper"])) return 2.1;



  return 0;
}

function isWeapon(typeId) {
  const id = typeId.toLowerCase();
  return ["sword", "axe", "dagger", "mace", "blade", "weapon"].some(k => id.includes(k));
}

const TELEPORT_ITEM_ID = "horizon:teleportation";
const redstoneCraftedBlocks = [
  "minecraft:lever",
  "minecraft:redstone_torch",
  "minecraft:noteblock",
  "minecraft:tripwire_hook",
  "minecraft:redstone_lamp",
  "minecraft:piston",
  "minecraft:sticky_piston",
  "minecraft:target",
  "minecraft:dropper",
  "minecraft:dispenser",
  "minecraft:observer",
  "minecraft:redstone_block",
  "minecraft:crafter",
  "minecraft:detector_rail",
  "minecraft:unpowered_comparator",
  "minecraft:powered_comparator",
  "minecraft:unpowered_comparator",
  "minecraft:powered_repeater",
  "minecraft:unpowered_repeater",
  "minecraft:redstone_wire"
];

function spawnSpiderbot(dimension, block, player, tag) {
  dimension.spawnParticle("horizon:spidermine_spawn_particle", block.center());
  dimension.playSound("horizon:spidermine_spawn", block.center())

  system.runTimeout(() => {
    const bot = dimension.spawnEntity("horizon:spiderbot_hybrid_t1", block.center());
    bot.getComponent("minecraft:tameable").tame(player);
    bot.addTag(tag); // уникальный тег, привязанный к игроку
  }, 6);
}
world.beforeEvents.itemUse.subscribe(({ source: player, itemStack }) => {
  if (player.getItemCooldown("ability") > 0) return
  const tier = getWeaponTier(itemStack.typeId);
  const offhand = player.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Offhand);
  if (!isWeapon(itemStack.typeId)) return;
  if (!offhand || offhand.typeId !== TELEPORT_ITEM_ID) return;
  let inventory = player.getComponent("minecraft:inventory").container;
  if (countItems(inventory, "minecraft:lapis_lazuli") < 3) return;
  const targets = player.getEntitiesFromViewDirection({
    maxDistance: 10,
    maxResults: 1,
    excludeSpectators: true,
  });
  if (targets.length < 1) return
  const target = targets[0].entity;
  const playerPos = player.location;
  const targetPos = target.location;

  const dx = targetPos.x - playerPos.x;
  const dz = targetPos.z - playerPos.z;
  const len = Math.sqrt(dx * dx + dz * dz) || 1;

  const nearX = targetPos.x - dx / len;
  const nearZ = targetPos.z - dz / len;
  system.run(() => {
    player.dimension.spawnParticle("horizon:magic_particle_0", player.location)
    player.dimension.playSound("horizon:teleport", player.location)

    player.teleport({ x: nearX, y: targetPos.y, z: nearZ }, { checkForBlocks: false });
    player.dimension.playSound("horizon:teleport", player.location)
    player.dimension.spawnParticle("horizon:magic_particle_0", player.location)
    target.dimension.spawnParticle("horizon:katana_hurt", {
      x: target.location.x,
      y: target.location.y + 1,
      z: target.location.z
    })
    const damage = tier * 3 + 2;
    target.applyDamage(damage, { cause: EntityDamageCause.entityAttack, damagingEntity: player });
    player.playAnimation("animation.player.attack.swing", {
      blendOutTime: 0.1,
    });
    addCooldown(player, 25)
  })
  system.run(() => {
    removeItems(inventory, "minecraft:lapis_lazuli", 3)
  })
  system.runTimeout(() => {
    system.run(() => {
      player.dimension.spawnParticle("horizon:magic_particle_0", player.location)
      player.dimension.playSound("horizon:teleport", player.location)
      player.teleport(playerPos, { checkForBlocks: false });
      player.dimension.playSound("horizon:teleport", player.location)
      player.dimension.spawnParticle("horizon:magic_particle_0", player.location)
    })
  }, 10); // 0.5 секунды
  player.startItemCooldown("ability", 15)
});


/*      if (entities.length > 0 && getCooldown(player) === false) {
        const target = entities[0].entity;
        const dx = loc.x - target.location.x;
        const dz = loc.z - target.location.z;
        const length = Math.sqrt(dx * dx + dz * dz) || 1;

        player.teleport({
          x: target.location.x + dx / length,
          y: target.location.y,
          z: target.location.z + dz / length
        }, { checkForBlocks: false });
        player.dimension.spawnParticle("horizon:magic_particle_0", player.location)

        target.applyDamage(6);
        target.applyImpulse({
          x: dir.x * 0.7,
          y: dir.y + 0.5,
          z: dir.z * 0.7
        })
        target.dimension.spawnParticle("horizon:katana_hurt", {
          x: target.location.x,
          y: target.location.y + 1,
          z: target.location.z
        })
        addCooldown(player, 25)
        system.runTimeout(() => {
          player.dimension.playSound("horizon:teleport", player.location)
          player.teleport(loc, { checkForBlocks: true });
          player.dimension.spawnParticle("horizon:magic_particle_0", loc)

        }, 10);

      } else */

