import '../bower_components/webcomponentsjs/webcomponents-loader';
import {assert, fixture, html, elementUpdated} from '@open-wc/testing';
import './hui-view-mock.js';
import '../power-wheel-card.js';
import {setCardView} from './test_main.js';

describe('<power-wheel-card> with a title per view', () => {
  let card, hass, config;

  beforeEach(async () => {
    config = {
      type: "custom:power-wheel-card",
      title: "Not used",
      title_power: "Power view",
      title_energy: "Energy view",
      title_money: "Money view",
      solar_power_entity: "sensor.solar_power",
      grid_power_consumption_entity: "sensor.grid_power_consumption",
      grid_power_production_entity: "sensor.grid_power_production",
      solar_energy_entity: "sensor.solar_energy",
      grid_energy_consumption_entity: "sensor.grid_energy_consumption",
      grid_energy_production_entity: "sensor.grid_energy_production",
      energy_consumption_rate: 0.20,
    };
    hass = {
      states: {
        "sensor.solar_power": {
          attributes: {
            unit_of_measurement: "W",
          },
          entity_id: "sensor.solar_power",
          state: "500.1",
        },
        "sensor.grid_power_consumption": {
          attributes: {
            unit_of_measurement: "W",
          },
          entity_id: "sensor.grid_power_consumption",
          state: "1799.9",
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

it('has config values', () => {
    assert.equal(card.config.title_power, 'Power view', 'Card parameter title_power should be set');
    assert.equal(card.config.title_energy, 'Energy view', 'Card parameter title_energy should be set');
    assert.equal(card.config.title_money, 'Money view', 'Card parameter title_money should be set');
  });

  it('has set card property values after setConfig', () => {
    assert.equal(card.views.power.title, 'Power view', 'Card property views should have value set for power view title');
    assert.equal(card.views.energy.title, 'Energy view', 'Card property views should have value set for energy view title');
    assert.equal(card.views.money.title, 'Money view', 'Card property views should have value set for money view title');
  });

  it('has no warnings or errors', () => {
    assert.equal(card.shadowRoot.querySelectorAll('.message').length, 0, 'Number of messages should be zero');
  });

  it('displays values in power view', () => {
    assert.equal(card.shadowRoot.querySelector('#title').innerText, "Power view");
  });

  it('displays values in energy view', async () => {
    await setCardView(card, 'energy');

    assert.equal(card.shadowRoot.querySelector('#title').innerText, "Energy view");
  });

  it('displays values in money view', async () => {
    await setCardView(card, 'money');

    assert.equal(card.shadowRoot.querySelector('#title').innerText, "Money view");
  });

});
