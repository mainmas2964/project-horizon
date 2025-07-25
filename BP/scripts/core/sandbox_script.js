import { world, system } from "@minecraft/server"

world.beforeEvents.playerInteractWithBlock.subscribe(data => {
    data.cancel = true
})