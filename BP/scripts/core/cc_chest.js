import { world, system, BlockPermutation } from "@minecraft/server";

system.beforeEvents.startup.subscribe(event => {
  event.blockComponentRegistry.registerCustomComponent("horizon:caves_chest_0", {
    onPlayerInteract(e) {
      const block = e.block;

      // Получаем текущее направление блока, и потом его юзаем в другой части кода
      const blockState = block.permutation;
      const facingDirection = blockState.getState("minecraft:facing_direction");

      // Создаем новый блок с тем же направлением лица 
      const newPermutation = BlockPermutation.resolve("horizon:caves_chest_1_opened", {
        "minecraft:facing_direction": facingDirection
      });
      
      block.setPermutation(newPermutation)
      system.runTimeout(() => {
        block.dimension.spawnParticle("horizon:dust_chest", block);
        block.dimension.runCommand(`loot spawn ${block.location.x} ${block.location.y} ${block.location.z} loot generic_loot`);
      }, 3);
      // задержка нужна , не трогать
    }
  });
});