import { player, effects, scoreObservers } from './data.js';
import { addHoverTooltip } from "./elements.js";


export function addScoreObserver(fn) {
  scoreObservers.push(fn);
}

export function changeScore(operation, amount) {
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

  scoreObservers.forEach(fn => {
    fn(player);
  });
}

export function canBuy(item, player) {
  return !item.bought && player.score >= item.cost;
}

export function buyItem(item, player) {
  if (canBuy(item, player)) {
    changeScore('remove', item.cost);

    item.bought = true;
    item.buttonElement.textContent = "✅";
    item.buttonElement.classList.add('bought');
    item.buttonElement.classList.remove('unbuyable');

    item.effect(player, item);
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
  if (number < 1000) { return number.toString(); }

  const suffixes = ['', "k", "M", "B", "T", "Q", "Qui", "Sx"];
  let numberScale = Math.floor(Math.log10(number) / 3);
  const suffix = suffixes[numberScale] || "";

  let power = number / Math.pow(1000, numberScale);

  const treatedNumber = parseFloat(power.toFixed(2)).toString();

  return treatedNumber + suffix;
}

console.log(abbreviateNumber(432321))

export function addStatusEffect(player, item, statusEffect) {
  const wrapper = document.getElementById('status-effects');

  const effectElement = document.createElement('img');
  wrapper.appendChild(effectElement);

  effectElement.src = statusEffect.image;
  effectElement.classList.add('status-effect-icon');

  const effectEndTime = Date.now() + statusEffect.duration;

  addHoverTooltip(effectElement, statusEffect.name, statusEffect.description, effectEndTime);

  statusEffect.onStart(player, item);
  setTimeout(() => {
    statusEffect.onEnd(player, item);
    effectElement.style.animation = "shrinkAndDissapear 1s forwards";
    effectElement.addEventListener('animationend', () => {
      effectElement.remove();
    })
  }, statusEffect.duration);
}

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