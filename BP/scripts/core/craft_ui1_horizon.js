import { world, system } from "@minecraft/server";
import { CustomForm } from "./customForm_horizon.js";
import { allRecipes } from "./crafts.js"
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
    form.button(recipe.cat, key, recipe.icon || "textures/items/stone.png", false, `select_${key}`);
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

  let bodyText = `§eCraft: §a${recipe.result} x${recipe.count}\n\n`;
  for (let item in recipe.ingredients) {
    bodyText += `§b${item}§f x${recipe.ingredients[item]}\n`;
  }

  form.body(bodyText);
  form.button("confirm", "§a✔", "textures/blocks/crafting_table_top", false, `confirm_${recipeKey}`);
  form.button("confirm", "§c✖", "textures/blocks/barrier", false, `cancel_${recipeKey}`);

  form.title("Confirm");
  form.show(player).then(response => {
    if (response?.canceled || !response || response.text === "§c✖") return;
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
