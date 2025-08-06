import { world, system } from "@minecraft/server";
import { CustomForm } from "./customForm_horizon.js";
import { allRecipes } from "./crafts.js"
import { consumeUsedItem, countItems, removeItems } from "core/utilities/core_utilities.js"
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
