import { drawProgressBar, getProgressBar, openDataDeletionScreen, updateProgressBar } from "./elements.js";
import { changeScore, addStatusEffect, abbreviateNumber, removeStatusEffect, hasStatusEffect, addScoreObserver } from "./currency.js";
import { toggleDarkMode, toggleDevMode, onClick } from "./main.js";
import { player, log } from "./player.js";

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

    if (!player.bonuses.borracha) {
      player.bonuses.borracha = { clickCounter: 0, isActive: false };
    }

    drawProgressBar({
      id: "borracha-progress",
      icon: "assets/img/item/borracha.png",
      color: "#7c8bfc",
      current: 0,
      max: 10,
      label: null
    })

    function incrementClickBonus() {
      updateProgressBar('borracha-progress', {
        current: player.bonuses.borracha.clickCounter,
        max: 10,
        label: null
      })
      if (player.bonuses.borracha.clickCounter >= 10) {
        player.bonuses.borracha.clickCounter = 0;
        player.bonuses.borracha.isActive = true;
      } else {
        player.bonuses.borracha.clickCounter += 1;
      }
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
        description: `Você está armado até os dentes. Colocar em bolsa, arremessar... qualquer coisa.<br><span>+${player.items[item.id] + 1}x mais B$ no próximo clique</span>`,
        duration: 0,
        onStart: () => { },
        onEnd: () => { }
      }, false);
    }
    removeStatusEffect("Tijolado");
    addTijoloEffect();

    let timeWithoutClicking;
    function handleTijoloClicks() {
      if (hasStatusEffect("Tijolado")) {
        removeStatusEffect("Tijolado");
        timeWithoutClicking = setTimeout(addTijoloEffect, bonus.delay);
      } else {
        clearTimeout(timeWithoutClicking);
        timeWithoutClicking = setTimeout(addTijoloEffect, bonus.delay);
      }
    }

    if (!button.dataset.hasTijoloEventListener) {
      button.addEventListener('click', handleTijoloClicks);
      button.dataset.hasTijoloEventListener = "true";
    }
  },
  pretreinoEffect: (player, item) => {
    const effectTime = (30 - player.items[item.id] >= 0) ? (30 - player.items[item.id]) * 1000 : null;
    addStatusEffect({}, {
      name: "Absorvendo",
      image: "assets/img/effects/cariani.png",
      description: "AGORA VAI! AGORA VAI!!<span><br>+1 B$/clique ao final</span>",
      duration: effectTime,
      onStart: () => { },
      onEnd: (player, item) => {
        player.scorePerClick++;
      },
    },
      true);
  },
  carteiraEffect: (player, item) => {
    if (!player.bonuses.carteira) {
      player.bonuses.carteira = {
        max: 500,
        collected: 0,
        multiplier: 0,
        listenerAdded: false,
        isApplyingReward: false
      };

    }

    drawProgressBar({
      id: "carteira-progress",
      icon: "assets/img/item/carteira.png",
      color: "#61f533",
      current: 0,
      max: 500 + (player.items[item.id] * 10),
      label: null
    });
    
    const bonus = player.bonuses.carteira;
    bonus.multiplier = parseFloat((player.items[item.id] * 0.05).toFixed(2));
    bonus.max = 490 + (player.items[item.id] * 10);
    
    updateProgressBar('carteira-progress', {
      current: bonus.collected,
      max: bonus.max,
      label: null
    });
    
    function showCarteiraBonus(value) {
      const bar = getProgressBar('carteira-progress').element;
      const previous = document.querySelector('.carteira-popup');
      if (previous) previous.remove();
      const popup = document.createElement('span');
      bar.appendChild(popup);

      popup.textContent = `+${value}`
      popup.classList.add('carteira-popup');
      popup.addEventListener('animationend', () => {popup.remove()});
    }

    if (!bonus.handleCarteiraScore) {
      bonus.handleCarteiraScore = function handleCarteiraScore(newScore, diff) {
        if (diff <= 0 || bonus.isApplyingReward) return;

        bonus.collected += diff;

        updateProgressBar('carteira-progress', {
            current: bonus.collected,
            max: bonus.max,
            label: null
          });
        

        while (bonus.collected >= bonus.max) {

          bonus.collected -= bonus.max;
          const reward = Math.floor(bonus.max * bonus.multiplier);

          updateProgressBar('carteira-progress', {
            current: bonus.collected,
            max: bonus.max,
            label: null
          });

          showCarteiraBonus(reward);
          console.log(reward);
          bonus.isApplyingReward = true;
          changeScore('add', reward);
          bonus.isApplyingReward = false;


        }
      };

      addScoreObserver(bonus.handleCarteiraScore);
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
    const tooltip = document.querySelector('.tooltip');
    if (tooltip && value == true) {
      tooltip.style.backgroundColor = `#252525`;
    } else {
      tooltip.style.backgroundColor = `#c0c0c0`;
    }
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
  showProgressBars: (value) => {
    const barContainer = document.getElementById("progress-bars-wrapper");
    barContainer.classList.toggle('hide');
  },
  resetData: (value) => {
    openDataDeletionScreen();
  }
}