import { world, system, BlockVolumeBase, Block, BlockVolume } from "@minecraft/server";
system.beforeEvents.startup.subscribe(data => {
  data.itemComponentRegistry.registerCustomComponent("horizon:vhs_camera", {
    onUse(e) {
      const entity = e.source.getEntitiesFromViewDirection({ maxDistance: 5 })
      for (const ent of entity) {
        ent.entity.addEffect("invisibility", 100, { amplifier: 1, showParticles: false })
        ent.entity.applyDamage(10)
        ent.entity.dimension.spawnParticle("horizon:vhs_particle", ent.entity.location)
      }
    }
  })
})
