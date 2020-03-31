import {elementUpdated, fixture, html} from "@open-wc/testing";

const setCard = async (hass, config) => {
  const card = await fixture(
    html`
        <power-wheel-card .hass=${hass} .config=${{}}></power-wheel-card>
      `
  );
  await card.setConfig(config);
  // Call firstUpdated() again because fixture already triggered it the first time.
  await card.firstUpdated();
  // TODO: Why is this needed for one test case only: 'has debug warning'?
  await card.setConfig(config);

  return card;
};

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

export {setCard, setCardView, setCardAllInactive};
