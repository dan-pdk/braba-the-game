export let player = {
  score: 0,
  level: 0,
  scorePerClick: 1,
  scorePerSecond: 0,
  settings: {
    abbreviateNumbers: true,
    devMode: false
  },
  items: {},
  bonuses: {},
  extras: {
    hasUsedDevMode: false
  },
  aura: 0
};

export let defaultPlayer = {
  score: 0,
  level: 0,
  scorePerClick: 1,
  scorePerSecond: 0,
  settings: {
    abbreviateNumbers: true,
    devMode: false
  },
  items: {},
  bonuses: {},
  extras: {
    hasUsedDevMode: false
  },
  aura: 0
}

export function getPlayer() {
  return player;
}