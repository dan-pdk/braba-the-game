import { effects, scoreObservers } from './data.js';
import { addHoverTooltip } from "./elements.js";
import { player } from "./player.js";

export function addScoreObserver(observerFn) {
  scoreObservers.push(observerFn);
}

export function notifyScoreObservers(newScore, diff) {
  for (const observer of scoreObservers) {
    observer(newScore, diff);
  }
}

export function changeScore(operation, amount) {
  const oldScore = player.score;

  switch (operation) {
    case 'add':
      player.score += amount;
      break;
    case 'remove':
      player.score -= amount;
      break;
    case 'multiply':
      player.score *= amount;
      break;
    case 'set':
      player.score = amount;
  }

  const diff = player.score - oldScore;
  notifyScoreObservers(player.score, diff);
}

export function adjustPrice(item) {
  const costDisplay = item.costDisplay;
  costDisplay.textContent = `B$ ${abbreviateNumber(
    Math.floor(item.cost * item.costFactor)
  )}`
  item.cost = Math.floor(item.cost * item.costFactor);

  const countDisplay = item.countDisplay;
  countDisplay.textContent = `Lvl ${abbreviateNumber(
    player.items[item.id]
  )}`
}

export function canBuy(item, player) {
  return player.score >= item.cost;
}

export function buyItem(item, player) {
  if (!player.items[item.id]) {
    player.items[item.id] = 0;
  }
  if (!canBuy(item, player)) return;

  player.items[item.id] += 1;

  item.element.classList.remove('item-bought-animation');
  item.element.offsetWidth;
  item.element.classList.add('item-bought-animation');

  item.element.addEventListener('animationend', () => {
    item.element.classList.remove('scaleUp');
  }, { once: true });

  changeScore('remove', item.cost);
  adjustPrice(item);

  
  const effectFn = effects[item.id + "Effect"];
  
  if (typeof effectFn === "function") {
    queueMicrotask(() => { effectFn(player, item); });
  } else {
    console.warn(`No effect found for ${item.id}`);
  }
}


export function formatTime(timeInMs) {
  const timeInSeconds = Math.floor(timeInMs / 1000);

  const minutes = String(Math.floor(timeInSeconds / 60))
    .padStart(2, '0');
  const seconds = String(timeInSeconds % 60)
    .padStart(2, '0');

  return `${minutes}:${seconds}`;
}

export function abbreviateNumber(number) {
  if (!player.settings.abbreviateNumbers) { return number.toString(); }
  if (number < 1000) { return number.toString(); }

  const suffixes = ['', "k", "M", "B", "T", "Q", "Qui", "Sx"];
  let numberScale = Math.floor(Math.log10(number) / 3);
  const suffix = suffixes[numberScale] || "";

  let power = number / Math.pow(1000, numberScale);
  const treatedNumber = parseFloat(power.toFixed(2)).toString();

  return treatedNumber + suffix;
}

export const activeStatusEffects = [];

export function hasStatusEffect(effectName) {
  return activeStatusEffects.some(obj => obj.statusEffect.name === effectName)
}

export function addStatusEffect(item, statusEffect, hasTimer) {
  if (statusEffect.duration == null) {statusEffect.onEnd(player, item); return;}
  const wrapper = document.getElementById('status-effects');

  const effectElement = document.createElement('img');
  wrapper.appendChild(effectElement);
  effectElement.src = statusEffect.image;
  effectElement.classList.add('status-effect-icon');

  const effectEndTime = hasTimer ? Date.now() + statusEffect.duration : null;
  addHoverTooltip(null, effectElement, statusEffect.name, statusEffect.description, effectEndTime);

  statusEffect.onStart(player, item);

  const endEffect = () => {
    statusEffect.onEnd(player, item);
    effectElement.style.animation = "shrinkAndDissapear 1s forwards";
    effectElement.addEventListener("animationend", () => effectElement.remove());
  };

  let timeoutId = null;
  if (hasTimer) {
    timeoutId = setTimeout(endEffect, statusEffect.duration);
  }

  const effectObject = {
    statusEffect,
    player,
    item,
    element: effectElement,
    endEffect,
    timeoutId,
    hasTimer
  };

  activeStatusEffects.push(effectObject);

  return effectObject;
}

export function removeStatusEffect(effectName, callEnd) {
  const index = activeStatusEffects.findIndex(effectObj => effectObj.statusEffect.name === effectName);
  if (index === -1) return false;

  const effectObject = activeStatusEffects[index];

  clearTimeout(effectObject.timeoutId);

  effectObject.statusEffect.onEnd(effectObject.player, effectObject.item);

  const element = effectObject.element;
  if (element) {
    element.style.animation = "shrinkAndDissapear 1s forwards";
    element.addEventListener("animationend", () => element.remove(), { once: true });
  }
  activeStatusEffects.splice(index, 1);
}

// window.addEventListener('beforeunload', () => {
//   activeStatusEffects.forEach(effectObj => effectObj.endEffect());
// });

let decimalTracker = 0;
setInterval(() => {
  if (player.scorePerSecond > 0) {
    decimalTracker += player.scorePerSecond / 10;
    while (decimalTracker >= 1) {
      changeScore("add", 1);
      decimalTracker -= 1;
    }
  }
}, 100);