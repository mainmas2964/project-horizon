import { world, system, ItemStack, EquipmentSlot, EntityDamageCause, BlockPermutation, ItemEnchantableComponent, BlockVolume, BlockVolumeBase, EntityTameableComponent } from "@minecraft/server"
// Механика улучшенной невидимости
import { consumeUsedItem, countItems, removeItems } from "core/utilities/core_utilities.js"
import { MessageFormData } from "@minecraft/server-ui"
import { TickTaskScheduler } from "core/tickSystem/tick.js"
const scheduler = new TickTaskScheduler({ saveKey: "main_system_save", maxTasksPerTick: 10, metaKey: "main_system" })

world.afterEvents.entityHitEntity.subscribe(event => {
  if (event.damagingEntity.getEffect("minecraft:invisibility")) {
    const effect = event.damagingEntity.getEffect("minecraft:invisibility").duration;
    if (event.damagingEntity.hasTag("horizon: adv_invisible")) {
      const invisible = event.damagingEntity.getEffect("minecraft:invisibility");
      event.damagingEntity.removeEffect("minecraft:invisibility");
      system.runTimeout(() => {
        event.damagingEntity.addEffect("minecraft:invisibility", effect, { amplifier: 1, showParticles: false })
      }, 50)
    } else {
      event.damagingEntity.removeEffect("minecraft:invisibility")
    }
  }
  else {
    return;
  }
});
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
world.beforeEvents.itemUse.subscribe(({ source: player, itemStack }) => {
  if (player.getItemCooldown("ability") > 0) return
  const tier = getWeaponTier(itemStack.typeId);
  const offhand = player.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Offhand);
  if (!isWeapon(itemStack.typeId)) return;
  if (!offhand || offhand.typeId !== TELEPORT_ITEM_ID) return;
  let inventory = player.getComponent("minecraft:inventory").container;
  if (countItems(inventory, "minecraft:lapis_lazuli") < 3) return;
  const targets = player.getEntitiesFromViewDirection({
    maxDistance: 15,
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
    player.startItemCooldown("ability", 15)
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

});
