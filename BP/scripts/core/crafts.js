const categories = {
    basic: "§l§yBasic",
    gadgets: "§p§lGadgets",
    bee: "§eBee stuff",
    components: "§v§lComponents",
    mine: "§rMine tools",
    utilities: "§hUtilities",
    redstone: "§l§cRedstone",
    machines: "§lMachines"
}

const allRecipes = {
    "basic_components": {
        "Simple\ncomponent": {
            cat: categories.components,
            results: [{ id: "horizon:simple_component", count: 12 }],
            ingredients: {
                "minecraft:copper_ingot": 4,
                "horizon:light_steel_ingot": 1
            },
            icon: "textures/items/simple_component"
        },
        "Electric\nelement": {
            cat: categories.components,
            results: [{ id: "horizon:electric_element", count: 8 }],
            ingredients: {
                "minecraft:redstone": 4,
                "horizon:simple_component": 4
            },
            icon: "textures/items/electric_element"
        },
        "Fire\nelement": {
            cat: categories.components,
            results: [{ id: "horizon:fire_element", count: 5 }],
            ingredients: {
                "horizon:simple_component": 2,
                "minecraft:blaze_powder": 2
            },
            icon: "textures/items/fire_element"
        },
        "AI module": {
            cat: categories.components,
            results: [{ id: "horizon:ai_module", count: 1 }],
            ingredients: {
                "horizon:simple_component": 5,
                "horizon:electric_element": 5,
                "minecraft:redstone": 4
            },
            icon: "textures/items/ai_module"
        }
    },
    "predecessor": {
        "Simple component\n(primitive)": {
            cat: categories.components,
            results: [{ id: "horizon:simple_component", count: 4 }]
        },
        "Torch": {
            cat: categories.basic,
            results: [{ id: "minecraft:torch", count: 8 }],
            icon: "textures/blocks/torch_on",
            ingredients: {
                "minecraft:coal": 1,
                "minecraft:stick": 1
            }
        },
        "Iron with coal": {
            cat: categories.basic,
            results: [{ id: "horizon:iron_with_coal", count: 3 }],
            icon: "textures/items/coal_with_iron",
            ingredients: {
                "minecraft:iron_ingot": 1,
                "minecraft:coal": 1
            }
        },
        "Copper drill": {
            cat: categories.basic,
            results: [{ id: "horizon:copper_drill", count: 1 }],
            icon: "textures/items/copper_drill",
            ingredients: {
                "minecraft:copper_block": 3,
                "minecraft:lever": 1,
                "minecraft:copper_ingot": 5
            }
        }
    },
    "miner": {
        "Diamond pickaxe": {
            cat: categories.mine,
            results: [{ id: "minecraft:diamond_pickaxe", count: 1 }],
            icon: "textures/items/diamond_pickaxe",
            ingredients: {
                "minecraft:stick": 2,
                "minecraft:diamond": 2
            }
        }
    },
    "redstone_engineer": {
        "Redstone Lamp": {
            cat: categories.redstone,
            results: [{ id: "minecraft:redstone_lamp", count: 3 }],
            icon: "textures/blocks/redstone_lamp_on",
            ingredients: {
                "minecraft:redstone": 6,
                "minecraft:glowstone_dust": 6
            }
        },
        "Repeater": {
            cat: categories.redstone,
            results: [{ id: "minecraft:repeater", count: 4 }],
            icon: "textures/items/repeater",
            ingredients: {
                "minecraft:redstone": 6,
                "minecraft:cobblestone": 6,
                "minecraft:stick": 4
            },
        },
        "Comparator": {
            cat: categories.redstone,
            results: [{ id: "minecraft:comparator", count: 3 }],
            icon: "textures/items/comparator",
            ingredients: {
                "minecraft:quartz": 1,
                "minecraft:redstone": 8,
                "minecraft:stick": 4
            }
        },
        "Piston": {
            cat: categories.redstone,
            results: [{ id: "minecraft:piston", count: 5 }],
            icon: "textures/blocks/piston_side",
            ingredients: {
                "minecraft:redstone": 12,
                "minecraft:cobblestone": 24,
                "minecraft:iron_ingot": 3
            }
        },
        "Observer": {
            cat: categories.redstone,
            results: [{ id: "minecraft:observer", count: 8 }],
            icon: "textures/blocks/observer_side",
            ingredients: {
                "minecraft:cobblestone": 24,
                "minecraft:redstone": 12,
                "minecraft:quartz": 4
            }
        },
        "Engineer's\nsword": {
            cat: categories.gadgets,
            results: [{ id: "horizon:engineers_sword", count: 1 }],
            icon: "textures/items/weapon/mics/engineer's_sword",
            ingredients: {
                "minecraft:redstone": 24,
                "minecraft:iron": 5,
                "horizon:steel_ingot": 5
            }
        }
    },
    "engineer_level_c": {
        "Robosphere\nT1": {
            cat: categories.gadgets,
            results: [{ id: "horizon:robosphere_t1", count: 3 }],
            icon: "textures/items/robosphere_t1",
            ingredients: {
                "horizon:simple_component": 7,
                "horizon:electric_element": 4,
                "horizon:fire_element": 6,
                "horizon:ai_module": 2
            }
        }
    },
    "guideUC_horizon": {
        "Assembler": {
            cat: categories.machines,
            results: [{ id: "twm:assembler", count: 1 }],
            icon: "textures/blocks/assembler/assembler_on",
            ingredients: {
                "minecraft:redstone": 6,
                "twm:steel_plate": 4,
                "minecraft:iron_ingot": 8,
                "minecraft:cobblestone": 4
            }
        },
        "Block breaker": {
            cat: categories.machines,
            results: [{ id: "twm:block_breaker", count: 4 }],
            icon: "textures/blocks/redstone_block",
            ingredients: {
                "minecraft:redstone": 18,
                "twm:steel_plate": 6,
                "minecraft:copper_ingot": 22,
                "minecraft:dropper": 2
            }
        },
        "Electro\npress": {
            cat: categories.machines,
            results: [{ id: "twm:electro_press", count: 1 }],
            icon: "textures/blocks/redstone_block",
            ingredients: {
                "minecraft:redstone": 12,
                "minecraft:copper_block": 2,
                "twm:steel_ingot": 5,
                "minecraft:piston": 1
            }
        },
        "Coal\ngenerator": {
            cat: categories.machines,
            results: [{ id: "twm:basic_furnator", count: 1 }],
            icon: "textures/blocks/restone_block",
            ingredients: {
                "minecraft:redstone": 10,
                "minecraft:copper_ingot": 5,
                "twm:steel_ingot": 5
            }
        },
        "Energy\ncable": {
            cat: categories.machines,
            results: [{ id: "twm:energy_cable", count: 42 }],
            icon: "textures/blocks/redstone_block",
            ingredients: {
                "minecraft:redstone": 2,
                "twm:steel_ingot": 1,
                "minecraft:copper_ingot": 1,
                "minecraft:iron_ingot": 1
            }
        }
    },
    "bee_origin": {
        "Honeycomb": {
            cat: categories.bee,
            results: [{ id: "minecraft:honeycomb", count: 3 }, { id: "minecraft:glass_bottle", count: 2 }],
            icon: "textures/items/honeycomb",
            ingredients: {
                "horizon:pollen_bottle": 2
            }
        },
        "Golden\nhoneycomb": {
            cat: categories.bee,
            results: [{ id: "minecraft:honeycomb", count: 3 }],
            icon: "textures/items/golden_honeycomb",
            ingredients: {
                "minecraft:honeycomb": 1,
                "minecraft:gold_nugget": 24
            }
        },
        "Honey\nbottle": {
            cat: categories.bee,
            results: [{ id: "minecraft:honey_bottle", count: 1 }],
            icon: "textures/items/honey_bottle",
            ingredients: {
                "horizon:pollen_bottle": 1
            }
        }
    }
};

export {
    allRecipes
}