import '../bower_components/webcomponentsjs/webcomponents-loader';
import {assert, fixture, html, elementUpdated} from '@open-wc/testing';
import './hui-view-mock.js';
import '../power-wheel-card.js';

describe('<power-wheel-card> with configured decimals', () => {
  let card, hass, config;

  beforeEach(async () => {
    config = {
      type: "custom:power-wheel-card",
      solar_power_entity: "sensor.solar_power",
      grid_power_consumption_entity: "sensor.grid_power_consumption",
      grid_power_production_entity: "sensor.grid_power_production",
      solar_energy_entity: "sensor.solar_energy",
      grid_energy_consumption_entity: "sensor.grid_energy_consumption",
      grid_energy_production_entity: "sensor.grid_energy_production",
      power_decimals: 2,
      energy_decimals: 1,
      money_decimals: 3,
      energy_consumption_rate: 1.00,
      color_icons: false,
    };
    hass = {
      states: {
        "sensor.solar_power": {
          attributes: {
            unit_of_measurement: "W",
          },
          entity_id: "sensor.solar_power",
          state: "500",
        },
        "sensor.grid_power_consumption": {
          attributes: {
            unit_of_measurement: "W",
          },
          entity_id: "sensor.grid_power_consumption",
          state: "1800",
        },
        "sensor.grid_power_production": {
          attributes: {
            unit_of_measurement: "W",
          },
          entity_id: "sensor.grid_power_production",
          state: "0",
        },
        "sensor.solar_energy": {
          attributes: {
            unit_of_measurement: "kWh",
          },
          entity_id: "sensor.solar_energy",
          state: "5",
        },
        "sensor.grid_energy_consumption": {
          attributes: {
            unit_of_measurement: "kWh",
          },
          entity_id: "sensor.grid_energy_consumption",
          state: "18",
        },
        "sensor.grid_energy_production": {
          attributes: {
            unit_of_measurement: "kWh",
          },
          entity_id: "sensor.grid_energy_production",
          state: "0",
        },
      },
    };
    card = await fixture(
      html`
        <power-wheel-card .hass=${hass} .config=${{}}></power-wheel-card>
      `
    );
    await card.setConfig(config);
  });

  const setCardView = async (view) => {
    card.setAttribute('view', view);
  };

  it('has set config values', () => {
    assert.equal(card.config.power_decimals, 2, 'Card parameter power_decimals should have value set');
    assert.equal(card.config.energy_decimals, 1, 'Card parameter energy_decimals should have value set');
    assert.equal(card.config.money_decimals, 3, 'Card parameter money_decimals should have value set');
  });

  it('displays values in power view', () => {
    assert.equal(card.shadowRoot.querySelector('#value-solar').innerText, '500.00', 'Solar should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid').innerText, '-1800.00', 'Grid should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-home').innerText, '-2300.00', 'Home should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2grid').innerText, '', 'Solar2Grid arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2home').innerText, '', 'Solar2Home arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2home').innerText, '', 'Grid2Home arrow shouldn\'t have a value');
  });

  it('displays values in energy view', async () => {
    await setCardView('energy');

    assert.equal(card.shadowRoot.querySelector('#value-solar').innerText, '5.0', 'Solar should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid').innerText, '-18.0', 'Grid should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-home').innerText, '-23.0', 'Home should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2grid').innerText, '', 'Solar2Grid arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2home').innerText, '', 'Solar2Home arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2home').innerText, '', 'Grid2Home arrow shouldn\'t have a value');
  });

  it('displays values in money view', async () => {
    await setCardView('money');

    assert.equal(card.shadowRoot.querySelector('#value-solar').innerText, '5.000', 'Solar should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid').innerText, '-18.000', 'Grid should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-home').innerText, '-23.000', 'Home should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2grid').innerText, '', 'Solar2Grid arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2home').innerText, '', 'Solar2Home arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2home').innerText, '', 'Grid2Home arrow shouldn\'t have a value');
  });

});
