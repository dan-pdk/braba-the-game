import { changeScore, addStatusEffect} from "./currency.js";
import { toggleDarkMode, toggleDevMode } from "./main.js";
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
    addStatusEffect(player, item, {
      name: "Borrachado",
      image: "assets/img/item/borracha.png",
      description: "Você se sente mais... seco? <br><span>+1 B$/clique</span>",
      duration: 30000,

      onStart: (player, item) => {
        player.scorePerClick += 1;
      },
      onEnd: (player, item) => {
        player.scorePerClick -= 1;
        item.bought = false;
        item.buttonElement.textContent = "Comprar";
        item.buttonElement.classList.remove('bought');
      },
    });
  },
  gravadorEffect: (player, item) => {
    player.scorePerSecond += 1;
    changeScore("add", 0);
  },
  luizEffect: (player, item) => {
    player.scorePerSecond += 3;
  }
};

export const settingEffects = {
  buttonScale: (value) => {
    const button = document.getElementById('main-button');
    button.style.transform = `scale(${value/10})`;
  },
  buttonText: (value) => {
    const button = document.getElementById('main-button');
    button.textContent = value;
  },
  currencyName: (value) => {
    changeScore('add', 0)
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
}
