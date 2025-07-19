import { world, system } from '@minecraft/server'

system.beforeEvents.startup.subscribe(eventData => {
    eventData.itemComponentRegistry.registerCustomComponent('horizon:treecapitator', {
        onMineBlock(e) {
            const { block, source } = e
            let { x, y, z } = block.location
            if (source.getGameMode() != 'creative' && source.isSneaking) {
                block.dimension.runCommand(`execute positioned ${x} ${y} ${z} run function treecapitator`)
            }
        }
    })
})