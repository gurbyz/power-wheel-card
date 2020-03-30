import '../bower_components/webcomponentsjs/webcomponents-loader';
import {assert, fixture, html, elementUpdated} from '@open-wc/testing';
import './hui-view-mock.js';
import '../power-wheel-card.js';
import {setCardAllInactive} from './test_main.js';

describe('<power-wheel-card> with most basic config for one grid sensor', () => {
  let card, hass, config;

  /** Tests are also used in basic_one_grid_sensor_switched_polarity.html **/

  beforeEach(async () => {
    config = {
      type: "custom:power-wheel-card",
      solar_power_entity: "sensor.solar_power",
      grid_power_entity: "sensor.grid_power",
      production_is_positive: true,
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
        "sensor.grid_power": {
          attributes: {
            unit_of_measurement: "W",
          },
          entity_id: "sensor.grid_power",
          state: "-1799.9",
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

  const setCardProducingToGrid = async () => {
    hass.states['sensor.grid_power'].state = "50";
    card.setAttribute('hass', JSON.stringify(hass));
    await elementUpdated(card);
    await card.setConfig(config);
  };

  const setCardSolarConsuming = async () => {
    hass.states['sensor.solar_power'].state = "-5";
    hass.states['sensor.grid_power'].state = "-5";
    card.setAttribute('hass', JSON.stringify(hass));
    await elementUpdated(card);
    await card.setConfig(config);
  };

  it('has set config values', () => {
    assert.equal(card.config.production_is_positive, 1, 'Card parameter production_is_positive should be default 1');
  });

  it('has set card property values after setConfig', () => {
    assert.isTrue(card.views.power.oneGridSensor, 'Card property views should have value set for power oneGridSensor');
    assert.isFalse(card.views.power.twoGridSensors, 'Card property views should have value set for power twoGridSensors');
  });

  it('has no warnings or errors', () => {
    assert.equal(card.shadowRoot.querySelectorAll('.message').length, 0, 'Number of messages should be zero');
  });

  it('displays values', () => {
    assert.equal(card.shadowRoot.querySelector('#title').innerText, "Power wheel");
    assert.equal(card.shadowRoot.querySelector('#unit').innerText, "W");
  });

  it('has ui elements', () => {
    assert.equal(card.shadowRoot.querySelector('#icon-solar2grid').getAttribute('icon'), 'mdi:arrow-bottom-left', 'Solar2Grid icon should be normal icon');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2home').getAttribute('icon'), 'mdi:arrow-bottom-right', 'Solar2Home icon should be normal icon');
    assert.equal(card.shadowRoot.querySelector('#icon-grid2home').getAttribute('icon'), 'mdi:arrow-right', 'Grid2Home icon should be normal icon');
  });

  it('displays values when consuming from the grid', () => {
    assert.equal(card.shadowRoot.querySelector('#value-solar').innerText, '500', 'Solar should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid').innerText, '-1800', 'Grid should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-home').innerText, '-2300', 'Home should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2grid').innerText, '', 'Solar2Grid arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2home').innerText, '', 'Solar2Home arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2home').innerText, '', 'Grid2Home arrow shouldn\'t have a value');
  });

  it('has ui elements when consuming from the grid', () => {
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar').classList.contains('producing'), 'Solar icon should be producing');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid').classList.contains('consuming'), 'Grid icon should be consuming');
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
    assert.equal(card.shadowRoot.querySelector('#value-home').innerText, '-450', 'Home should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2grid').innerText, '', 'Solar2Grid arrow should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2home').innerText, '', 'Solar2Home arrow should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2home').innerText, '', 'Grid2Home arrow shouldn\'t have a value');
  });

  it('has ui elements when producing to the grid', async () => {
    await setCardProducingToGrid();

    assert.isTrue(card.shadowRoot.querySelector('#icon-solar').classList.contains('producing'), 'Solar icon should be producing');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid').classList.contains('producing'), 'Grid icon should be producing');
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

    assert.equal(card.shadowRoot.querySelector('#value-solar').innerText, '-5', 'Solar should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid').innerText, '-5', 'Grid should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-home').innerText, '0', 'Home should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2grid').innerText, '', 'Solar2Grid arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2home').innerText, '', 'Solar2Home arrow should have a value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2home').innerText, '', 'Grid2Home arrow shouldn\'t have a value');
  });

  it('has ui elements when solar inverter consumes power', async () => {
    await setCardSolarConsuming();

    assert.isTrue(card.shadowRoot.querySelector('#icon-solar').classList.contains('consuming'), 'Solar icon should be inactive');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid').classList.contains('consuming'), 'Grid icon should be inactive');
    assert.isTrue(card.shadowRoot.querySelector('#icon-home').classList.contains('inactive'), 'Home icon should be inactive');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2grid').getAttribute('icon'), 'mdi:arrow-bottom-left', 'Solar2Grid icon should be normal icon');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2home').getAttribute('icon'), 'mdi:arrow-top-left', 'Solar2Home icon should be reversed icon');
    assert.equal(card.shadowRoot.querySelector('#icon-grid2home').getAttribute('icon'), 'mdi:arrow-right', 'Grid2Home icon should be normal icon');
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar2grid').classList.contains('inactive'), 'Solar2Grid arrow icon should be inactive');
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar2home').classList.contains('active'), 'Solar2Home arrow icon should be inactive');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid2home').classList.contains('active'), 'Grid2Home arrow icon should be active');
  });

  it('updates when sensor value changes', async () => {
    assert.equal(card.shadowRoot.querySelector('#value-solar').innerText, '500', 'Solar should have value set');
    hass.states['sensor.solar_power'].state = "501";
    card.setAttribute('hass', JSON.stringify(hass));
    await elementUpdated(card);
    await card.setConfig(config);

    assert.equal(card.shadowRoot.querySelector('#value-solar').innerText, '501', 'Solar should have changed value');
  });

  it('has card size', () => {
    assert.equal(card.getCardSize(), 5, 'getCardSize should respond');
  });

});
