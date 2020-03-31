import '../bower_components/webcomponentsjs/webcomponents-loader';
import {assert} from '@open-wc/testing';
import './hui-view-mock.js';
import '../power-wheel-card.js';
import {setCard, setCardView} from './test_main.js';

describe('<power-wheel-card> with configured icons', () => {
  let card, hass, config;

  /** Tests are based on icons_by_customize. **/

  beforeEach(async () => {
    config = {
      type: "custom:power-wheel-card",
      solar_power_entity: "sensor.solar_power",
      grid_power_consumption_entity: "sensor.grid_power_consumption",
      grid_power_production_entity: "sensor.grid_power_production",
      grid_power_entity: "sensor.grid_power",
      home_power_entity: "sensor.home_power",
      solar_energy_entity: "sensor.solar_energy",
      grid_energy_consumption_entity: "sensor.grid_energy_consumption",
      grid_energy_production_entity: "sensor.grid_energy_production",
      grid_energy_entity: "sensor.grid_energy",
      home_energy_entity: "sensor.home_energy",
      solar_icon: "mdi:solar-power",
      grid_icon: "mdi:flash",
      home_icon: "mdi:home-circle",
    };
    hass = {
      states: {
        "sensor.solar_power": {
          attributes: {
            unit_of_measurement: "W",
            icon: "mdi:white-balance-sunny",
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
        "sensor.grid_power": {
          attributes: {
            unit_of_measurement: "W",
            icon: "mdi:flash-circle",
          },
          entity_id: "sensor.grid_power",
          state: "999",
        },
        "sensor.home_power": {
          attributes: {
            unit_of_measurement: "W",
            icon: "mdi:home-assistant",
          },
          entity_id: "sensor.grid_power",
          state: "999",
        },
        "sensor.solar_energy": {
          attributes: {
            unit_of_measurement: "kWh",
            icon: "mdi:white-balance-sunny",
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
        "sensor.grid_energy": {
          attributes: {
            unit_of_measurement: "W",
            icon: "mdi:flash-circle",
          },
          entity_id: "sensor.grid_energy",
          state: "999",
        },
        "sensor.home_energy": {
          attributes: {
            unit_of_measurement: "W",
            icon: "mdi:home-assistant",
          },
          entity_id: "sensor.grid_energy",
          state: "999",
        },
      },
    };

    card = await setCard(hass, config);
});

it('prefers configured icons above customized icons in power view', () => {
    assert.equal(card.shadowRoot.querySelector('#icon-solar').getAttribute('icon'), 'mdi:solar-power', 'Solar icon should be configured icon');
    assert.equal(card.shadowRoot.querySelector('#icon-grid').getAttribute('icon'), 'mdi:flash', 'Grid icon should be configured icon');
    assert.equal(card.shadowRoot.querySelector('#icon-home').getAttribute('icon'), 'mdi:home-circle', 'Home icon should be configured icon');
  });

  it('prefers configured icons above customized icons in energy view', async () => {
    await setCardView(card, 'energy');

    assert.equal(card.shadowRoot.querySelector('#icon-solar').getAttribute('icon'), 'mdi:solar-power', 'Solar icon should be configured icon');
    assert.equal(card.shadowRoot.querySelector('#icon-grid').getAttribute('icon'), 'mdi:flash', 'Grid icon should be configured icon');
    assert.equal(card.shadowRoot.querySelector('#icon-home').getAttribute('icon'), 'mdi:home-circle', 'Home icon should be configured icon');
  });

});
