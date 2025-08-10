import { itemCustomComponent } from "./core/CustomComponents/customComponents.js"

import { system, world } from "@minecraft/server"

system.beforeEvents.startup.subscribe(data => {
    itemCustomComponent(data)
})










import "./core/utilities/core_utilities.js";
import "./core/drill_component.js";
import "./core/treecapitator.js";
import "./core/drop.js";
import "./core/durability";
import "./core/main_system.js";
import "./core/cc_chest.js";
import "./core/spidermines_1.js";
import "./core/craft_ui1_horizon.js";
import "./core/ClassesOrigins_system/OriginsClassesManager.js"
import "./core/diskomet.js"
import "./core/start.js"
import "./core/abilities.js"

