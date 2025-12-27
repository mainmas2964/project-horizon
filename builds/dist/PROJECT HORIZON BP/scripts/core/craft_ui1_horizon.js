import { world, system } from "@minecraft/server";
import { CustomForm } from "./customForm_horizon.js";
import { ModalFormData, ActionFormData } from "@minecraft/server-ui";
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
      player.sendMessage(`§cRecipe '${selectedRecipeKey}' not found.`);
      return;
    }

    confirmCraftingWindow(player, recipes, selectedRecipeKey);
  });
}

function getMaxCraftableAmount(inventory, recipe) {
  let maxAmount = Infinity;

  for (let item in recipe.ingredients) {
    const required = recipe.ingredients[item];
    const owned = countItems(inventory, item);
    const possibleCrafts = Math.floor(owned / required);

    if (possibleCrafts < maxAmount) {
      maxAmount = possibleCrafts;
    }
  }

  return maxAmount === Infinity ? 0 : maxAmount;
}

function confirmCraftingWindow(player, recipes, recipeKey) {
  let recipe = recipes[recipeKey];
  let inventory = player.getComponent("minecraft:inventory").container;

  const maxCrafts = getMaxCraftableAmount(inventory, recipe);
  const minCrafts = 1;

  let infoText = "§eCraft Results:\n";
  for (const result of recipe.results) {
    infoText += `§a${result.id} x${result.count}\n`;
  }
  infoText += "\n§fRequired Resources:\n";
  for (let item in recipe.ingredients) {
    infoText += `§b${item}§f x${recipe.ingredients[item]}\n`;
  }

  if (maxCrafts > 0) {
    let form = new ModalFormData();
    form.title("§lConfirm Crafting");

    form.slider(
      `${infoText}\n§lSelect Quantity:`,
      minCrafts,
      maxCrafts
    );

    form.show(player).then(response => {
      if (response.canceled) return;

      const amountToCraft = response.formValues[0];

      if (amountToCraft >= minCrafts && amountToCraft <= maxCrafts) {
        processCrafting(player, recipes, recipeKey, amountToCraft);
        // confirmCraftingWindow(player, recipes, recipeKey);
      } else {
        player.sendMessage("§cInvalid craft quantity.");
      }
    });

  } else {
    let form = new ActionFormData();
    form.title("§cInsufficient Resources");
    form.body(`${infoText}\n§cYou do not have enough resources to craft this.`);
    form.button("Back");

    form.show(player).then(() => { });
  }
}

function processCrafting(player, recipes, recipeKey, amount = 1) {
  let recipe = recipes[recipeKey];
  let inventory = player.getComponent("minecraft:inventory").container;

  let hasAllItems = true;
  for (let item in recipe.ingredients) {
    const requiredTotal = recipe.ingredients[item] * amount;
    if (countItems(inventory, item) < requiredTotal) {
      hasAllItems = false;
      break;
    }
  }

  if (!hasAllItems) {
    player.sendMessage("§cNot enough resources for selected amount.");
    return;
  }

  for (let item in recipe.ingredients) {
    const requiredTotal = recipe.ingredients[item] * amount;
    removeItems(inventory, item, requiredTotal);
  }

  let resultsMessage = "§aYou received: ";
  let firstItem = true;

  for (const result of recipe.results) {
    const totalCount = result.count * amount;
    player.runCommand(`give @s ${result.id} ${totalCount}`);

    if (!firstItem) {
      resultsMessage += ", ";
    }
    resultsMessage += `${result.id} x${totalCount}`;
    firstItem = false;
  }

  player.sendMessage(resultsMessage);
  player.sendMessage(`§eSuccessfully crafted ${amount} time(s)!`);
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