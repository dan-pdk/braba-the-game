import { addScoreObserver, buyItem } from './currency.js';
import getPlayer, { player, effects } from './data.js';

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
})

const shopItems = [];

export function createShopItem(name, cost, minScore, description, image, tier, effect) {
  const item = {
    name: name,
    cost: cost,
    minScore: minScore,
    description: description,
    image: image,
    tier: tier,
    effect: effect
  }
  shopItems.push(item);
  return item
}

export function appendShopItem(item) {
  const createdItem = document.createElement('div');
  const shopElement = document.querySelector('.shop-main-gui');

  shopElement.appendChild(createdItem);
  createdItem.classList.add('item', 'hide');
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
  if (item.tier >= 0 && item.tier < 6) {
    itemImage.classList.add(`tier-${item.tier}`);
  } else {
    // throw new Error(`${item.name}'s tier is not in range (${item.tier})`);
  }

  const itemCost = document.createElement('div');
  itemCost.innerHTML = `B$ ${item.cost}`;
  itemCost.classList.add('item-cost');
  createdItem.appendChild(itemCost);

  const itemBuyButton = document.createElement('div');
  itemBuyButton.textContent = "Comprar";
  itemBuyButton.classList.add('item-buy-button');
  createdItem.appendChild(itemBuyButton);

  item.element = createdItem;
  item.buttonElement = itemBuyButton;
  item.bought = false;

  itemBuyButton.addEventListener('click', () => {
    if (!item.bought){
      buyItem(item, getPlayer());
      }
    }
  )
};

function revealItemsWithMinScore(player) {
  shopItems.forEach(item => {
    if (player.score >= item.minScore && item.element.classList.contains('hide')) {
      item.element.classList.remove('hide');
    }
  })
}

function updateShopButtonColor(player) {
  shopItems.forEach(item => {
    if (item.bought) return;
    if (player.score >= item.cost) {
      const buyButton = item.buttonElement;
      buyButton.classList.remove('unbuyable');
      buyButton.innerHTML = "Comprar";
    } else {
      const buyButton = item.buttonElement;
      buyButton.classList.add('unbuyable');
      buyButton.innerHTML = `❌ ${item.cost}`;
    }
  })
}
addScoreObserver(revealItemsWithMinScore);
addScoreObserver(updateShopButtonColor);