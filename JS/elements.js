import { abbreviateNumber, addScoreObserver, buyItem, formatTime } from './currency.js';
import { effects, scoreObservers } from './data.js';
import { player } from "./player.js";

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

  item.element = createdItem;
  item.buttonElement = itemBuyButton;
  item.bought = false;

  itemBuyButton.addEventListener('click', () => {
    if (!item.bought){
      buyItem(item, player);
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

function updateBuyButtonColor(player) {
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

    intervalID = setInterval(() => {
      const timeLeft = effectEndTime - Date.now();
      tooltipTime.innerHTML = `⏳ ${formatTime(timeLeft)
    }`;
    if (timeLeft <= 0) {
      tooltip.classList.add('hide');
      clearInterval(intervalID);
    }
  }, 50)
  });

  element.addEventListener('mousemove', (event) => {
    tooltip.style.left = `${event.clientX + 15}px`;
    tooltip.style.top = `${(event.clientY - tooltip.clientHeight) -10}px`;
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

export function appendSetting(setting) {
  const settingsGui = document.querySelector('.settings-main-gui');

  const createdSetting = document.createElement('div');
  settingsGui.appendChild(createdSetting);
  createdSetting.classList.add('setting-div');
  setting.element = createdSetting;

  const settingTitle = document.createElement('h1');
  createdSetting.appendChild(settingTitle);
  settingTitle.innerHTML = setting.title;

  const settingDescription = document.createElement('p');
  createdSetting.appendChild(settingDescription);
  settingDescription.innerHTML = setting.description;

  if (setting.type == "number") {
    const slider = document.createElement('input');
    slider.classList.add('settings-slider');

    const valueDisplay = document.createElement('label');

    const wrapper = document.createElement('div');
    wrapper.appendChild(slider);
    wrapper.appendChild(valueDisplay);
    setting.element.appendChild(wrapper)


    slider.type = "range";
    slider.min = setting.minValue;
    slider.max = setting.maxValue;
    slider.value = setting.defaultValue;
    slider.step = 1;
    player.settings[setting.name] = setting.defaultValue;
    valueDisplay.textContent = setting.defaultValue;

    slider.addEventListener('input', () => {
      player.settings[setting.name] = slider.value;
      valueDisplay.textContent = `${slider.value}`;
    })
  } 
  else if (setting.type == "checkbox") {
    const checkbox = document.createElement('input');
    checkbox.classList.add('settings-checkbox');
    createdSetting.appendChild(checkbox)
    checkbox.type = "checkbox";
    checkbox.checked = setting.defaultValue;
    player.settings[setting.name] = setting.defaultValue;

    checkbox.addEventListener('change', () => {
      player.settings[setting.name] = checkbox.checked;
      console.log(player.settings[setting.name]);
    })
  } else if (setting.type == "input") {
    const inputField = document.createElement('input');
    createdSetting.appendChild(inputField);
    inputField.classList.add('settings-inputfield');
    inputField.type = "text";

    player.settings[setting.name] = setting.defaultValue;
    inputField.value = setting.defaultValue;

    inputField.addEventListener('input', () => {
      player.settings[setting.name] = inputField.value;
      console.log(player.settings[setting.name]);
    })
  } 
  else {
    throw new Error(`${setting.name} tem um type inválido (${setting.type})`);
  }
}
// settings (não fiz um JSON pra isso porque... não? bom, depois eu resolvo isso)

appendSetting(
  createSetting("clickSfx", "Brabas SFX", 'checkbox', true, '', '', "Cliques no botão fazem barulho.")
);
appendSetting(
  createSetting("buttonScale", "Tamanho do Botão", 'number', 10, 1, 20, "Tamanho que o botão central deve ter.",)
);
appendSetting(
  createSetting("buttonText", "Texto do Botão", 'input', "braba", '', '', "O texto que deve ficar no centro do botão central")
);

// preguiça, mas adiciona os score observers após scoreObservers[] ser inicializado.

setTimeout(() => {
  addScoreObserver(revealItemsWithMinScore);
  addScoreObserver(updateBuyButtonColor);
  addScoreObserver(unlockGuiButtons);
}, 1);