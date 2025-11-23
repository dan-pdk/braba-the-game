import { hide, player, show } from "./player.js";
import { appendSetting, appendShopItem, createScorePopup, createSetting, createShopItem, devModeSetScore, unlockGuiButtons } from './elements.js';
import { changeScore, addScoreObserver, addStatusEffect, abbreviateNumber, removeStatusEffect, hasStatusEffect } from './currency.js';
import { applyPlayerData, loadPlayerData, savePlayerData } from './storage.js';

window.addEventListener('beforeunload', () => {
  savePlayerData();
})
setInterval(() => {
  savePlayerData();
}, 15000);

changeScore("add", 0);
const button = document.getElementById('main-button');
const scoreDisplay = document.getElementById('score-display');

export function updateScoreDisplay() {
  scoreDisplay.textContent = `${abbreviateNumber(player.score)} ${player.settings.currencyName || "brabas"}`;

  const microfonePS = player.bonuses?.gravador?.currentBonus || 0;
  const cadeiraPS = player.bonuses?.cadeira?.currentBonus || 0;
  
  const totalPS = player.scorePerSecond;
  const hasAnyBonus = microfonePS > 0 || cadeiraPS > 0;

  if (totalPS > 0 || hasAnyBonus) show(document.querySelector('#score-ps-display'));
  else hide(document.querySelector('#score-ps-display'));
  document.querySelector('#score-ps').textContent = `${abbreviateNumber(player.scorePerSecond - microfonePS - cadeiraPS)} `;

  if (microfonePS > 0) {
    const display = document.querySelector('#microfone-ps > span');
    display.textContent = `+${abbreviateNumber(microfonePS)} `;
    show(display.parentElement);
  } else hide(document.querySelector('#microfone-ps'));

  if (cadeiraPS > 0) {
    const display = document.querySelector('#cadeira-ps > span');
    display.textContent = `+${abbreviateNumber(cadeiraPS)} `;
    show(display.parentElement);
  } else hide(document.querySelector('#cadeira-ps'));
};

addScoreObserver(updateScoreDisplay);

setInterval(() => {
  document.querySelector('title').textContent = `${abbreviateNumber(player.score)} brabas - Braba the Game`;
}, 1000)
setInterval(() => {
  updateScoreDisplay();
}, 500);

export function onClick() {
  const tijoloActive = hasStatusEffect("Tijolado");
  const borrachaActive = player.bonuses?.borracha?.isActive;
  const tijoloMultiplier = player.bonuses?.tijolo?.multiplier || 1;
  const borrachaLvl = player.items?.borracha || 0;

  let value = player.scorePerClick;
  let type = 'default';

  if (borrachaActive && tijoloActive) {
    value = (player.scorePerClick + 2 * borrachaLvl) * tijoloMultiplier;
    type = 'crit'
  } else if (borrachaActive) {
    value += 2 * borrachaLvl;
    type = 'borracha';
  } else if (tijoloActive) {
    value *= tijoloMultiplier;
    type = 'tijolo';
  }

  changeScore('add', value);
  createScorePopup(value, type);
}

button.addEventListener('click', onClick);
button.addEventListener('keypress', () => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
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
        rawItem.tier,
        rawItem.appliesOnlyStats
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

    window.activeStatusEffects = [];

    window.addEventListener('beforeunload', () => {
      for (const { player, item, statusEffect } of window.activeStatusEffects) {
        if (statusEffect && typeof statusEffect.onEnd === 'function') {
          statusEffect.onEnd(player, item);
        }
      }
      window.activeStatusEffects = [];
    });

    console.log("Shop & Settings data loaded succesfully");
  } catch (error) {
    console.error("Error loading game data", error);
  }
}

function devModeTools(event) {
  if (event.key == "p") {
    changeScore("add", 100);
  } else if (event.key === "o" || event.key === "O") {
    player.scorePerSecond += 1;
  } else if (event.key === "l" || event.key === "L") {
    player.scorePerSecond = 0;
    changeScore("remove", player.score);
  } else if (event.key === "[") {
    addStatusEffect({}, {
      name: "Macaco",
      image: "assets/img/item/test.png",
      description: "tem um macaco na minha tela<br><span>+macaco na tela</span>",
      duration: 10000,
      onStart: (player, item) => {
        console.log("oi");
      },
      onEnd: (player, item) => {
        console.log("macaco sumiu");
      },
    },
  true);
  } else if (event.key === "i" || event.key === "I") {
    devModeSetScore();
  }
}

export function toggleDevMode() {
  const info = document.getElementById('dev-mode-info');
  if (player.settings.devMode == true) {
    info.classList.remove('hide');
    document.body.addEventListener('keypress', devModeTools)
  } else {
    info.classList.add('hide');
    document.body.removeEventListener('keypress', devModeTools)
  }

  if (!player.extras.hasUsedDevMode) {
    player.extras.hasUsedDevMode = true;
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
      badge.classList.add('new-badge');
      badge.textContent = 'Novo!';
      title.prepend(badge);
    }
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  await loadGameData();
  loadPlayerData();
  applyPlayerData();
  unlockGuiButtons();
  setTimeout(() => { changeScore('add', 0)}, 50);
});