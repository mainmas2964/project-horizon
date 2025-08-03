import { world, system, EntityDamageCause, BlockVolume } from "@minecraft/server";
/*
function explosion(entity, power, radius) {
  const { x, y, z } = entity.location;
  const dimension = entity.dimension;
  for (let i = -radius; i <= radius; i++) {
    for (let j = -1; j <= radius; j++) {
      for (let b = -radius; b <= radius; b++) {
        const block = dimension.getBlock({ x: x + i, y: y + j, z: z + b });
        entity.k
        if (!block) continue;
        let random = Math.random()
        const blockId = block.typeId;
        const { x: bx, y: by, z: bz } = block
        if (blockId in cracked && random > power) {
          block.dimension.setBlockType({ x: bx, y: by, z: bz }, cracked[blockId].cracked)
        } else if (!blocks.includes(blockId) && random > power) {
          dimension.runCommand(`setblock ${block.location.x} ${block.location.y} ${block.location.z} air destroy`);
        }
        else continue;
      }
    }
  }
}
*/
function applyExplosionDamage(entity1, radius, damage) {
  const { x, y, z } = entity1.location;

  const tameable = entity1.getComponent("minecraft:tameable");
  const owner = tameable?.tamedToPlayer;



  for (const target of entity1.dimension.getEntities({
    location: { x, y, z },
    maxDistance: radius
  })) {
    if (target.id === entity1.id) continue;

    const targetTameable = target.getComponent("minecraft:tameable");
    const targetOwner = targetTameable?.tamedToPlayer;

    if (owner.id) {
      if (target.id === owner.id) {

        continue;
      }
      if (targetTameable?.isTamed && targetOwner.id === owner.id) {

        continue;
      }
    }
    target.applyDamage(damage, {
      cause: EntityDamageCause.entityExplosion,
      damagingEntity: entity1
    });
  }
}

world.afterEvents.entityHitEntity.subscribe(data => {
  if (data.damagingEntity.typeId != "horizon:spiderbot_hybrid_t1") return;
  data.hitEntity.dimension.spawnParticle("horizon:fire_attack", data.hitEntity.location)
})
function explosion(entity, power, radius) {
  const { x, y, z } = entity.location;
  const dimension = entity.dimension;

  const from1 = {
    x: Math.floor(x - radius),
    y: Math.floor(y - 1),
    z: Math.floor(z - radius)
  };

  const to1 = {
    x: Math.floor(x + radius),
    y: Math.floor(y + radius),
    z: Math.floor(z + radius)
  };

  const volume = new BlockVolume(from1, to1);

  // Получаем координаты всех блоков, кроме bedrock
  const blocksVolume = dimension.getBlocks(volume, { excludeTypes: blocks }, true);
  for (const location of blocksVolume.getBlockLocationIterator()) {
    const block = dimension.getBlock(location);
    if (!block) continue;

    const blockId = block.typeId;
    const random = Math.random();
    if (blockId in cracked && random > power) {
      block.setType(cracked[blockId].cracked);
    } else if (random > power) {
      dimension.runCommand(`setblock ${location.x} ${location.y} ${location.z} air destroy`);
    }
  }
}
world.afterEvents.dataDrivenEntityTrigger.subscribe(event => {
  if (event.eventId !== "horizon:start_exploding") return;
  const entity1 = event.entity;
  const { x, y, z } = entity1.location;
  if (!entity1) return;
  entity1.playAnimation("animation.horizon_spidermine.animation.explosion");
  entity1.dimension.playSound("horizon:spidermine_activate", { x, y, z })
  entity1.addEffect("minecraft:slowness", 25, { amplifier: 100, showParticles: false })
  system.runTimeout(() => {
    explosion(entity1, 0.4, 2);
    applyExplosionDamage(entity1, 3, 17)
    entity1.dimension.playSound("horizon:spidermine_dead", { x, y, z })
    entity1.dimension.spawnParticle("horizon:exploding", { x, y, z });
    entity1.dimension.spawnParticle("horizon:particles_smoke", { x, y, z });
    entity1.remove();
  }, 10)
});

const blocks = [
  "minecraft:bedrock",
  "minecraft:barrier",
  "minecraft:command_block",
  "minecraft:repeating_command_block",
  "minecraft:chain_command_block",
  "minecraft:structure_block",
  "minecraft:structure_void",
  "minecraft:jigsaw",
  "minecraft:end_portal",
  "minecraft:end_portal_frame",
  "minecraft:reinforced_deepslate",
  "minecraft:obsidian",
  "minecraft:crying_obsidian",
  "minecraft:respawn_anchor",
  "minecraft:enchanting_table",
  "minecraft:end_gateway"
]
const cracked = {
  "minecraft:stone_bricks": { "cracked": "minecraft:cracked_stone_bricks" },
  "minecraft:deepslate_bricks": { "cracked": "minecraft:cracked_deepslate_bricks" },
  "minecraft:deepslate_tiles": { "cracked": "minecraft:cracked_deepslate_tiles" },
  "minecraft:nether_bricks": { "cracked": "minecraft:cracked_nether_bricks" },
  "minecraft:polished_blackstone_bricks": { "cracked": "minecraft:cracked_polished_blackstone_bricks" },
  "minecraft:grass_block": { "cracked": "minecraft:dirt" },
  "minecraft:dirt": { "cracked": "minecraft:coarse_dirt" },
  "minecraft:mossy_stone_bricks": { "cracked": "minecraft:stone_bricks" },
  "minecraft:mossy_cobblestone": { "cracked": "minecraft:cobblestone" },
  "minecraft:stone": { "cracked": "minecraft:cobblestone" },
  "minecraft:chiseled_red_sandstone": { "cracked": "minecraft:red_sandstone" },
  "minecraft:chiseled_sandstone": { "cracked": "minecraft:sandstone" },
  "minecraft:weathered_copper": { "cracked": "minecraft:exposed_copper" },
  "minecraft:exposed_copper": { "cracked": "minecraft:copper_block" },
  "minecraft:oxidized_copper": { "cracked": "minecraft:weathered_copper" },
  "minecraft:oxidized_cut_copper": { "cracked": "minecraft:weathered_cut_copper" },
  "minecraft:weathered_cut_copper": { "cracked": "minecraft:exposed_cut_copper" },
  "minecraft:exposed_cut_copper": { "cracked": "minecraft:cut_copper" }
}
export { explosion }