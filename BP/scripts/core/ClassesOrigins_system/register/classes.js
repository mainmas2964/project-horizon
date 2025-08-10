import { ClassManager, PlayerClass } from "core/ClassesOrigins_system/PlayerClass.js"
const classManager = new ClassManager()
export function registerClass(classManager) {
    classManager.register(new PlayerClass({
        id: "prospector",
        tags: ["prospector", "basicCraft1", "morehealth"],
        availableAbilities: ["teleportation"]

    }));
    classManager.register(new PlayerClass({
        id: "builder",
        tags: ["builder"],
        availableAbilities: ["teleportation"]
    }))
    classManager.register(new PlayerClass({
        id: "redstone_engineer",
        tags: ["engineer", "redstone_engineer", "engineer_level_r", "engineer_level_c", "basic_components"],
        availableAbilities: ["redstone_impulse"],
        dynamicProperties: {
            "charge": 0
        }
    }))
    classManager.register(new PlayerClass({
        id: "mechanist",
        tags: ["mechanist", "engineer_level_c", "engineer_level_r", "better_spidermines", "basic_components"],
        availableAbilities: ["drone_station_t1"]
    }))
}
