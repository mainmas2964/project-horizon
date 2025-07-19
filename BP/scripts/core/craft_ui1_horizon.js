import { world, system } from "@minecraft/server";
import { CustomForm } from "./customForm_horizon.js";
function consumeUsedItem(player, usedStack, amount = 1) {
  const inv = player.getComponent("minecraft:inventory")?.container;
  if (!inv) return false;

  let toRemove = amount;

  for (let i = 0; i < inv.size; i++) {
    const slot = inv.getItem(i);
    if (!slot || slot.typeId !== usedStack.typeId) continue;
    if (!slot.isStackableWith(usedStack)) continue;

    if (slot.amount > toRemove) {
      slot.amount -= toRemove;
      inv.setItem(i, slot);
      return true;
    } else {
      toRemove -= slot.amount;
      inv.setItem(i, undefined);
      if (toRemove <= 0) return true;
    }
  }

  return false;
}
function getRecipesByTags(player) {
  const playerTags = player.getTags();
  let recipes = { ...allRecipes["default"] };

  for (const tag of playerTags) {
    if (allRecipes[tag]) {
      Object.assign(recipes, allRecipes[tag]);
    }
  }

  return recipes;
}

function openCraftingMenu(player, recipes, titlecraft) {
  let form = new CustomForm();
  let recipeKeys = Object.keys(recipes);

  for (let key of recipeKeys) {
    let recipe = recipes[key];
    form.button("craft", key, recipe.icon || "textures/items/stone.png", false, `select_${key}`);
  }

  form.title(`${titlecraft}`).body("recipes:");
  form.show(player).then(response => {
    if (response?.canceled || !response.text) return;

    let selectedRecipeKey = response.text;
    if (!recipes[selectedRecipeKey]) {
      player.sendMessage(`§cРецепт '${selectedRecipeKey}' не найден.`);
      return;
    }

    confirmCraftingWindow(player, recipes, selectedRecipeKey);
  });
}

function confirmCraftingWindow(player, recipes, recipeKey) {
  let recipe = recipes[recipeKey];
  let form = new CustomForm();

  let bodyText = `§eCraft: §a${recipe.result} x${recipe.count}\n\n§fFor craft:\n`;
  for (let item in recipe.ingredients) {
    bodyText += `- §b${item}§f x${recipe.ingredients[item]}\n`;
  }

  form.body(bodyText);
  form.button("confirm", "§a✔", "textures/blocks/crafting_table_top", false, `confirm_${recipeKey}`);
  form.button("cancel", "§c✖", "textures/blocks/barrier", false, `cancel_${recipeKey}`);

  form.title("Confirm");
  form.show(player).then(response => {
    if (response?.canceled || !response.text) return;
    processCrafting(player, recipes, recipeKey);
    confirmCraftingWindow(player, recipes, recipeKey)
  });
}

function processCrafting(player, recipes, recipeKey) {
  let recipe = recipes[recipeKey];
  let inventory = player.getComponent("minecraft:inventory").container;
  let hasAllItems = true;

  for (let item in recipe.ingredients) {
    if (countItems(inventory, item) < recipe.ingredients[item]) {
      hasAllItems = false;
      break;
    }
  }

  if (!hasAllItems) {
    player.sendMessage("§cNot enough resources");
    return;
  }

  for (let item in recipe.ingredients) {
    removeItems(inventory, item, recipe.ingredients[item]);
  }

  player.runCommand(`give @s ${recipe.result} ${recipe.count}`);
  player.sendMessage(`§a${recipe.result} x${recipe.count}`);
}

function countItems(inventory, itemType) {
  let count = 0;
  for (let i = 0; i < inventory.size; i++) {
    let item = inventory.getItem(i);
    if (item && item.typeId === itemType) count += item.amount;
  }
  return count;
}

function removeItems(inventory, itemType, amount) {
  for (let i = 0; i < inventory.size; i++) {
    let item = inventory.getItem(i);
    if (item && item.typeId === itemType) {
      if (item.amount > amount) {
        item.amount -= amount;
        inventory.setItem(i, item);
        return;
      } else {
        amount -= item.amount;
        inventory.setItem(i, undefined);
      }
    }
  }
}


