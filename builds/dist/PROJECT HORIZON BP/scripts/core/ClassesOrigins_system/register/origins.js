import { OriginManager, Origin } from "core/ClassesOrigins_system/Origin.js"
const originManager = new OriginManager
export function registerOrigin(originManager) {
    originManager.register(new Origin({
        id: "predecessor",
        tags: ["predecessor"],
        availableClasses: ["prospector", "redstone_engineer", "mechanist", "builder"],
        hidden: false

    }))
    originManager.register(new Origin({
        id: "bee",
        tags: ["bee_origin", "weak_hp"],
        availableClasses: ["prospector", "redstone_engineer", "mechanist"],
        dynamicProperties: {
            "stingers": 7
        },
        hidden: false


    }))
    originManager.register(new Origin({
        id: "demon",
        tags: ["demon", "firer"],
        availableClasses: ["prospector", "redstone_engineer", "mechanist"],
        hidden: false
    }))
    originManager.register(new Origin({
        id: "slimecat",
        tags: ["slimecat", "weak_hp"],
        availableClasses: ["prospector", "redstone_engineer", "mechanist", "builder"],
        hidden: false
    }))
    originManager.register(new Origin({
        id: "robot",
        tags: ["robot", "engineer_level_r", "engineer_level_c", "basic_components", "redstone"],
        availableClasses: ["redstone_engineer", "mechanist", "builder"],
        dynamicProperties: {
            "charge": 100
        },
        hidden: false
    }))
    originManager.register(new Origin({
        id: "sculkborned",
        tags: ["sculkborned", "sculk_biomass"],
        dynamicProperties: {
            "sculk_biomass": 50
        }
    }))
}