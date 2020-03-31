import '../bower_components/webcomponentsjs/webcomponents-loader';
import {assert} from '@open-wc/testing';
import './hui-view-mock.js';
import '../power-wheel-card.js';
import {setCard, setCardView} from './test_main.js';

describe('<power-wheel-card> with icons from customized sensors', () => {
  let card, hass, config;

  /** Tests are extended in icons_by_config. **/

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
      color_icons: false,
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

it('has customized icons in power view', () => {
    assert.equal(card.shadowRoot.querySelector('#icon-solar').getAttribute('icon'), 'mdi:white-balance-sunny', 'Solar icon should be customized icon');
    assert.equal(card.shadowRoot.querySelector('#icon-grid').getAttribute('icon'), 'mdi:flash-circle', 'Grid icon should be customized icon');
    assert.equal(card.shadowRoot.querySelector('#icon-home').getAttribute('icon'), 'mdi:home-assistant', 'Home icon should be customized icon');
  });

  it('in power view doesn\'t let the extra sensors interfere values when consuming from the grid', () => {
    assert.equal(card.shadowRoot.querySelector('#value-solar').innerText, '500', 'Solar should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid').innerText, '-1800', 'Grid should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-home').innerText, '-2300', 'Home should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2grid').innerText, '', 'Solar2Grid arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2home').innerText, '', 'Solar2Home arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2home').innerText, '', 'Grid2Home arrow shouldn\'t have a value');
  });

  it('has customized icons in energy view', async () => {
    await setCardView(card, 'energy');

    assert.equal(card.shadowRoot.querySelector('#icon-solar').getAttribute('icon'), 'mdi:white-balance-sunny', 'Solar icon should be customized icon');
    assert.equal(card.shadowRoot.querySelector('#icon-grid').getAttribute('icon'), 'mdi:flash-circle', 'Grid icon should be customized icon');
    assert.equal(card.shadowRoot.querySelector('#icon-home').getAttribute('icon'), 'mdi:home-assistant', 'Home icon should be customized icon');
  });

  it('in energy view doesn\'t let the extra sensors interfere values when consuming from the grid', async () => {
    await setCardView(card, 'energy');

    assert.equal(card.shadowRoot.querySelector('#value-solar').innerText, '5.000', 'Solar should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid').innerText, '-18.000', 'Grid should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-home').innerText, '-23.000', 'Home should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2grid').innerText, '', 'Solar2Grid arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2home').innerText, '', 'Solar2Home arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2home').innerText, '', 'Grid2Home arrow shouldn\'t have a value');
  });

});
