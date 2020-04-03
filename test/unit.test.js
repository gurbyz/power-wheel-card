import '../bower_components/webcomponentsjs/webcomponents-loader';
import {assert, expect} from '@open-wc/testing';
import {stub} from 'sinon';
import './hui-view-mock.js';
import '../power-wheel-card.js';
import {setCard} from './test_main.js';

describe('<power-wheel-card> unit tests', () => {
  let card, hass, config;

  /** Tests are extended in energy_capable. **/

  beforeEach(async () => {
    config = {
      type: "custom:power-wheel-card",
      solar_power_entity: "sensor.solar_power",
      grid_power_consumption_entity: "sensor.grid_power_consumption",
      grid_power_production_entity: "sensor.grid_power_production",
      color_icons: false,
    };
    hass = {
      states: {
        "sensor.solar_power": {
          attributes: {
            unit_of_measurement: "W",
            friendly_name: "Solar Power",
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
      },
    };

    card = await setCard(hass, config);
  });

  describe('_addMessage', () => {
    let warnStub;

    beforeEach(() => {
      warnStub = stub(console, 'warn');
    });

    afterEach(() => {
      warnStub.restore();
    });

    it('should push to messages and console', () => {
      card._addMessage('warn', 'some text');

      assert.equal(card.messages.length, 1, 'There should be one message.');
      assert.equal(card.messages[0].type, 'warn', 'Type should be correct.');
      assert.equal(card.messages[0].text, 'some text', 'Text should be correct.');
      expect(warnStub.calledOnce).to.equal(true);
    });

    it('should push to messages but not console', () => {
      card._addMessage('warn', 'some text', false);

      assert.equal(card.messages.length, 1, 'There should be one message.');
      assert.equal(card.messages[0].type, 'warn', 'Type should be correct.');
      assert.equal(card.messages[0].text, 'some text', 'Text should be correct.');
      expect(warnStub.called).to.equal(false);
    });
  });
});
