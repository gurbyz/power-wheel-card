import { expect } from '@open-wc/testing';
import '../bower_components/webcomponentsjs/webcomponents-loader';
import './hui-view-mock.js';
import { PowerWheelCard } from '../power-wheel-card.js';

describe('power-wheel-card first test', () => {
  let card, hass, config;

  beforeEach(() => {
    card = new PowerWheelCard();
    config = {
      type: "custom:power-wheel-card",
      solar_power_entity: "sensor.solar_power",
      grid_power_consumption_entity: "sensor.grid_power_consumption",
      grid_power_production_entity: "sensor.grid_power_production",
      color_icons: false,
    };
    hass = {
      states: {
        "sensor.solar_power" : {
          attributes: {
            unit_of_measurement: "W",
            friendly_name: "Solar Power",
          },
          entity_id: "sensor.solar_power",
          state: "500.1",
        },
        "sensor.grid_power_consumption" : {
          attributes: {
            unit_of_measurement: "W",
          },
          entity_id: "sensor.grid_power_consumption",
          state: "1799.9",
        },
        "sensor.grid_power_production" : {
          attributes: {
            unit_of_measurement: "W",
          },
          entity_id: "sensor.grid_power_production",
          state: "0",
        },
      },
    };
    card.setAttribute('hass', JSON.stringify(hass));
    card.setConfig(config);
  });

  it('should work', () => {
    expect(true).to.equal(true);
  });

  it('has set default config values', () => {
    expect(card.config.title).to.equal('Power wheel', 'Card parameter title should have default value');
  });

});
