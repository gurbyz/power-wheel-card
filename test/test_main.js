import {elementUpdated} from "@open-wc/testing";

const setCardView = async (card, view) => {
  card.setAttribute('view', view);
};

const setCardAllInactive = async (card, hass, config) => {
  hass.states['sensor.solar_power'].state = "0";
  if (hass.states['sensor.grid_power']) {
    hass.states['sensor.grid_power'].state = "0";
  }
  if (hass.states['sensor.grid_power_consumption']) {
    hass.states['sensor.grid_power_consumption'].state = "0";
  }
  if (hass.states['sensor.grid_power_production']) {
    hass.states['sensor.grid_power_production'].state = "0";
  }
  if (hass.states['sensor.battery_power']) {
    hass.states['sensor.battery_power'].state = "0";
  }
  card.setAttribute('hass', JSON.stringify(hass));
  await elementUpdated(card);
  await card.setConfig(config);
};

export {setCardView, setCardAllInactive};
