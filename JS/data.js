import { changeScore, addStatusEffect} from "./currency.js";

export let player = {
  score: 0,
  level: 0,
  scorePerClick: 1,
  scorePerSecond: 0,
};

export let scoreObservers = [];

export default function getPlayer() {
  return player;
}

export const effects = {
  inspiracaoEffect: (player, item) => {
    player.scorePerClick += 1;
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
  }
};
