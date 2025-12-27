import { world, system } from "@minecraft/server"

import { teleport, drone_station_t1, redstone_impulse } from "./abilities.js"
import { invisibility_scroll, stinger_weapon, pollen_collector, robosphere, builder_wand } from "./items.js"
export function itemCustomComponent(data) {
    data.itemComponentRegistry.registerCustomComponent("horizon:teleport", teleport)
    data.itemComponentRegistry.registerCustomComponent("horizon:drone_station_t1", drone_station_t1)
    data.itemComponentRegistry.registerCustomComponent("horizon:redstone_impulse", redstone_impulse)
    data.itemComponentRegistry.registerCustomComponent("horizon:invisibility_scroll", invisibility_scroll)
    data.itemComponentRegistry.registerCustomComponent("horizon:pollen_collector", pollen_collector)
    data.itemComponentRegistry.registerCustomComponent("horizon:stinger_weapon", stinger_weapon)
    data.itemComponentRegistry.registerCustomComponent("horizon:robosphere", robosphere)
    data.itemComponentRegistry.registerCustomComponent("horizon:builder_wand", builder_wand)
}