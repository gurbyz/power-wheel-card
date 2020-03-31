import '../bower_components/webcomponentsjs/webcomponents-loader';
import {assert} from '@open-wc/testing';
import './hui-view-mock.js';
import '../power-wheel-card.js';
import {setCard} from './test_main.js';

describe('<power-wheel-card> with configured icon colors', () => {
  let card, hass, config;

  /** Tests are based on color_icons. **/

  beforeEach(async () => {
    config = {
      type: "custom:power-wheel-card",
      solar_power_entity: "sensor.solar_power",
      grid_power_consumption_entity: "sensor.grid_power_consumption",
      grid_power_production_entity: "sensor.grid_power_production",
      consuming_color: "red",
      producing_color: "green",
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
      },
    };

    card = await setCard(hass, config);
});

  it('has config values', () => {
    assert.isTrue(card.config.color_icons, 'Card parameter color_icons should be set');
    assert.equal(card.config.consuming_color, 'red', 'Card parameter consuming_color should be set');
    assert.equal(card.config.producing_color, 'green', 'Card parameter producing_color should be set');
  });

  it('uses configured color values', () => {
    assert.equal(window.getComputedStyle(card.shadowRoot.querySelector('ha-icon.consuming'), null).getPropertyValue('color'), 'rgb(255, 0, 0)', 'Consuming icon color should be red');
    assert.equal(window.getComputedStyle(card.shadowRoot.querySelector('ha-icon.producing'), null).getPropertyValue('color'), 'rgb(0, 128, 0)', 'Producing icon color should be green');
  });

});
