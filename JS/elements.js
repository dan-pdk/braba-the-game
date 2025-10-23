import { abbreviateNumber, addScoreObserver, buyItem, formatTime } from './currency.js';
import { effects, scoreObservers, settingEffects } from './data.js';
import { player } from "./player.js";
import { resetPlayerData } from './storage.js';

export function createScorePopup(value) {
  if (player.settings.showPopups == false) return;
  const wrapper = document.querySelector('.popup-wrapper');

  const popup = document.createElement('div');
  popup.classList.add('score-popup');

  if (player.bonuses?.borracha?.isActive) {
    popup.classList.add('borracha-buffed-popup');
    popup.textContent = `+${player.scorePerClick + 2 * player.items.borracha}`;
    popup.style.display = 'flex';
    popup.style.alignItems = 'center';
    popup.style.zIndex = '130'
    player.bonuses.borracha.isActive = false;

    const icon = document.createElement('img');
    icon.src = 'assets/img/item/borracha.png';
    icon.classList.add('popup-icon');

    popup.appendChild(icon);
  } else {
    popup.innerHTML = `+${value}`;
  }

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

export function devModeInfo() {
  const button = document.getElementById('dev-mode-info');
  const info = document.getElementById('dev-mode-details');
  const closeButton = document.querySelector('#dev-mode-details > #close-button');

  closeButton.addEventListener('click', () => info.classList.add('hide'))
  button.addEventListener('click', () => info.classList.remove('hide'))
}

const unlockableButtons = [
  { name: "shop", element: document.getElementById('shop-button'), minScore: 40 },
  { name: "settings", element: document.getElementById('settings-button'), minScore: 10 },
]

export function unlockGuiButtons() {
  unlockableButtons.forEach(object => {
    if (object.minScore <= player.score) {
      object.element.classList.remove('hide');
      object.element.style.animation = "guiButtonPopup 1s ease-out forwards";
    }
  })
}

let isSettingsOpen = false;
unlockableButtons[1].element.addEventListener('click', () => {
  const settingsGui = document.querySelector('.settings-main-gui');
  const button = unlockableButtons[1].element;

  if (isSettingsOpen) {
    settingsGui.style.animation = "none";
    settingsGui.offsetHeight;// force reflow
    settingsGui.style.animation = "settingsGuiOpen 1s reverse";
    button.classList.remove('selected-gui-button');

    settingsGui.addEventListener('animationend', () => {
      settingsGui.classList.add('hide');
    }, { once: true });

    isSettingsOpen = false;
  } else {
    settingsGui.classList.remove('hide');
    settingsGui.style.animation = "none";
    settingsGui.offsetHeight;// force reflow
    settingsGui.style.animation = "settingsGuiOpen 1s forwards";

    button.classList.add('selected-gui-button');
    isSettingsOpen = true;
  }
});

let isShopOpen = false;
unlockableButtons[0].element.addEventListener('click', () => {
  const shopGui = document.querySelector('.shop-main-gui')

  if (isShopOpen) {
    shopGui.style.animation = "none";
    shopGui.offsetHeight;
    shopGui.style.animation = 'shopGuiOpen 0.75s reverse';
    unlockableButtons[0].element.classList.remove('selected-gui-button');
    isShopOpen = false;
    shopGui.addEventListener('animationend', () => {
      if (isShopOpen == false) {
        shopGui.classList.toggle('hide')
      }
    }, { once: true })
  } else {
    shopGui.style.animation = "none";
    shopGui.offsetHeight;
    shopGui.style.animation = 'shopGuiOpen 0.75s forwards';
    unlockableButtons[0].element.classList.add('selected-gui-button');
    isShopOpen = true;
    shopGui.classList.toggle('hide');
  }
})

let isChangelogOpen = false;
const changelogButton = document.querySelector('#changelog-button');

changelogButton.addEventListener('click', () => {
  const changelogGui = document.querySelector('#changelog');

  changelogGui.classList.toggle('hide');
  isChangelogOpen = !isChangelogOpen;
})

export const shopItems = [];

export function createShopItem(id, name, cost, costFactor, minScore, description, image, tier, appliesOnlyStats) {
  const item = {
    id: id,
    name: name,
    cost: Number(cost),
    costFactor: Number(costFactor),
    minScore: Number(minScore),
    description: description,
    image: image,
    tier: tier,
    appliesOnlyStats: appliesOnlyStats
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
    throw new Error(`${item.name}'s tier is not in range (${item.tier})`);
  }

  const itemCost = document.createElement('div');
  itemCost.innerHTML = `B$ ${abbreviateNumber(item.cost)}`;
  itemCost.classList.add('item-cost');
  createdItem.appendChild(itemCost);

  const itemBuyButton = document.createElement('div');
  itemBuyButton.textContent = "Comprar";
  itemBuyButton.classList.add('item-buy-button');
  createdItem.appendChild(itemBuyButton);

  const itemCountDisplay = document.createElement('span');
  itemCountDisplay.classList.add('item-count-display');
  itemName.appendChild(itemCountDisplay)

  item.element = createdItem;
  item.baseCost = item.cost;
  item.buttonElement = itemBuyButton;
  item.costDisplay = itemCost;
  item.countDisplay = itemCountDisplay;

  itemBuyButton.addEventListener('click', () => {
    buyItem(item, player);
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

function updateBuyButtonColor(player) {
  shopItems.forEach(item => {
    if (player.score >= item.cost) {
      const buyButton = item.buttonElement;
      buyButton.classList.remove('unbuyable');
      buyButton.innerHTML = "Comprar";
    } else {
      const buyButton = item.buttonElement;
      buyButton.classList.add('unbuyable');
      buyButton.innerHTML = `❌ ${abbreviateNumber(item.cost)}`;
    }
  })
}

const tooltip = document.createElement('div');
document.body.appendChild(tooltip);
tooltip.classList.add('tooltip', 'hide');

const tooltipComponentsWrapper = document.createElement('div');
tooltipComponentsWrapper.classList.add('tooltip-wrapper')
tooltip.appendChild(tooltipComponentsWrapper)

const tooltipTitle = document.createElement('h1');
const tooltipDescription = document.createElement('p');
const tooltipTime = document.createElement('div');

tooltipComponentsWrapper.appendChild(tooltipTitle);
tooltipComponentsWrapper.appendChild(tooltipDescription);
tooltipComponentsWrapper.appendChild(tooltipTime);

export function addHoverTooltip(element, title, description, effectEndTime) {
  let intervalID;
  element.addEventListener('mouseenter', () => {
    tooltip.classList.remove('hide');
    tooltipTitle.innerHTML = title;
    tooltipDescription.innerHTML = description;


    if (effectEndTime != null) {
      intervalID = setInterval(() => {
        const timeLeft = effectEndTime - Date.now();
        tooltipTime.innerHTML = `⏳ ${formatTime(timeLeft)
          }`;
        if (timeLeft <= 0) {
          tooltip.classList.add('hide');
          clearInterval(intervalID);
        }
      }, 50)
    } else {
      tooltipTime.innerHTML = ``;
    }
  });

  element.addEventListener('mousemove', (event) => {
    tooltip.style.left = `${event.clientX + 15}px`;
    tooltip.style.top = `${(event.clientY - tooltip.clientHeight) - 10}px`;
  });

  element.addEventListener('mouseleave', () => {
    tooltip.classList.add('hide');
    tooltipTitle.innerHTML = '';
    tooltipDescription.innerHTML = '';
    clearInterval(intervalID);
  })
}

export const settings = [];

export function createSetting(name, title, type, defaultValue, minValue, maxValue, description) {
  const setting = {
    name: name,
    title: title,
    type: type,
    defaultValue: defaultValue,
    minValue: minValue,
    maxValue: maxValue,
    description: description
  }

  settings.push(setting);
  return setting;
}

export function updateSetting(settingName, value) {
  player.settings[settingName] = value;
  if (settingEffects[settingName]) {
    settingEffects[settingName](value);
  }
};

export function appendSetting(setting) {
  const settingsGui = document.querySelector('.settings-main-gui');
  const createdSetting = document.createElement('div');
  createdSetting.classList.add('setting-div', 'dark-mode-affected');
  createdSetting.id = setting.name;
  settingsGui.appendChild(createdSetting);
  setting.element = createdSetting;

  const settingTitle = document.createElement('h1');
  settingTitle.textContent = setting.title;
  createdSetting.appendChild(settingTitle);

  const settingDescription = document.createElement('p');
  settingDescription.innerHTML = setting.description;
  createdSetting.appendChild(settingDescription);

  const settingButton = document.createElement('input');
  createdSetting.appendChild(settingButton);

  if (setting.type === "number") {
    settingButton.type = "range";
    settingButton.classList.add('settings-slider');
    settingButton.min = setting.minValue;
    settingButton.max = setting.maxValue;
    settingButton.step = 1;
    settingButton.value = setting.defaultValue;

    const valueDisplay = document.createElement('label');
    valueDisplay.textContent = setting.defaultValue;

    const wrapper = document.createElement('div');
    wrapper.appendChild(settingButton);
    wrapper.appendChild(valueDisplay);
    createdSetting.appendChild(wrapper);

    updateSetting(setting.defaultValue);

    setting.numberDisplayElement = valueDisplay;

    settingButton.addEventListener('input', () => {
      valueDisplay.textContent = settingButton.value;
      updateSetting(setting.name, settingButton.value);
    });

  } else if (setting.type === "checkbox") {
    settingButton.type = "checkbox";
    settingButton.classList.add('settings-checkbox');
    settingButton.checked = setting.defaultValue === "true" || setting.defaultValue === true;
    createdSetting.appendChild(settingButton);

    updateSetting(setting.name, settingButton.checked);

    settingButton.addEventListener('change', () => {
      updateSetting(setting.name, settingButton.checked)
    });

  } else if (setting.type === "input") {
    settingButton.type = "text";
    settingButton.classList.add('settings-inputfield');
    settingButton.value = setting.defaultValue;
    createdSetting.appendChild(settingButton);

    settingButton.addEventListener('input', () => {
      updateSetting(setting.name, settingButton.value);
    });

  } else if (setting.type === "button") {
    settingButton.classList.add('hide');
    var button = document.createElement('button');
    button.classList.add('settings-button-setting');
    button.innerHTML = setting.defaultValue; // importante
    createdSetting.appendChild(button);

    button.addEventListener('click', () => {
      updateSetting(setting.name, 1);
    })

  } else {
    throw new Error(`${setting.name} has invalid type (${setting.type})`);
  }

  setting.buttonElement = (setting.type === "button") ? button : settingButton; // odeio ternário mano
}

export function openDataDeletionScreen() {
  const screen = document.getElementById('confirm-data-delete-wrapper');

  if (screen.classList.contains('hide')) {
    screen.classList.remove('hide');
  }

  const yesButton = document.getElementById('delete-yes');
  const noButton = document.getElementById('delete-no');

  yesButton.addEventListener('click', () => {
    resetPlayerData();
  }, { once: true })

  noButton.addEventListener('click', () => {
    screen.classList.add('hide');
  }, { once: true });
}


// preguiça, mas adiciona os score observers após scoreObservers[] ser inicializado

setTimeout(() => {
  addScoreObserver(revealItemsWithMinScore);
  addScoreObserver(updateBuyButtonColor);
  addScoreObserver(unlockGuiButtons);
}, 5);