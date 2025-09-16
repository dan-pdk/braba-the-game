import { addScoreObserver, buyItem } from './currency.js';
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
  { name: "shop", element: document.getElementById('shop-button'), minScore: 40 },
  { name: "settings", element: document.getElementById('settings-button'), minScore: 10 }
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
    }, { once: true })
  } else {
    shopGui.style.animation = 'shopGuiOpen 1.5s forwards'
    isShopOpen = true;
    shopGui.classList.toggle('hide');
  }
  console.log(`Shop open? ${isShopOpen}. Animation: ${shopGui.style.animation}`)
})

const shopItems = [];

export function createShopItem(name, cost, description, image, tier, effect) {
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
  const shopElement = document.querySelector('.shop-main-gui');

  shopElement.appendChild(createdItem);
  createdItem.classList.add('item');
  createdItem.id = `${item.name}-div`

  const itemName = document.createElement('h1');
  itemName.innerHTML = `${item.name}`;
  itemName.classList.add('item-title');
  createdItem.appendChild(itemName)

  const itemDescription = document.createElement('p');
  itemDescription.innerHTML = `${item.description}`;
  itemDescription.classList.add('item-description');
  createdItem.appendChild(itemDescription)

  const itemImage = document.createElement('img');
  itemImage.src = item.image;
  itemImage.classList.add('item-image');
  createdItem.appendChild(itemImage);
  switch (item.tier) {
    case 1:
      itemImage.style.background = "linear-gradient(270deg,rgba(186, 186, 186, 1) 0%, rgba(235, 235, 235, 1) 100%)"
      break;
    case 2:
      itemImage.style.background = "linear-gradient(270deg,rgba(0, 255, 102, 1) 0%, rgba(168, 255, 168, 1) 100%);"
      break;
    case 3:
      itemImage.style.background = "linear-gradient(270deg,rgba(94, 207, 255, 1) 0%, rgba(5, 255, 230, 1) 100%);";
      break;
    case 4:
      itemImage.style.background = "linear-gradient(270deg,rgba(132, 74, 199, 1) 0%, rgba(65, 32, 176, 1) 100%);";
      break;
    case 5:
      itemImage.style.background = "linear-gradient(270deg,rgba(251, 255, 0, 1) 0%, rgba(232, 172, 42, 1) 100%);";
      break;
    default:
      itemImage.style.background = "linear-gradient(270deg,rgba(217, 217, 217, 1) 0%, rgba(247, 247, 247, 1) 100%);"
      break;
  }
  if (item.tier > 6) {
    throw new Error(`tier for ${item.name} is invalid: ${item.tier}`);
  }

  const itemCost = document.createElement('span');
  itemCost.innerHTML = `B$ ${item.cost}`;
  itemCost.classList.add('item-cost');
  createdItem.appendChild(itemCost);

  const itemBuyButton = document.createElement('div');
  itemBuyButton.textContent = "Comprar";
  itemBuyButton.classList.add('item-buy-button');
  createdItem.appendChild(itemBuyButton);


  itemBuyButton.addEventListener('click', buyItem(item, getPlayer()));
}

appendShopItem(
  createShopItem('Inspiração', 55, 'Apertar a braba deve ser bom. Um dia, você vai se tornar o maior apertador de brabas do mundo, e eles vão ver...', 'assets/img/item/insipracao.png', 0, () => {
    console.log('item comprado.');
  })
)