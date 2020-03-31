import '../bower_components/webcomponentsjs/webcomponents-loader';
import {assert, elementUpdated} from '@open-wc/testing';
import './hui-view-mock.js';
import '../power-wheel-card.js';
import {setCard, setCardView, setCardAllInactive} from './test_main.js';

describe('<power-wheel-card> with icon coloring', () => {
  let card, hass, config;

  /** Tests are extended in icon_colors. **/

  beforeEach(async () => {
    config = {
      type: "custom:power-wheel-card",
      solar_power_entity: "sensor.solar_power",
      grid_power_consumption_entity: "sensor.grid_power_consumption",
      grid_power_production_entity: "sensor.grid_power_production",
      solar_energy_entity: "sensor.solar_energy",
      grid_energy_consumption_entity: "sensor.grid_energy_consumption",
      grid_energy_production_entity: "sensor.grid_energy_production",
      energy_consumption_rate: 0.20,
      money_unit: '$',
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
    assert.isTrue(card.config.color_icons, 'Card parameter color_icons should be set');
    assert.equal(card.config.consuming_color, 'var(--label-badge-yellow, #f4b400)', 'Card parameter consuming_color should be yellow');
    assert.equal(card.config.producing_color, 'var(--label-badge-green, #0da035)', 'Card parameter producing_color should be green');
  });

  it('uses color values', () => {
    assert.equal(window.getComputedStyle(card.shadowRoot.querySelector('ha-icon.consuming'), null).getPropertyValue('color'), 'rgb(244, 180, 0)', 'Consuming icon color should be #f4b400');
    assert.equal(window.getComputedStyle(card.shadowRoot.querySelector('ha-icon.producing'), null).getPropertyValue('color'), 'rgb(13, 160, 53)', 'Producing icon color should be #0da035');
  });

  it('displays values in power view when consuming from the grid', () => {
    assert.equal(card.shadowRoot.querySelector('#value-solar').innerText, '500', 'Solar should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid').innerText, '1800', 'Grid should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-home').innerText, '2300', 'Home should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2grid').innerText, '', 'Solar2Grid arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2home').innerText, '', 'Solar2Home arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2home').innerText, '', 'Grid2Home arrow shouldn\'t have a value');
  });

  it('displays values in power view when producing to the grid', async () => {
    await setCardProducingToGrid();

    assert.equal(card.shadowRoot.querySelector('#value-solar').innerText, '500', 'Solar should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid').innerText, '50', 'Grid should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-home').innerText, '450', 'Home should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2grid').innerText, '', 'Solar2Grid arrow should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2home').innerText, '', 'Solar2Home arrow should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2home').innerText, '', 'Grid2Home arrow shouldn\'t have a value');
  });

  it('has ui elements in power view when producing to the grid', async () => {
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

  it('displays values in power view when all sensor values are zero', async () => {
    await setCardAllInactive(card, hass, config);

    assert.equal(card.shadowRoot.querySelector('#value-solar').innerText, '0', 'Solar should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid').innerText, '0', 'Grid should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-home').innerText, '0', 'Home should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2grid').innerText, '', 'Solar2Grid arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2home').innerText, '', 'Solar2Home arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2home').innerText, '', 'Grid2Home arrow shouldn\'t have a value');
  });

  it('displays values in power view when solar inverter consumes power', async () => {
    await setCardSolarConsuming();

    assert.equal(card.shadowRoot.querySelector('#value-solar').innerText, '5', 'Solar should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid').innerText, '5', 'Grid should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-home').innerText, '0', 'Home should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2grid').innerText, '', 'Solar2Grid arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2home').innerText, '', 'Solar2Home arrow should have a value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2home').innerText, '', 'Grid2Home arrow shouldn\'t have a value');
  });

  it('displays values in energy view when having consumed from the grid only', async () => {
    await setCardView(card, 'energy');

    assert.equal(card.shadowRoot.querySelector('#value-solar').innerText, '5.000', 'Solar should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid').innerText, '18.000', 'Grid should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-home').innerText, '23.000', 'Home should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2grid').innerText, '', 'Solar2Grid arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2home').innerText, '', 'Solar2Home arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2home').innerText, '', 'Grid2Home arrow shouldn\'t have a value');
  });

  it('displays values in energy view when having produced to the grid only', async () => {
    await setCardProducedToGridOnly();
    await setCardView(card, 'energy');

    assert.equal(card.shadowRoot.querySelector('#value-solar').innerText, '5.000', 'Solar should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid').innerText, '0.500', 'Grid should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-home').innerText, '4.500', 'Home should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2grid').innerText, '', 'Solar2Grid arrow should have a correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2home').innerText, '', 'Solar2Home arrow should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2home').innerText, '', 'Grid2Home arrow shouldn\'t have a value');
  });

  it('displays values in energy view when having consumed from and produced to the grid', async () => {
    await setCardConsumedAndProducedToGrid();
    await setCardView(card, 'energy');

    assert.equal(card.shadowRoot.querySelector('#value-solar').innerText, '5.000', 'Solar should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid').innerText, '0.600', 'Grid should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-home').innerText, '5.600', 'Home should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2grid').innerText, '0.400', 'Solar2Grid arrow should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2home').innerText, '4.600', 'Solar2Home arrow should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2home').innerText, '1.000', 'Grid2Home arrow should have correct value');
  });

  it('displays values in money view when having consumed from the grid only', async () => {
    await setCardView(card, 'money');

    assert.equal(card.shadowRoot.querySelector('#value-solar').innerText, '1.00', 'Solar should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid').innerText, '3.60', 'Grid should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-home').innerText, '4.60', 'Home should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2grid').innerText, '', 'Solar2Grid arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2home').innerText, '', 'Solar2Home arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2home').innerText, '', 'Grid2Home arrow shouldn\'t have a value');
  });

  it('displays values in money view when having produced to the grid only', async () => {
    await setCardProducedToGridOnly();
    await setCardView(card, 'money');

    assert.equal(card.shadowRoot.querySelector('#value-solar').innerText, '1.00', 'Solar should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid').innerText, '0.10', 'Grid should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-home').innerText, '0.90', 'Home should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2grid').innerText, '', 'Solar2Grid arrow should have a correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2home').innerText, '', 'Solar2Home arrow should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2home').innerText, '', 'Grid2Home arrow shouldn\'t have a value');
  });

  it('displays values in money view when having consumed from and produced to the grid', async () => {
    await setCardConsumedAndProducedToGrid();
    await setCardView(card, 'money');

    assert.equal(card.shadowRoot.querySelector('#value-solar').innerText, '1.00', 'Solar should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid').innerText, '0.12', 'Grid should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-home').innerText, '1.12', 'Home should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2grid').innerText, '0.08', 'Solar2Grid arrow should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2home').innerText, '0.92', 'Solar2Home arrow should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2home').innerText, '0.20', 'Grid2Home arrow should have correct value');
  });

});
