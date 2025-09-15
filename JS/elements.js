import { addScoreObserver } from './currency.js';
import getPlayer, { player } from './data.js';

export function createScorePopup() {
  const wrapper = document.querySelector('.popup-wrapper');

  const popup = document.createElement('div');
  popup.classList.add('score-popup');
  popup.innerHTML = `+${player.scorePerClick}`;

  const wrapperWidth = wrapper.clientWidth;
  const wrapperHeight = wrapper.clientHeight;

  const randomX = Math.random() * (wrapperWidth - 20);
  const randomY = Math.random() * (wrapperHeight - 20);

  popup.style.left = `${randomX}px`;
  popup.style.top = `${randomY}px`;
  popup.style.zIndex = "-1";

  wrapper.appendChild(popup);

  popup.addEventListener('animationend', () => popup.remove());
}

const unlockableButtons = [
  {name: "shop", element: document.getElementById('shop-button'), minScore: 40},
  {name: "settings", element: document.getElementById('settings-button'), minScore: 10}
]

export function unlockGuiButtons() {
  unlockableButtons.forEach(object => {
    if (object.minScore <= player.score) {
      object.element.classList.remove('hide');
      object.element.style.animation = "guiButtonPopup 1s ease-out forwards";
    }
  })
}
addScoreObserver(unlockGuiButtons);

let isShopOpen = false;
unlockableButtons[0].element.addEventListener('click', () => {
  const shopGui = document.querySelector('.shop-main-gui')
  document.body.appendChild(shopGui);

  if (isShopOpen) {
    shopGui.style.animation = 'shopGuiOpen 1.5s reverse';
    isShopOpen = false;
    shopGui.addEventListener('animationend', () => {
      if (isShopOpen == false) {
        shopGui.classList.toggle('hide')
      }
    }, {once: true})
  } else {
    shopGui.style.animation = 'shopGuiOpen 1.5s forwards'
    isShopOpen = true;
    shopGui.classList.toggle('hide');
  }
  console.log(`Shop open? ${isShopOpen}. Animation: ${shopGui.style.animation}`)
})

const shopItems = [];

export function createShopItem(name, cost, description, image, effect) {
  const item = {
    name: name,
    cost: cost,
    description: description,
    image: image,
    effect: effect
  }
  shopItems.push(item);
  return item
}

export function appendShopItem(item) {
  const createdItem = document.createElement('div');
  const shopElement = document.querySelector('#shop-main-gui');

  shopElement.appendChild(createdItem);

  const itemName = document.createElement('h1');
  itemName.innerHTML = `${description}`;
  itemName.classList.add('item-title');

  const itemImage = document.createElement('img');
  itemImage.src = item.image;
  itemImage.classList.add('item-image');

  const itemBuyButton = document.createElement('div');
  itemBuyButton.textContent = "Comprar";
  itemBuyButton.classList.add('item-buy-button');

  itemBuyButton.addEventListener('click', buyItem(item, getPlayer()));
}