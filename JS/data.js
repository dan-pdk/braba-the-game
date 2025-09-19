import { changeScore } from "./currency.js";

export let player = {
  score: 0,
  level: 0,
  scorePerClick: 1,
  scorePerSecond: 0,
};

export default function getPlayer() {
  return player;
}

export const effects = {
  inspiracaoEffect: (player) => {
    player.scorePerClick += 1;
  },
  borrachaEffect: (player) => {
    
  },
  gravadorEffect: (player) => {
    player.scorePerSecond += 1;
    changeScore("add", 0);
  }
};
