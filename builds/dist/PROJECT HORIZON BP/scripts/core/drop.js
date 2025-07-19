import { world, system, EquipmentSlot, ItemStack, GameMode, BlockPermutation } from '@minecraft/server';
world.afterEvents.playerBreakBlock.subscribe(data => {
  const brokenBlock = data.brokenBlockPermutation;
  const player = data.player;
  const block = data.block;
  const blockItem = data.dimension.getEntities({ type: 'minecraft:item', location: block.center(), maxDistance: 0.6 });
  const selectedItem = player.getComponent('equippable').getEquipment('Mainhand');

  if (player.getGameMode() !== 'creative') {
    // Если игрок использует деревянную кирку и блок требует дерево
    if (brokenBlock.hasTag('horizon:wood') && selectedItem?.typeId.includes('minecraft:wooden')) {
      blockItem[0]?.remove();
    }
    // Если игрок использует каменную кирку и блок требует камень
    if (brokenBlock.hasTag('horizon:stone') && selectedItem?.typeId.includes('minecraft:stone')) {
      blockItem[0]?.remove();
    }
    // Если игрок использует железную кирку и блок требует железо
    if (brokenBlock.hasTag('horizon:iron') && selectedItem?.typeId.includes('minecraft:iron')) {
      blockItem[0]?.remove();
    }
    // Если игрок не держит инструмент и блок требует инструмент для добычи
    if (!selectedItem && (brokenBlock.hasTag('horizon:wood') || brokenBlock.hasTag('horizon:stone') || brokenBlock.hasTag('horizon:iron'))) {
      blockItem[0]?.remove();
    }
  }
});