import { effects } from './data.js';
import { player } from "./player.js";
import { appendSetting, appendShopItem, createScorePopup, createSetting, createShopItem } from './elements.js';
import { changeScore, addScoreObserver, addStatusEffect, abbreviateNumber } from './currency.js';

changeScore("add", 0);
const button = document.getElementById('main-button');
const scoreDisplay = document.getElementById('score-display');

function updateScoreDisplay(player) {
  scoreDisplay.textContent = `${abbreviateNumber(player.score)} ${player.settings.currencyName || "brabas"}`;
  
  if (player.scorePerSecond > 0) {
    const scorePerSecondDisplay = document.getElementById('score-ps-display');
    scorePerSecondDisplay.textContent = `${abbreviateNumber(player.scorePerSecond)} por segundo`
  }
};
addScoreObserver(updateScoreDisplay);
setInterval(() => {
  document.querySelector('title').textContent = `${abbreviateNumber(player.score)} brabas - Braba Simulator`;
}, 500)


function onClick() {
  changeScore('add', player.scorePerClick);
  createScorePopup();
}

button.addEventListener('click', onClick);
button.addEventListener('keypress', () => {
  if (event.key === "Enter") {
    event.preventDefault()
  }
})

async function loadGameData() {
  try {
    const [itemsResponse, settingsResponse] = await Promise.all([
      fetch("JS/JSON/shop-items.json"),
      fetch("JS/JSON/settings.json")
    ]);

    if (!itemsResponse.ok || !settingsResponse.ok) {
      throw new Error(`Error loading JSON files (${itemsResponse.status}, ${settingsResponse.status})`);
    }

    const [rawItems, rawSettings] = await Promise.all([
      itemsResponse.json(),
      settingsResponse.json()
    ]);

    rawItems.forEach(rawItem => {
      const processedItem = createShopItem(
        rawItem.id,
        rawItem.name,
        rawItem.cost,
        rawItem.costFactor,
        rawItem.minScore,
        rawItem.description,
        rawItem.image,
        rawItem.tier
      );
      appendShopItem(processedItem);
    });

    rawSettings.forEach(rawSetting => {
      const processedSetting = createSetting(
        rawSetting.name,
        rawSetting.title,
        rawSetting.type,
        rawSetting.defaultValue,
        rawSetting.minValue,
        rawSetting.maxValue,
        rawSetting.description
      );
      appendSetting(processedSetting);
    });

    console.log("Shop & Settings data loaded succesfully");
  } catch (error) {
    console.error("Error loading game data", error);
  }
}

function devModeTools(event) {
  console.log('listening!')
  console.log(event.key)
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
}

export function toggleDevMode() {
  if (player.settings.devMode == true) {
  const info = document.querySelector('#dev-mode-info');
  info.innerHTML = "Dev Mode on<br>O: +1 braba/s<br>P: +100 brabas <br> L: Reset brabas<br> [: Teste de Status Effect";

  document.body.addEventListener('keypress', devModeTools)
  } else {
    const info = document.getElementById('dev-mode-info');
    info.innerHTML = "";
    document.body.removeEventListener('keypress', devModeTools)
  }
}

export function toggleDarkMode() {
  const darkableElements = document.querySelectorAll('.dark-mode-affected');

  darkableElements.forEach((element) => {
    if (player.settings.darkMode) {
      element.classList.add('dark-mode');
    } else {
      element.classList.remove('dark-mode');
    }
  }) 
}

document.addEventListener('DOMContentLoaded', () => {
  const changelogArticles = document.querySelectorAll('.changelog-article');
  if (changelogArticles.length > 0) {
    const newest = changelogArticles[0];
    const title = newest.querySelector('h2');
    if (title && !title.querySelector('.new-badge')) {
      const badge = document.createElement('span');
      badge.className = 'new-badge';
      badge.textContent = 'Novo!';
      title.prepend(badge);
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  loadGameData();
});

