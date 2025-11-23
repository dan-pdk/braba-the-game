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
    player.scorePerSecond += 1;
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

  cadeiraEffect: (player, item) => {
    removeStatusEffect('Sentado');
    const button = document.querySelector('#main-button');

    if (!player.bonuses.cadeira) {
      player.bonuses.cadeira = {
        isActive: false,
        currentBonus: 0,
        stepBonus: 0,
        maxBonus: 0,
        delay: 5000
      }
    }

    const bonus = player.bonuses.cadeira;
    bonus.stepBonus = player.items[item.id] * 2;
    bonus.maxBonus = player.items[item.id] * 50;

    function addCadeiraEffect() {
      removeStatusEffect('Sentado');
      addStatusEffect(item, {
        name: "Sentado",
        image: "assets/img/item/cadeira.png",
        description:
          `Tô bem... Tô zen...<br><span>+${bonus.stepBonus} BpS por segundo sem clicar até um limite de ${bonus.maxBonus}</span>`,
        duration: 0,
        onStart: () => {},
        onEnd: () => {}
      });
    }

    function applyBonus() {
      if (!hasStatusEffect("Sentado")) return;

      if (bonus.currentBonus < bonus.maxBonus) {
        bonus.currentBonus += bonus.stepBonus;
        if (bonus.currentBonus > bonus.maxBonus) {
          bonus.currentBonus = bonus.maxBonus;
        }
        player.scorePerSecond += bonus.stepBonus;
      }
    }

    let timeNoClick;
    let loop;

    function handleCadeiraClicks() {
      removeStatusEffect("Sentado");
      clearTimeout(timeNoClick);
      clearInterval(loop);

      player.scorePerSecond -= bonus.currentBonus;
      bonus.currentBonus = 0;

      timeNoClick = setTimeout(() => {
        addCadeiraEffect();
        loop = setInterval(() => {
          applyBonus();
        }, 1000);

      }, bonus.delay);
    }

    if (!button.dataset.hasCadeiraEventListener) {
      button.addEventListener('click', handleCadeiraClicks);
      button.dataset.hasCadeiraEventListener = "true";

      
      handleCadeiraClicks();
    }
    handleCadeiraClicks();
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
      const popup = document.createElement('span');
      bar.appendChild(popup);

      popup.textContent = `+${value}`
      popup.classList.add('carteira-popup');
      popup.addEventListener('animationend', () => { popup.remove() });
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
    document.documentElement.style.setProperty('--scale-override', (value / 10).toString());
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
    if (value === true) barContainer.classList.remove('hide');
    else barContainer.classList.add('hide');
  },
  monospaceFont: (value) => {
    const scoreDisplay = document.getElementById('score-display');
    if (!value) scoreDisplay.style.fontFamily = `Trebuchet MS, Lucida Sans Unicode`;
    else scoreDisplay.style.fontFamily = `monospace`;
  },
  resetData: (value) => {
    openDataDeletionScreen();
  }
}

export const itemTooltipInfo = {
  inspiracao: (player, item) => {
    const level = Number(player?.items?.[item.id]) || 0;
    const totalSps = Number(player?.scorePerSecond) || 0;

    const contribution = totalSps > 0 ? ((level / totalSps) * 100).toFixed(1) : 0;

    return `
      <b>${abbreviateNumber(level)}</b> níveis de Inspiração geram
      <b>${abbreviateNumber(level)}</b> brabas por segundo,
      ou <b>${abbreviateNumber(contribution)}%</b> de um total de
      <b>${abbreviateNumber(totalSps)}</b> BpS
    `;
  },

  borracha: (player, item) => {
    const level = Number(player?.items?.[item.id]) || 0;
    const bonus = 2 * level;
    const clicksBase = Number(player?.scorePerClick) || 0;
    const BORRACHA_MAX = 10;

    return `
      <b>${abbreviateNumber(level)}</b> níveis de Borracha concedem
      <b>+${abbreviateNumber(bonus)}</b> B$ a cada <b>${BORRACHA_MAX}</b>
      cliques, ou <b>+${abbreviateNumber(bonus + clicksBase)}</b> B$
      com o clique base
    `;
  },

  gravador: (player, item) => {
    const level = Number(player?.items?.[item.id]) || 0;
    const bonus = 5 * level;

    return `
      <b>${abbreviateNumber(level)}</b> níveis de Microfone concedem
      um bônus máximo de <b>+${abbreviateNumber(bonus)}</b> BpS
    `;
  },

  cadeira: (player, item) => {
    const level = Number(player.items?.[item.id] || 0);
    const bonus = 2 * level;
    const max = 100 * level;

    return `
      <b>${abbreviateNumber(level)}</b> níveis de Cadeira concedem <b>+${abbreviateNumber(bonus)}</b> BpS por tique, até um máximo de <b>+${abbreviateNumber(max)}</b> BpS.
    `
  },

  tijolo: (player, item) => {
    const level = Number(player?.items?.[item.id]) || 0;
    const multi = level * 100;

    return `
      <b>${abbreviateNumber(level)}</b> níveis de Tijolo concedem
      <b>+${abbreviateNumber(multi)}%</b>
      (ou <b>${abbreviateNumber(level + 1)}x</b>) B$ ao clicar,
      quando carregado
    `;
  },

  pretreino: (player, item) => {
    const level = Number(player.items[item.id]) || 0;
    const time = level < 30 ? 30 - level : 0;

    return `
      <b>${level}</b> níveis de Pré-treino concedem
      <b>+${level}</b> B$/clique, demorando
      <b>${time}s</b> para bater
    `;
  },

  carteira: (player, item) => {
    const level = Number(player?.items?.[item.id]) || 0;

    const max = (Number(player?.bonuses?.carteira?.max)).toFixed(0) || 0;
    const mult = (Number(player?.bonuses?.carteira?.multiplier)).toFixed(0) || 0;
    const percent = (mult * 100).toFixed(0);
    const reward = (max * mult).toFixed(0);

    return `
      <b>${abbreviateNumber(level)}</b> níveis de Carteira concedem
      um armazenamento máximo de <b>${abbreviateNumber(max)}</b> B$,
      que recebe um bônus de <b>+${abbreviateNumber(percent)}%</b>,
      ou <b>+${abbreviateNumber(reward)}</b> B$ ao encher
    `;
  },
};
