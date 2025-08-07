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
import "./core/OriginsClassesManager.js";
import "./core/OriginAbilities.js";
import "./core/diskomet.js"
import "./core/start.js"
import "./core/abilities.js"
import "./unused/debbug_scr.js"
import "./unused/sculk_biomass.js"
import "./unused/sculk_catalyst.js"
import "./unused/sculk_core.js"
import "./unused/sculk_infection.js"
import "./unused/sculk_info.js"
import "./unused/sculk_target.js"
import "./unused/sculk_utils.js"

