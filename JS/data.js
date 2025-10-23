import { openDataDeletionScreen } from "./elements.js";
import { changeScore, addStatusEffect, abbreviateNumber, removeStatusEffect, hasStatusEffect, } from "./currency.js";
import { toggleDarkMode, toggleDevMode, onClick } from "./main.js";
import { player } from "./player.js";

export let scoreObservers = [];

export default function getPlayer() {
  return player;
}

export const effects = {
  inspiracaoEffect: (player, item) => {
    player.scorePerSecond += 0.5;
  },
  borrachaEffect: (player, item) => {
    const button = document.getElementById('main-button');

    if (!player.bonuses) player.bonuses = {};
    if (!player.bonuses.borracha) {
      player.bonuses.borracha = { clickCounter: 0, isActive: false };
    }

    function incrementClickBonus() {
      if (player.bonuses.borracha.clickCounter >= 10) {
        player.bonuses.borracha.clickCounter = 0;
        player.bonuses.borracha.isActive = true;
      }
      
      console.log(player.bonuses.borracha.clickCounter);
      player.bonuses.borracha.clickCounter += 1;
    }

    if (!button.dataset.hasBorrachaEventListener) {
      button.addEventListener('click', incrementClickBonus);
      button.dataset.hasBorrachaEventListener = "true";
    }
  },
  gravadorEffect: (player, item) => {
    const button = document.getElementById("main-button");
    if (!player.bonuses) player.bonuses = {};
    if (!player.bonuses.gravador) {
      player.bonuses.gravador = { currentBonus: 0, maxBonus: 0, isActive: false }
    };

    const bonus = player.bonuses.gravador;
    bonus.maxBonus = player.items[item.id] * 5;

    let endTimer;
    function handleClicks() {
      if (bonus.currentBonus < bonus.maxBonus) {
        player.scorePerSecond++;
        bonus.currentBonus++;
        bonus.isActive = true;
      }

      clearTimeout(endTimer);
      endTimer = setTimeout(() => {
        player.scorePerSecond -= bonus.currentBonus;
        bonus.currentBonus = 0;
        bonus.isActive = false;
      }, 1567);
    }

    if (!button.dataset.hasMicrofoneListener) {
      button.addEventListener("click", handleClicks);
      button.dataset.hasMicrofoneListener = "true";
    }
  },
  tijoloEffect: (player, item) => {
    const button = document.getElementById('main-button');

    if (!player.bonuses.tijolo) { player.bonuses.tijolo = { isActive: false, multiplier: 2, delay: 5000 } }

    const bonus = player.bonuses.tijolo;
    bonus.multiplier = player.items[item.id] + 1;

    function addTijoloEffect() {
      addStatusEffect(item, {
        name: "Tijolado",
        image: "assets/img/item/tijolo.png",
        description: `Você está armado até os dentes. Colocar em bolsa, arremessar... qualquer coisa.<br><span>+${player.items[item.id] + 1}x  B$ no próximo clique</span>`,
        duration: 0,
        onStart: () => {},
        onEnd: () => {}
      }, false);
    }
    removeStatusEffect("Tijolado");
    addTijoloEffect();

    let timeWithoutClicking;
    function handleTijoloClicks() {
      if (hasStatusEffect("Tijolado")) {

        if (player.bonuses.borracha?.isActive) {
          changeScore('add', (((2 * player.items.borracha + player.scorePerClick)) * multiplier));
        } else {
          changeScore('add', player.scorePerClick * bonus.multiplier);
        }

        removeStatusEffect("Tijolado");
        timeWithoutClicking = setTimeout(() => {
          addTijoloEffect();
        }, bonus.delay);
      } else {
        clearTimeout(timeWithoutClicking)
        timeWithoutClicking = setTimeout(() => {
          addTijoloEffect();
        }, bonus.delay);
      }
    }

    if (!button.dataset.hasTijoloEventListener) {
      button.addEventListener('click', handleTijoloClicks);
      button.dataset.hasTijoloEventListener = "true";
    }
  }
}

export const settingEffects = {
  buttonScale: (value) => {
    const button = document.getElementById('main-button');
    button.style.transform = `scale(${value / 10})`;
  },
  buttonText: (value) => {
    const button = document.getElementById('main-button');
    button.textContent = value;
  },
  currencyName: (value) => {
    changeScore('add', 0);
  },
  darkMode: (value) => {
    toggleDarkMode();
  },
  showChangelog: (value) => {
    const changelogButton = document.getElementById('changelog-button');
    if (value == true) {
      changelogButton.classList.remove('hide');
    } else {
      changelogButton.classList.add('hide');
    }
  },
  devMode: (value) => {
    toggleDevMode();
  },
  resetData: (value) => {
    openDataDeletionScreen();
  }
}