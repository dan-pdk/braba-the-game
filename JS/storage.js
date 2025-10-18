import { player, defaultPlayer } from "./player.js";
import { shopItems } from "./elements.js";
import { changeScore, abbreviateNumber } from "./currency.js";
import { effects } from "./data.js";

export function savePlayerData() {
  if (player) {
    const savedPlayer = JSON.stringify(player);
    window.localStorage.setItem("playerData", savedPlayer);
    console.log("Successfully stored player data");
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
  console.log("Successfully loaded player data:", playerData);
  console.log(player);
}

export function applyPlayerData() {
  for (const [itemId, itemCount] of Object.entries(player.items)) {
    if (!itemCount) continue;

    const itemObject = shopItems.find((i) => { return i.id === itemId; })
    if (!itemObject) continue;

    const itemEffect = effects[itemObject.id + "Effect"];
    if (typeof itemEffect !== 'function') continue;

    itemObject.cost = Math.floor(parseFloat(
        (itemObject.baseCost * Math.pow(itemObject.costFactor, itemCount)).toFixed(1)
    ));
    itemObject.count = itemCount;

    if (itemObject.costDisplay)
      itemObject.costDisplay.textContent = `B$ ${abbreviateNumber(itemObject.cost)}`;
    if (itemObject.countDisplay)
      itemObject.countDisplay.textContent = `Lvl ${abbreviateNumber(itemCount)}`;
  }
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
