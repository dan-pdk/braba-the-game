import { player } from './data.js';
import { createScorePopup } from './elements.js';
import { changeScore, addScoreObserver } from './currency.js';

const button = document.getElementById('main-button');
const scoreDisplay = document.getElementById('score-display');

function updateScoreDisplay(score) {
  scoreDisplay.textContent = `${score} brabas`;
  document.querySelector('title').textContent = `${score} brabas - Braba Simulator`
};
addScoreObserver(updateScoreDisplay);

function onClick() {
  changeScore('add', player.scorePerClick);
  createScorePopup();
}

button.addEventListener('click', onClick);