world.afterEvents.itemUse.subscribe(event => {
  if (event.source.hasTag("guideUC") && event.source.hasTag("engineer")) {
    event.source.addTag("guideUC_horizon")
  }
  if (event.itemStack.typeId === "horizon:mobile_workbench") {
    const recipes = getRecipesByTags(event.source);
    openCraftingMenu(event.source, recipes, "mobile workbench");
  }

});
export {
  removeItems,
  countItems
}
const allRecipes = {
  "predecessor": {
    "Torch": {
      result: "minecraft:torch",
      count: 8,
      icon: "textures/blocks/torch_on",
      ingredients: {
        "minecraft:coal": 1,
        "minecraft:stick": 1
      }
    },
    "Iron with coal": {
      result: "horizon:iron_with_coal",
      count: 3,
      icon: "textures/items/coal_with_iron",
      ingredients: {
        "minecraft:iron_ingot": 1,
        "minecraft:coal": 1
      }
    }
  },
  "miner": {
    "Diamond pickaxe": {
      result: "minecraft:diamond_pickaxe",
      count: 1,
      icon: "textures/items/diamond_pickaxe",
      ingredients: {
        "minecraft:stick": 2,
        "minecraft:diamond": 2
      }
    }
  },
  "engineer": {
    "Redstone Lamp": {
      result: "minecraft:redstone_lamp",
      count: 3,
      icon: "textures/blocks/redstone_lamp_on",
      ingredients: {
        "minecraft:redstone": 6,
        "minecraft:glowstone_dust": 6
      }
    },
    "Repeater": {
      result: "minecraft:repeater",
      count: 4,
      icon: "textures/items/repeater",
      ingredients: {
        "minecraft:redstone": 6,
        "minecraft:cobblestone": 6,
        "minecraft:stick": 4
      },
    },
    "Comparator": {
      result: "minecraft:comparator",
      count: 3,
      icon: "textures/items/comparator",
      ingredients: {
        "minecraft:quartz": 1,
        "minecraft:redstone": 8,
        "minecraft:stick": 4
      }
    },
    "Piston": {
      result: "minecraft:piston",
      count: 5,
      icon: "textures/blocks/piston_side",
      ingredients: {
        "minecraft:redstone": 12,
        "minecraft:cobblestone": 24,
        "minecraft:iron_ingot": 3
      }
    },
    "Observer": {
      result: "minecraft:observer",
      count: 8,
      icon: "textures/blocks/observer_side",
      ingredients: {
        "minecraft:cobblestone": 24,
        "minecraft:redstone": 12,
        "minecraft:quartz": 4
      }
    },
    "Engineer's\nsword": {
      result: "horizon:engineers_sword",
      count: 1,
      icon: "textures/items/engineer's_sword",
      ingredients: {
        "minecraft:redstone": 24,
        "minecraft:iron": 5,
        "horizon:steel_ingot": 5
      }
    }
  },
  "guideUC_horizon": {
    "Assembler": {
      result: "twm:assembler",
      count: 1,
      icon: "textures/blocks/assembler/assembler_on",
      ingredients: {
        "minecraft:redstone": 6,
        "twm:steel_plate": 4,
        "minecraft:iron_ingot": 8,
        "minecraft:cobblestone": 4
      }
    },
    "Block breaker": {
      result: "twm:block_breaker",
      count: 4,
      icon: "textures/blocks/redstone_block",
      ingredients: {
        "minecraft:redstone": 18,
        "twm:steel_plate": 6,
        "minecraft:copper_ingot": 22,
        "minecraft:dropper": 2
      }
    },
    "Electro\npress": {
      result: "twm:electro_press",
      count: 1,
      icon: "textures/blocks/redstone_block",
      ingredients: {
        "minecraft:redstone": 12,
        "minecraft:copper_block": 2,
        "twm:steel_ingot": 5,
        "minecraft:piston": 1
      }
    },
    "Coal\ngenerator": {
      result: "twm:basic_furnator",
      count: 1,
      icon: "textures/blocks/restone_block",
      ingredients: {
        "minecraft:redstone": 10,
        "minecraft:copper_ingot": 5,
        "twm:steel_ingot": 5
      }
    },
    "Energy\ncable": {
      result: "twm:energy_cable",
      count: 42,
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
      result: "minecraft:honeycomb",
      count: 3,
      icon: "textures/items/honeycomb",
      ingredients: {
        "horizon:nectar": 12
      }
    },
    "Golden\nhoneycomb": {
      result: "minecraft:honeycomb",
      count: 3,
      icon: "textures/items/golden_honeycomb",
      ingredients: {
        "minecraft:honeycomb": 1,
        "minecraft:gold_nugget": 24
      }
    },
    "Honey\nBlock": {
      result: "minecraft:honey_bottle",
      count: 1,
      icon: "textures/items/honey_bottle",
      ingredients: {
        "horizon:nectar": 6,
        "minecraft:glass_bottle": 1
      }
    },
    "Nectar\nCollector": {
      result: "horizon:nectar_collector",
      count: 1,
      icon: "textures/items/nectar_collector",
      ingridients: {
        "horizon:silver_ingot": 2,
        "horizon:light_steel_ingot": 1,
        "minecraft:stick": 1
      }
    }
  }
};