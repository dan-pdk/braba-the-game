import { player, defaultPlayer } from "./player.js";
import { shopItems, settings, devModeInfo } from "./elements.js";
import { changeScore, abbreviateNumber } from "./currency.js";
import { effects, settingEffects } from "./data.js";

export function savePlayerData() {
  if (player) {
    const savedPlayer = JSON.stringify(player);
    window.localStorage.setItem("playerData", savedPlayer);
  }
}
export function loadPlayerData() {
  const rawRetrievedData = localStorage.getItem("playerData");
  if (!rawRetrievedData) {
    console.log("No player found, loading new player");
    return;
  }
  const playerData = JSON.parse(rawRetrievedData);

  Object.assign(player, playerData);

}

export function applyPlayerData() {
  // itens
  for (const [itemId, itemCount] of Object.entries(player.items)) {
    if (!itemCount) continue;

    const itemObject = shopItems.find(i => i.id === itemId)
    if (!itemObject) continue;

    const itemEffect = effects[itemObject.id + "Effect"];
    if (itemObject.appliesOnlyStats == 'false') {
      itemEffect(player, itemObject);
    }

    itemObject.cost = Math.floor(itemObject.baseCost * Math.pow(itemObject.costFactor, itemCount));
    itemObject.count = itemCount;

    if (itemObject.costDisplay)
      itemObject.costDisplay.textContent = `B$ ${abbreviateNumber(itemObject.cost)}`;
    if (itemObject.countDisplay)
      itemObject.countDisplay.textContent = `Lvl ${abbreviateNumber(itemCount)}`;
  }

  // settings
  if (player.settings) {
    for (const [settingName, value] of Object.entries(player.settings)) {
      const settingObject = settings.find(i => i.name === settingName)
      if (!settingObject) continue;

      if (settingObject.buttonElement.type === "checkbox") {
        settingObject.buttonElement.checked = value === true || value === "true";
      } else if (settingObject.buttonElement.type === "range") {
        settingObject.buttonElement.value = value;
        if (settingObject.numberDisplayElement) {
          settingObject.numberDisplayElement.textContent = value;
        }
      } else if (settingObject.buttonElement.type === "text") {
        settingObject.buttonElement.value = value;
      } else if (settingObject.buttonElement.tagName === "BUTTON") {
        settingObject.buttonElement.innerHTML = value;
      }

      const applySetting = settingEffects[settingName];
      if (typeof applySetting === 'function') {
        applySetting(value);
      }
    }
  }

  // outros
  if (player.bonuses?.gravador) {
    player.scorePerSecond -= player.bonuses.gravador.currentBonus || 0;
    player.bonuses.gravador.currentBonus = 0;
    player.bonuses.gravador.isActive = false;
  }
  
  devModeInfo();
}

export function getSavedPlayer() {
  return JSON.parse(localStorage.getItem("playerData"));
}

export function resetPlayerData() {
  localStorage.removeItem("playerData");
  Object.assign(player, defaultPlayer);
  changeScore("add", 0);
  setTimeout(() => {
    location.reload();
  }, 500);
}
