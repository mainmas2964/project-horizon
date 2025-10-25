import { world, system, EntityDamageCause, BlockVolume } from "@minecraft/server";
import { explosion } from "./utilities/explosion.js"
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

    if (owner?.id) {
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

world.afterEvents.dataDrivenEntityTrigger.subscribe(event => {
  if (event.eventId !== "horizon:start_exploding") return;
  const entity1 = event.entity;
  const { x, y, z } = entity1.location;
  if (!entity1) return;

  entity1.playAnimation("animation.horizon_spidermine.animation.explosion");
  entity1.dimension.playSound("horizon:spidermine_activate", { x, y, z })
  entity1.addEffect("minecraft:slowness", 25, { amplifier: 100, showParticles: false })
  system.runTimeout(() => {
    explosion(entity1, 0.4, 3)
    applyExplosionDamage(entity1, 3, 17)
    entity1.dimension.playSound("horizon:spidermine_dead", { x, y, z })
    entity1.dimension.spawnParticle("horizon:exploding", { x, y, z });
    entity1.dimension.spawnParticle("horizon:particles_smoke", { x, y, z });
    entity1.remove();
  }, 10)
});



export { explosion }