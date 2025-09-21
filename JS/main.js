import { player, effects } from './data.js';
import { appendShopItem, createScorePopup, createShopItem } from './elements.js';
import { changeScore, addScoreObserver, addStatusEffect, abbreviateNumber } from './currency.js';

changeScore("add", 0);
const button = document.getElementById('main-button');
const scoreDisplay = document.getElementById('score-display');

function updateScoreDisplay(player) {
  scoreDisplay.textContent = `${abbreviateNumber(player.score)} brabas`;
  document.querySelector('title').textContent = `${abbreviateNumber(player.score)} brabas - Braba Simulator`;

  if (player.scorePerSecond > 0) {
    const scorePerSecondDisplay = document.getElementById('score-ps-display');
    scorePerSecondDisplay.textContent = `${abbreviateNumber(player.scorePerSecond)} por segundo`
  }
};
addScoreObserver(updateScoreDisplay);

function onClick() {
  changeScore('add', player.scorePerClick);
  createScorePopup();
}

button.addEventListener('click', onClick);

fetch("JS/JSON/shop-items.json")
.then(response => response.json())
.then(rawItems => {
  rawItems.forEach(rawItem => {
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
  const info = document.getElementById('dev-mode-info');
  info.innerHTML = "Dev Mode on<br>O: +1 braba/s<br>P: +100 brabas <br> L: Reset brabas<br> [: Teste de Status Effect";

  document.body.addEventListener('keypress', (event) =>{
    if (event.key === "p") {
      changeScore("add", 100);
    } else if (event.key === "o") {
      player.scorePerSecond += 1;
    } else if (event.key === "l") {
      changeScore("remove", player.score);
    } else if (event.key === "[") {
      addStatusEffect(player, {}, {
        name: "Macaco",
        image: "assets/img/item/test.png",
        description: "tem um macaco na minha tela<br><span>+macaco na tela</span>",
        duration: 100000,

        onStart: (player, item) => {
         console.log("oi");
        },
        onEnd: (player, item) => {
        console.log("macaco sumiu kakapa");
        },
      })
    }
  })
}