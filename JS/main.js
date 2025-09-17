import { player, effects } from './data.js';
import { appendShopItem, createScorePopup, createShopItem } from './elements.js';
import { changeScore, addScoreObserver } from './currency.js';

changeScore("add", 0);
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

// chamar função append com objeto convertido do JSON. eu odeio isso
fetch("JS/JSON/shop-items.json")
.then(response => response.json())
.then(data => {
  data.forEach(rawItem => {
    const processedItem = createShopItem(
      rawItem.name,
      rawItem.cost,
      rawItem.minScore,
      rawItem.description,
      rawItem.image,
      rawItem.tier,
      effects[rawItem.effect]
    );
    appendShopItem(processedItem);
  });
})

let devMode = true;
if (devMode) {
  document.body.addEventListener('keypress', (event) =>{
    if (event.key === "p") {
      changeScore("add", 100);
    }
  })
}