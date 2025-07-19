import { world, system, ItemStack, EquipmentSlot, EntityDamageCause, BlockPermutation, ItemEnchantableComponent } from "@minecraft/server"
// Механика улучшенной невидимости
import { consumeUsedItem } from "./OriginAbilities.js"
import { removeItems, countItems } from "./craft_ui1_horizon.js"
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
world.afterEvents.playerJoin.subscribe(event => {
  const player = world.getPlayers({ name: event.playerName })
  system.runTimeout(() => {
    world.getDimension("overworld").runCommand("tag @a remove hcooldown")
  }, 250)
})
function addCooldown(player, ticks) {
  player.addTag("hcooldown")
  system.runTimeout(() => {
    player.removeTag("hcooldown")
  }, ticks)
}
function getCooldown(player) {
  if (player.hasTag("hcooldown")) {
    return true;
  }
  else return false;
}
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

system.beforeEvents.startup.subscribe(data => {
  data.itemComponentRegistry.registerCustomComponent("horizon:drone_station_t1", {
    onUseOn(e) {
      if (getCooldown(e.source) === true) return
      const { x, y, z } = e.block.location
      const blockabove = e.block.dimension.getBlock({
        x: x,
        y: y + 1,
        z: z
      })
      if (!blockabove.isAir) return;
      let inventory = e.source.getComponent("minecraft:inventory").container;
      if (countItems(inventory, "minecraft:redstone") < 8) return;
      blockabove.dimension.spawnParticle("horizon:spidermine_spawn_particle", blockabove.center())
      system.runTimeout(() => {
        blockabove.dimension.spawnEntity("horizon:spidermine_1", blockabove.center())
      }, 6)


      removeItems(inventory, "minecraft:redstone", 8)
      addCooldown(e.source, 35)

    }
  })
  data.itemComponentRegistry.registerCustomComponent("horizon:teleport", {
    onUse(e) {
      const player = e.source;
      const entities = player.getEntitiesFromViewDirection({ maxDistance: 10 });
      const loc = player.location
      const block = player.getBlockFromViewDirection({ maxDistance: 10 })
      let inventory = player.getComponent("minecraft:inventory").container;
      const dir = player.getViewDirection();
      if (entities.length > 0 && getCooldown(player) === false) {
        if (countItems(inventory, "minecraft:lapis_lazuli" < 3)) return
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

        target.applyDamage(4, { cause: EntityDamageCause.entityAttack, damagingEntity: player });

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
        removeItems(inventory, "minecraft:lapis_lazuli", 3)

      } else

        if (block && getCooldown(player) === false) {
          if (countItems(inventory, "minecraft:lapis_lazuli") < 1) return;
          player.dimension.spawnParticle("horizon:magic_particle_0", player.location)
          player.dimension.playSound("horizon:teleport", player.location)
          player.teleport({
            x: block.block.location.x - dir.x * 2,
            y: block.block.location.y - dir.y * 2,
            z: block.block.location.z - dir.z * 2
          })
          player.dimension.spawnParticle("horizon:magic_particle_0", player.location)
          player.dimension.playSound("horizon:teleport", player.location)
          addCooldown(player, 10)
          removeItems(inventory, "minecraft:lapis_lazuri", 1)
        }

        else if (getCooldown(player) === false) {
          if (countItems(inventory, "minecraft:lapis_lazuli") < 1) return
          const eye = player.getHeadLocation();
          player.dimension.spawnParticle("horizon:magic_particle_0", player.location)
          player.dimension.playSound("horizon:teleport", player.location)
          player.teleport({
            x: eye.x + dir.x * 10,
            y: eye.y + dir.y * 10,
            z: eye.z + dir.z * 10
          }, { checkForBlocks: false });

          player.dimension.spawnParticle("horizon:magic_particle_0", player.location)
          player.dimension.playSound("horizon:teleport", player.location)
          addCooldown(player, 15)
          removeItems(inventory, "minecraft:lapis_lazuli", 1)
        }
    }


  })
  data.itemComponentRegistry.registerCustomComponent("horizon:invisibility_scroll", {
    onCompleteUse(e) {
      e.source.addEffect("minecraft:invisibility", 800, { amplifier: 1 });
      consumeUsedItem(e.source, 1)
    }
  })
  data.itemComponentRegistry.registerCustomComponent("horizon:nectar_collector", {
    onUseOn(e) {
      if (!FlowerIDs.includes(e.block.typeId)) return;
      const nectar = new ItemStack("horizon:nectar", 2)
      e.block.dimension.spawnItem(nectar, e.block.location)
      for (let i = 0; i < 7; i++) e.block.dimension.spawnParticle("minecraft:honey_drip_particle", { x: e.block.location.x, y: e.block.location.y + 0.7, z: e.block.location.z })
      e.block.setType("air")
      const itemStack = e.itemStack
      const durability = itemStack.getComponent('minecraft:durability');
      const inventory = e.source.getComponent("minecraft:inventory").container;
      let unbreaking = 0;
      // Проверяемьлыдды
      if (itemStack.hasComponent("minecraft:enchantable")) {
        const ench = itemStack.getComponent(ItemEnchantableComponent.componentId);
        if (ench) { // Проверяем ь и компонент зачарования
          const unbreakingEnchantment = ench.getEnchantment("unbreaking");
          if (unbreakingEnchantment) { // Проверяемвововоы
            unbreaking = unbreakingEnchantment.level;
          }
        }
      }

      if (e.source) {
        if ((Math.ceil(Math.random() * 100)) <= (100 / (unbreaking + 1))) {
          if (durability.damage + 1 <= durability.maxDurability) {
            durability.damage += 1;
            inventory.setItem(e.source.selectedSlotIndex, itemStack);
          } else {
            inventory.setItem(e.source.selectedSlotIndex, undefined);
            e.source.playSound('random.break');
          }
        }
      }
    }
  })
  data.itemComponentRegistry.registerCustomComponent("horizon:scroll_of_protection", {
    onCompleteUse(e) {
      e.source.addEffect("minecraft:resistance", 600, { amplifier: 3 })
    }
  })
  data.blockComponentRegistry.registerCustomComponent("horizon:spike_stone", {
    onStepOn(e) {
      e.entity.applyDamage(12);
      const { x: x, y: y, z: z } = e.block.location;
      e.block.dimension.playSound("horizon:spikes_sound", { x, y, z })
      e.block.dimension.setBlockType({ x, y: y + 1, z }, "horizon:caves_spikes_0");
      e.block.dimension.setBlockType({ x, y, z }, "horizon:caves_tile_0")
    }
  });
  data.itemComponentRegistry.registerCustomComponent("horizon:fire_weapon", {
    onHitEntity(e) {
      e.hitEntity.setOnFire(5);
      const { x: x, y: y, z: z } = e.hitEntity.location;
      e.hitEntity.dimension.setBlockType("minecraft:fire", { x, y, z })
    }
  });
  data.itemComponentRegistry.registerCustomComponent("horizon:bone_melee_weapon", {
    onHitEntity(e) {
      if (Math.random() < 30) {
        e.hitEntity.applyDamage(6)
      }
    }
  })
  data.itemComponentRegistry.registerCustomComponent("horizon:katana_crit", {
    onHitEntity(e) {
      const { x: x, y: y, z: z } = e.hitEntity.location;
      const damage = 4
      e.hitEntity.dimension.spawnParticle("horizon:katana_hurt", { x: x, y: y + 1.1, z: z })
      if (Math.random() < 0.2) {
        e.hitEntity.applyDamage(damage);
        e.hitEntity.dimension.spawnParticle("horizon:crit_hurt", { x: x, y: y + 1.1, z: z })
      };
    }
  });
  data.itemComponentRegistry.registerCustomComponent("horizon:bone_weapon", {
    onHitEntity(e) {
      if (Math.random() < 0.2) {
        e.hitEntity.applyDamage(5);
      }
    }
  })
  data.itemComponentRegistry.registerCustomComponent("horizon:stinger_weapon", {
    onHitEntity(e) {
      if (!e.attackingEntity.hasTag("bee_origin")) return;
      const dmg = (Math.abs(e.attackingEntity.getVelocity().x) + Math.abs(e.attackingEntity.getVelocity().y) * 0.8 + Math.abs(e.attackingEntity.getVelocity().z)) * 17;
      if (!e.hitEntity) return;
      system.runTimeout(() => {
        e.hitEntity.applyDamage(dmg);
      })


      world.sendMessage(`${dmg}`)
    }
  })
})
world.afterEvents.playerBreakBlock.subscribe(event => {
  const { x: x, y: y, z: z } = event.block.location
  if (event.block.typeId === "horizon:caves_tile_0" && event.block.dimension.getBlock({ x, y: y + 1, z }).typeId === "horizon:caves_spikes_0") {
    event.block.dimension.setBlockType({ x, y: y + 1, z }, "minecraft:air")
  }
})
system.beforeEvents.startup.subscribe(event => {
  system.runTimeout(() => {
    world.sendMessage("WORLD WAS LAUNCHED")
  }, 100)
});
world.afterEvents.playerJoin.subscribe(ev => {
  for (const p of world.getAllPlayers()) {
    if (p.hasTag("horizon_started")) continue;
    const scrol = new ItemStack("horizon:scroll_of_oc", 1)
    p.dimension.spawnItem(scrol, p.location)
    p.sendMessage("1")
  }
})



world.beforeEvents.itemUse.subscribe(({ source: player, itemStack }) => {

  const tier = getWeaponTier(itemStack.typeId);
  const offhand = player.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Offhand);
  if (!isWeapon(itemStack.typeId)) return;
  if (!offhand || offhand.typeId !== TELEPORT_ITEM_ID) return;
  let inventory = player.getComponent("minecraft:inventory").container;
  if (countItems(inventory, "minecraft:lapis_lazuli") < 3) return;
  if (getCooldown(player) === true) return;
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

