import { world, system } from "@minecraft/server";

system.runInterval(() => {
  for (const player of world.getPlayers()) {
    const biome = player.dimension.getBlock(player.location).getBiome();

    if (biome === "wheat_field") {  // Проверяем, что игрок в нужном биоме
      if (Math.random() < 0.3) { // 10% шанс спавна частиц
        player.dimension.spawnParticle("horizon:dust_f_field", player.location);
      }
    }
  }
}, 750); // Код выполняется раз в 25 секунд