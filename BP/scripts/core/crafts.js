const categories = {
    basic: "§l§yBasic",
    gadgets: "§p§lGadgets",
    bee: "§eBee stuff",
    components: "§v§lComponents",
    mine: "§rMine tools",
    utilities: "§hUtilities",
    redstone: "§l§cRedstone",
    machines: "§lMachines",
    builder: "§lBuilder"
}

const allRecipes = {
    "builder": {
        "Diorite\n(Bulk)": {
            cat: categories.builder,
            results: [{ id: "minecraft:diorite", count: 32 }],
            icon: "textures/blocks/stone_diorite",
            ingredients: { "minecraft:cobblestone": 32, "minecraft:white_dye": 8 }
        },
        "Andesite\n(Bulk)": {
            cat: categories.builder,
            results: [{ id: "minecraft:andesite", count: 32 }],
            icon: "textures/blocks/stone_andesite",
            ingredients: { "minecraft:cobblestone": 32, "minecraft:light_gray_dye": 8 }
        },
        "Granite\n(Bulk)": {
            cat: categories.builder,
            results: [{ id: "minecraft:granite", count: 32 }],
            icon: "textures/blocks/stone_granite",
            ingredients: { "minecraft:cobblestone": 32, "minecraft:red_dye": 8 }
        },
        "Blackstone\n(Artificial)": {
            cat: categories.builder,
            results: [{ id: "minecraft:blackstone", count: 32 }],
            icon: "textures/blocks/blackstone",
            ingredients: { "minecraft:cobblestone": 32, "minecraft:black_dye": 8, "minecraft:coal": 4 }
        },
        "Tuff\n(Artificial)": {
            cat: categories.builder,
            results: [{ id: "minecraft:tuff", count: 32 }],
            icon: "textures/blocks/tuff",
            ingredients: { "minecraft:cobblestone": 32, "minecraft:gray_dye": 8, "minecraft:clay_ball": 8 }
        },
        "Calcite\n(Artificial)": {
            cat: categories.builder,
            results: [{ id: "minecraft:calcite", count: 32 }],
            icon: "textures/blocks/calcite",
            ingredients: { "minecraft:diorite": 16, "minecraft:white_dye": 8, "minecraft:quartz": 2 }
        },
        "Quartz\nBlock": {
            cat: categories.builder,
            results: [{ id: "minecraft:quartz_block", count: 16 }],
            icon: "textures/blocks/quartz_block_side",
            ingredients: { "minecraft:white_dye": 8, "minecraft:glass": 16, "minecraft:iron_nugget": 4 }
        },
        "Stone\nBricks": {
            cat: categories.builder,
            results: [{ id: "minecraft:stone_bricks", count: 64 }],
            icon: "textures/blocks/stonebrick",
            ingredients: { "minecraft:stone": 32, "minecraft:clay_ball": 4 }
        },
        "Terracotta\n(Base)": {
            cat: categories.builder,
            results: [{ id: "minecraft:terracotta", count: 32 }],
            icon: "textures/blocks/terracotta",
            ingredients: { "minecraft:clay": 8, "minecraft:sand": 16, "minecraft:red_dye": 1 }
        },
        "Cheap\nScaffolding": {
            cat: categories.builder,
            results: [{ id: "minecraft:scaffolding", count: 24 }],
            icon: "textures/blocks/scaffolding_side",
            ingredients: { "minecraft:stick": 6, "minecraft:string": 1 }
        },

        "Basalt": {
            cat: categories.builder,
            results: [{ id: "minecraft:basalt", count: 32 }],
            icon: "textures/blocks/basalt_side",
            ingredients: { "minecraft:cobblestone": 16, "minecraft:blackstone": 16 }
        }
    },
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
            results: [{ id: "horizon:simple_component", count: 4 }],
            ingredients: {
                "minecraft:copper_ingot": 4,
                "horizon:light_steel_ingot": 2
            },
            icon: "textures/items/simple_component"
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