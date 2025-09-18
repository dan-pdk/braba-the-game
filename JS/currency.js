import { player, effects } from './data.js';

const scoreObservers = [];

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
    fn(player.score);
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
    item.buttonElement.classList.remove('unbuyable')

    item.effect(player);
  }
}