import '../bower_components/webcomponentsjs/webcomponents-loader';
import {assert, elementUpdated} from '@open-wc/testing';
import './hui-view-mock.js';
import '../power-wheel-card.js';
import {setCard, setCardAllInactive} from './test_main.js';

describe('<power-wheel-card> with inverted grid colors', () => {
  let card, hass, config;

  beforeEach(async () => {
    config = {
      type: "custom:power-wheel-card",
      solar_power_entity: "sensor.solar_power",
      grid_power_consumption_entity: "sensor.grid_power_consumption",
      grid_power_production_entity: "sensor.grid_power_production",
      color_icons: true,
      invert_grid_colors: true,
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

  const setCardProducingToGrid = async () => {
    hass.states['sensor.grid_power_consumption'].state = "0";
    hass.states['sensor.grid_power_production'].state = "50";
    card.setAttribute('hass', JSON.stringify(hass));
    await elementUpdated(card);
    await card.setConfig(config);
  };

  const setCardSolarConsuming = async () => {
    hass.states['sensor.solar_power'].state = "-5";
    hass.states['sensor.grid_power_consumption'].state = "5";
    hass.states['sensor.grid_power_production'].state = "0";
    card.setAttribute('hass', JSON.stringify(hass));
    await elementUpdated(card);
    await card.setConfig(config);
  };

  it('has config values', () => {
    assert.isTrue(card.config.invert_grid_colors, 'Card parameter invert_grid_colors should be set');
  });

  it('has ui elements', () => {
    assert.equal(card.shadowRoot.querySelectorAll('#toggle-button').length, 0, 'Toggle button shouldn\'t be there');
    assert.isFalse(card.shadowRoot.querySelector('#unit').classList.contains('toggle'), 'Unit shouldn\'t be toggleable');
    assert.equal(card.shadowRoot.querySelector('#icon-solar').getAttribute('icon'), 'mdi:weather-sunny', 'Solar icon should be default icon');
    assert.equal(card.shadowRoot.querySelector('#icon-grid').getAttribute('icon'), 'mdi:transmission-tower', 'Grid icon should be default icon');
    assert.equal(card.shadowRoot.querySelector('#icon-home').getAttribute('icon'), 'mdi:home', 'Home icon should be default icon');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2grid').getAttribute('icon'), 'mdi:arrow-bottom-left', 'Solar2Grid icon should be normal icon');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2home').getAttribute('icon'), 'mdi:arrow-bottom-right', 'Solar2Home icon should be normal icon');
    assert.equal(card.shadowRoot.querySelector('#icon-grid2home').getAttribute('icon'), 'mdi:arrow-right', 'Grid2Home icon should be normal icon');
    assert.equal(card.shadowRoot.querySelector('#cell-solar').getAttribute('title'), 'More info:\nSolar Power', 'Solar title should be set');
    assert.equal(card.shadowRoot.querySelector('#cell-grid').getAttribute('title'), '', 'Grid title should be set');
    assert.equal(card.shadowRoot.querySelector('#cell-home').getAttribute('title'), '', 'Home title should be set');
    assert.isTrue(card.shadowRoot.querySelector('#cell-battery').classList.contains('hidden'), 'Battery cell should be disabled');
    assert.equal(card.shadowRoot.querySelector('#cell-solar2grid').getAttribute('title'), 'More info', 'Solar2Grid title should be set');
    assert.equal(card.shadowRoot.querySelector('#cell-solar2home').getAttribute('title'), '', 'Solar2Home title should be set');
    assert.equal(card.shadowRoot.querySelector('#cell-grid2home').getAttribute('title'), 'More info', 'Grid2Home title should be set');
    assert.isTrue(card.shadowRoot.querySelector('#cell-solar2battery').classList.contains('hidden'), 'Solar2Battery arrow should be disabled');
    assert.isTrue(card.shadowRoot.querySelector('#cell-grid2battery').classList.contains('hidden'), 'Grid2Battery arrow should be disabled');
    assert.isTrue(card.shadowRoot.querySelector('#cell-battery2home').classList.contains('hidden'), 'Battery2Home arrow should be disabled');
  });

  it('displays values when consuming from the grid', () => {
    assert.equal(card.shadowRoot.querySelector('#value-solar').innerText, '500', 'Solar should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid').innerText, '1800', 'Grid should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-home').innerText, '2300', 'Home should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2grid').innerText, '', 'Solar2Grid arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2home').innerText, '', 'Solar2Home arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2home').innerText, '', 'Grid2Home arrow shouldn\'t have a value');
  });

  it('has ui elements when consuming from the grid', () => {
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar').classList.contains('producing'), 'Solar icon should be producing');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid').classList.contains('producing'), 'Grid icon should be producing'); // !
    assert.isTrue(card.shadowRoot.querySelector('#icon-home').classList.contains('consuming'), 'Home icon should be consuming');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2grid').getAttribute('icon'), 'mdi:arrow-bottom-left', 'Solar2Grid icon should be normal icon');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2home').getAttribute('icon'), 'mdi:arrow-bottom-right', 'Solar2Home icon should be normal icon');
    assert.equal(card.shadowRoot.querySelector('#icon-grid2home').getAttribute('icon'), 'mdi:arrow-right', 'Grid2Home icon should be normal icon');
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar2grid').classList.contains('inactive'), 'Solar2Grid arrow icon should be inactive');
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar2home').classList.contains('active'), 'Solar2Home arrow icon should be active');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid2home').classList.contains('active'), 'Grid2Home arrow icon should be active');
  });

  it('displays values when producing to the grid', async () => {
    await setCardProducingToGrid();

    assert.equal(card.shadowRoot.querySelector('#value-solar').innerText, '500', 'Solar should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid').innerText, '50', 'Grid should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-home').innerText, '450', 'Home should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2grid').innerText, '', 'Solar2Grid arrow should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2home').innerText, '', 'Solar2Home arrow should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2home').innerText, '', 'Grid2Home arrow shouldn\'t have a value');
  });

  it('has ui elements when producing to the grid', async () => {
    await setCardProducingToGrid();

    assert.isTrue(card.shadowRoot.querySelector('#icon-solar').classList.contains('producing'), 'Solar icon should be producing');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid').classList.contains('consuming'), 'Grid icon should be consuming'); // !
    assert.isTrue(card.shadowRoot.querySelector('#icon-home').classList.contains('consuming'), 'Home icon should be consuming');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2grid').getAttribute('icon'), 'mdi:arrow-bottom-left', 'Solar2Grid icon should be normal icon');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2home').getAttribute('icon'), 'mdi:arrow-bottom-right', 'Solar2Home icon should be normal icon');
    assert.equal(card.shadowRoot.querySelector('#icon-grid2home').getAttribute('icon'), 'mdi:arrow-right', 'Grid2Home icon should be normal icon');
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar2grid').classList.contains('active'), 'Solar2Grid arrow icon should be active');
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar2home').classList.contains('active'), 'Solar2Home arrow icon should be active');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid2home').classList.contains('inactive'), 'Grid2Home arrow icon should be inactive');
  });

  it('displays values when all sensor values are zero', async () => {
    await setCardAllInactive(card, hass, config);

    assert.equal(card.shadowRoot.querySelector('#value-solar').innerText, '0', 'Solar should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid').innerText, '0', 'Grid should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-home').innerText, '0', 'Home should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2grid').innerText, '', 'Solar2Grid arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2home').innerText, '', 'Solar2Home arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2home').innerText, '', 'Grid2Home arrow shouldn\'t have a value');
  });

  it('has ui elements when all sensor values are zero', async () => {
    await setCardAllInactive(card, hass, config);

    assert.isTrue(card.shadowRoot.querySelector('#icon-solar').classList.contains('inactive'), 'Solar icon should be inactive');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid').classList.contains('inactive'), 'Grid icon should be inactive');
    assert.isTrue(card.shadowRoot.querySelector('#icon-home').classList.contains('inactive'), 'Home icon should be inactive');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2grid').getAttribute('icon'), 'mdi:arrow-bottom-left', 'Solar2Grid icon should be normal icon');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2home').getAttribute('icon'), 'mdi:arrow-bottom-right', 'Solar2Home icon should be normal icon');
    assert.equal(card.shadowRoot.querySelector('#icon-grid2home').getAttribute('icon'), 'mdi:arrow-right', 'Grid2Home icon should be normal icon');
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar2grid').classList.contains('inactive'), 'Solar2Grid arrow icon should be inactive');
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar2home').classList.contains('inactive'), 'Solar2Home arrow icon should be inactive');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid2home').classList.contains('inactive'), 'Grid2Home arrow icon should be inactive');
  });

  it('displays values when solar inverter consumes power', async () => {
    await setCardSolarConsuming();

    assert.equal(card.shadowRoot.querySelector('#value-solar').innerText, '5', 'Solar should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid').innerText, '5', 'Grid should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-home').innerText, '0', 'Home should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2grid').innerText, '', 'Solar2Grid arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2home').innerText, '', 'Solar2Home arrow should have a value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2home').innerText, '', 'Grid2Home arrow shouldn\'t have a value');
  });

  it('has ui elements when solar inverter consumes power', async () => {
    await setCardSolarConsuming();

    assert.isTrue(card.shadowRoot.querySelector('#icon-solar').classList.contains('consuming'), 'Solar icon should be consuming');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid').classList.contains('producing'), 'Grid icon should be producing'); // !
    assert.isTrue(card.shadowRoot.querySelector('#icon-home').classList.contains('inactive'), 'Home icon should be inactive');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2grid').getAttribute('icon'), 'mdi:arrow-bottom-left', 'Solar2Grid icon should be normal icon');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2home').getAttribute('icon'), 'mdi:arrow-top-left', 'Solar2Home icon should be reversed icon');
    assert.equal(card.shadowRoot.querySelector('#icon-grid2home').getAttribute('icon'), 'mdi:arrow-right', 'Grid2Home icon should be normal icon');
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar2grid').classList.contains('inactive'), 'Solar2Grid arrow icon should be inactive');
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar2home').classList.contains('active'), 'Solar2Home arrow icon should be inactive');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid2home').classList.contains('active'), 'Grid2Home arrow icon should be active');
  });

});
