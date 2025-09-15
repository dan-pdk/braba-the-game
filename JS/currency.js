import { player } from './data.js';

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
  }

  scoreObservers.forEach(fn => {
    fn(player.score);
  });
}

export function buyItem(item, player) {
  
}