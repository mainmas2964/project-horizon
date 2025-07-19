import { world, system, Scoreboard } from "@minecraft/server"

export function addAction(player, text) {
    player.dimension.runCommand(`title ${player.name} actionbar ${text}`)
}