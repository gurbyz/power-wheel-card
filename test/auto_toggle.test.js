import '../bower_components/webcomponentsjs/webcomponents-loader';
import {assert, elementUpdated} from '@open-wc/testing';
import {useFakeTimers} from 'sinon';
import './hui-view-mock.js';
import '../power-wheel-card.js';
import {setCard} from './test_main.js';

describe('<power-wheel-card> with automatic toggling between views', () => {
  let card, hass, config, clock;

  beforeEach(async () => {
    clock = useFakeTimers();
    config = {
      type: "custom:power-wheel-card",
      solar_power_entity: "sensor.solar_power",
      grid_power_consumption_entity: "sensor.grid_power_consumption",
      grid_power_production_entity: "sensor.grid_power_production",
      solar_energy_entity: "sensor.solar_energy",
      grid_energy_consumption_entity: "sensor.grid_energy_consumption",
      grid_energy_production_entity: "sensor.grid_energy_production",
      energy_consumption_rate: 1.00,
      initial_auto_toggle_view: true,
      auto_toggle_view_period: 1,
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

    card = await setCard(hass, config);
});

  afterEach(() => {
    clock.restore();
  });

  it('has set config values', () => {
    assert.isTrue(card.config.initial_auto_toggle_view, 'Card parameter initial_auto_toggle_view should be set');
    assert.equal(card.config.auto_toggle_view_period, 1, 'Card parameter auto_toggle_view_period should be set');
  });

  it('can automatically toggle from power view to energy view', async () => {
    assert.equal(card.shadowRoot.querySelector('#unit').innerText, 'W', 'Card should be in power view');
    await clock.tick(1050);

    assert.equal(card.shadowRoot.querySelector('#unit').innerText, 'kWh', 'Card should be in energy view');
  });

  it('can switch off auto toggling with toggle button', async () => {
    assert.equal(card.shadowRoot.querySelector('#unit').innerText, 'W', 'Card should be in power view');
    card.shadowRoot.querySelector('#toggle-button').click();
    await elementUpdated(card);
    await clock.tick(1050);

    assert.equal(card.shadowRoot.querySelector('#unit').innerText, 'W', 'Card should be still in power view');
  });

  it('can switch off auto toggling with click on unit', async () => {
    assert.equal(card.shadowRoot.querySelector('#unit').innerText, 'W', 'Card should be in power view');
    card.shadowRoot.querySelector('#unit').click();
    await elementUpdated(card);

    assert.equal(card.shadowRoot.querySelector('#unit').innerText, 'kWh', 'Card should go to energy view first');
    await clock.tick(1050);

    assert.equal(card.shadowRoot.querySelector('#unit').innerText, 'kWh', 'Card should be still in energy view');
  });

});
