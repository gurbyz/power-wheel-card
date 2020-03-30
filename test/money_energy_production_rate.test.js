import '../bower_components/webcomponentsjs/webcomponents-loader';
import {assert, fixture, html, elementUpdated} from '@open-wc/testing';
import './hui-view-mock.js';
import '../power-wheel-card.js';

describe('<power-wheel-card> with split energy rates', () => {
  let card, hass, config;

  /** Tests are based on money_capable. **/

  beforeEach(async () => {
    config = {
      type: "custom:power-wheel-card",
      solar_power_entity: "sensor.solar_power",
      grid_power_consumption_entity: "sensor.grid_power_consumption",
      grid_power_production_entity: "sensor.grid_power_production",
      solar_energy_entity: "sensor.solar_energy",
      grid_energy_consumption_entity: "sensor.grid_energy_consumption",
      grid_energy_production_entity: "sensor.grid_energy_production",
      energy_consumption_rate: 0.50,
      energy_production_rate: 0.20,
      money_unit: '$',
      initial_view: "money",
      color_icons: false,
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

  const setCardProducedToGridOnly = async () => {
    hass.states['sensor.grid_energy_consumption'].state = "0";
    hass.states['sensor.grid_energy_production'].state = "0.5";
    card.setAttribute('hass', JSON.stringify(hass));
    await elementUpdated(card);
    await card.setConfig(config);
  };

  const setCardConsumedAndProducedToGrid = async () => {
    hass.states['sensor.grid_energy_consumption'].state = "1";
    hass.states['sensor.grid_energy_production'].state = "0.4";
    card.setAttribute('hass', JSON.stringify(hass));
    await elementUpdated(card);
    await card.setConfig(config);
  };

  it('has config values', () => {
    assert.equal(card.config.money_unit, '$', 'Card parameter money_unit should be set');
    assert.equal(card.config.initial_view, 'money', 'Card parameter initial_view should be set');
    assert.equal(card.config.energy_production_rate, 0.20, 'Card parameter energy_production_rate should be set');
  });

  it('has set card property values after setConfig', () => {
    assert.deepEqual(card.sensors, ["sensor.solar_power", "sensor.grid_power_consumption", "sensor.grid_power_production", "sensor.solar_energy", "sensor.grid_energy_consumption", "sensor.grid_energy_production"], 'Card property sensors should be set');
    assert.equal(card.view, 'money', 'Card property view should be set');
    assert.isTrue(card.views.energy.capable, 'Card property views should have value set for energy capable');
    assert.isTrue(card.views.money.capable, 'Card property views should have value set for money capable');
  });

  it('has no warnings or errors', () => {
    assert.equal(card.shadowRoot.querySelectorAll('.message').length, 0, 'Number of messages should be zero');
  });

  it('displays values', () => {
    assert.equal(card.shadowRoot.querySelector('#title').innerText, "Power wheel");
    assert.equal(card.shadowRoot.querySelector('#unit').innerText, "$", 'Unit should be set to money');
  });

  it('displays values when having consumed from the grid only', () => {
    assert.equal(card.shadowRoot.querySelector('#value-solar').innerText, '2.50', 'Solar should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid').innerText, '-9.00', 'Grid should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-home').innerText, '-11.50', 'Home should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2grid').innerText, '', 'Solar2Grid arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2home').innerText, '', 'Solar2Home arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2home').innerText, '', 'Grid2Home arrow shouldn\'t have a value');
  });

  it('has ui elements when having consumed from the grid only', () => {
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

  it('displays values when having produced to the grid only', async () => {
    await setCardProducedToGridOnly();

    assert.equal(card.shadowRoot.querySelector('#value-solar').innerText, '2.35', 'Solar should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid').innerText, '0.10', 'Grid should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-home').innerText, '-2.25', 'Home should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2grid').innerText, '', 'Solar2Grid arrow should have a correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2home').innerText, '', 'Solar2Home arrow should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2home').innerText, '', 'Grid2Home arrow shouldn\'t have a value');
  });

  it('has ui elements when having produced to the grid only', async () => {
    await setCardProducedToGridOnly();

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

  it('displays values when having consumed from and produced to the grid', async () => {
    await setCardConsumedAndProducedToGrid();

    assert.equal(card.shadowRoot.querySelector('#value-solar').innerText, '2.38', 'Solar should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid').innerText, '-0.42', 'Grid should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-home').innerText, '-2.80', 'Home should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2grid').innerText, '0.08', 'Solar2Grid arrow should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2home').innerText, '2.30', 'Solar2Home arrow should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2home').innerText, '0.50', 'Grid2Home arrow should have correct value');
  });

  it('has ui elements when having consumed from and produced to the grid', async () => {
    await setCardConsumedAndProducedToGrid();

    assert.isTrue(card.shadowRoot.querySelector('#icon-solar').classList.contains('producing'), 'Solar icon should be producing');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid').classList.contains('consuming'), 'Grid icon should be consuming');
    assert.isTrue(card.shadowRoot.querySelector('#icon-home').classList.contains('consuming'), 'Home icon should be consuming');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2grid').getAttribute('icon'), 'mdi:arrow-bottom-left', 'Solar2Grid icon should be normal icon');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2home').getAttribute('icon'), 'mdi:arrow-bottom-right', 'Solar2Home icon should be normal icon');
    assert.equal(card.shadowRoot.querySelector('#icon-grid2home').getAttribute('icon'), 'mdi:arrow-right', 'Grid2Home icon should be normal icon');
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar2grid').classList.contains('active'), 'Solar2Grid arrow icon should be active');
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar2home').classList.contains('active'), 'Solar2Home arrow icon should be active');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid2home').classList.contains('active'), 'Grid2Home arrow icon should be active');
  });

});
