import '../bower_components/webcomponentsjs/webcomponents-loader';
import {assert, elementUpdated} from '@open-wc/testing';
import './hui-view-mock.js';
import '../power-wheel-card.js';
import {setCard, setCardAllInactive} from './test_main.js';

describe('<power-wheel-card> with battery power sensor with switched polarity', () => {
  let card, hass, config;

  /** Tests are based on battery_capable. **/

  beforeEach(async () => {
    config = {
      type: "custom:power-wheel-card",
      solar_power_entity: "sensor.solar_power",
      grid_power_consumption_entity: "sensor.grid_power_consumption",
      grid_power_production_entity: "sensor.grid_power_production",
      battery_power_entity: "sensor.battery_power",
      charging_is_positive: false,
      color_icons: false,
    };
    hass = {
      // Battery, Grid and Solar are delivering to Home
      states: {
        "sensor.solar_power": {
          attributes: {
            unit_of_measurement: "W",
            friendly_name: "Solar Power",
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
        "sensor.battery_power": {
          attributes: {
            unit_of_measurement: "W",
          },
          entity_id: "sensor.battery_power",
          state: "300",
        },
      },
    };

    card = await setCard(hass, config);
});

  const setCardProducingToGrid = async () => {
    hass.states['sensor.grid_power_consumption'].state = "0";
    hass.states['sensor.grid_power_production'].state = "50";
    hass.states['sensor.battery_power'].state = "-100";
    card.setAttribute('hass', JSON.stringify(hass));
    await elementUpdated(card);
    await card.setConfig(config);
  };

  const setCardBatteryChargedBySolar = async () => {
    hass.states['sensor.grid_power_consumption'].state = "0";
    hass.states['sensor.grid_power_production'].state = "0";
    hass.states['sensor.battery_power'].state = "-280";
    card.setAttribute('hass', JSON.stringify(hass));
    await elementUpdated(card);
    await card.setConfig(config);
  };

  const setCardBatteryChargedBySolarAndProducingToGrid = async () => {
    hass.states['sensor.grid_power_consumption'].state = "0";
    hass.states['sensor.grid_power_production'].state = "100";
    hass.states['sensor.battery_power'].state = "-280";
    card.setAttribute('hass', JSON.stringify(hass));
    await elementUpdated(card);
    await card.setConfig(config);
  };

  const setCardBatteryChargedByGrid = async () => {
    hass.states['sensor.solar_power'].state = "0";
    hass.states['sensor.grid_power_consumption'].state = "1800";
    hass.states['sensor.grid_power_production'].state = "0";
    hass.states['sensor.battery_power'].state = "-280";
    card.setAttribute('hass', JSON.stringify(hass));
    await elementUpdated(card);
    await card.setConfig(config);
  };

  const setCardBatteryDischargedWhenProducingToGrid = async () => {
    hass.states['sensor.solar_power'].state = "0";
    hass.states['sensor.battery_power'].state = "1228";
    hass.states['sensor.grid_power_consumption'].state = "0";
    hass.states['sensor.grid_power_production'].state = "171";
    card.setAttribute('hass', JSON.stringify(hass));
    await elementUpdated(card);
    await card.setConfig(config);
  };

  const setCardBatteryDischargedWhenProducingToGridAndSomeSun = async () => {
    hass.states['sensor.solar_power'].state = "5";
    hass.states['sensor.battery_power'].state = "637";
    hass.states['sensor.grid_power_consumption'].state = "0";
    hass.states['sensor.grid_power_production'].state = "179";
    card.setAttribute('hass', JSON.stringify(hass));
    await elementUpdated(card);
    await card.setConfig(config);
  };

  const setCardBatterySoC = async () => {
    config.battery_soc_entity = "sensor.battery_soc";
    hass.states['sensor.battery_soc'] = {
      attributes: {
        unit_of_measurement: "%",
      },
      entity_id: "sensor.battery_soc",
      state: "89",
    };
    card.setAttribute('hass', JSON.stringify(hass));
    await elementUpdated(card);
    await card.setConfig(config);
  };

  it('has set card property values after setConfig', () => {
    assert.isTrue(card.views.power.batteryCapable, 'Card property views should have value set for power view battery capability');
  });

  it('has ui elements', () => {
    assert.equal(card.shadowRoot.querySelector('#icon-battery').getAttribute('icon'), 'mdi:car-battery', 'Battery icon should be default icon');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2battery').getAttribute('icon'), 'mdi:arrow-right', 'Solar2Battery icon should be normal icon');
    assert.equal(card.shadowRoot.querySelector('#icon-battery2home').getAttribute('icon'), 'mdi:arrow-down', 'Battery2Home icon should be normal icon');
    assert.equal(card.shadowRoot.querySelector('#cell-battery').getAttribute('title'), '', 'Battery title should be set');
    assert.equal(card.shadowRoot.querySelector('#cell-solar2battery').getAttribute('title'), 'More info', 'Solar2Battery title should be set');
    assert.equal(card.shadowRoot.querySelector('#cell-battery2home').getAttribute('title'), 'More info', 'Battery2Home title should be set');
    assert.isTrue(card.shadowRoot.querySelector('#cell-grid2battery').classList.contains('hidden'), 'Grid2Battery arrow should be disabled');
  });

  it('displays values when consuming from solar, the grid and the battery', () => {
    assert.equal(card.shadowRoot.querySelector('#value-solar').innerText, '500', 'Solar should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid').innerText, '-1800', 'Grid should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-home').innerText, '-2600', 'Home should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-battery').innerText, '-300', 'Battery should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2grid').innerText, '', 'Solar2Grid arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2home').innerText, '', 'Solar2Home arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2home').innerText, '', 'Grid2Home arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2battery').innerText, '', 'Solar2Battery arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2battery').innerText, '', 'Grid2Battery arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-battery2home').innerText, '', 'Battery2Home arrow shouldn\'t have a value');
  });

  it('has ui elements when consuming from solar, the grid and the battery', () => {
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar').classList.contains('producing'), 'Solar icon should be producing');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid').classList.contains('consuming'), 'Grid icon should be consuming');
    assert.isTrue(card.shadowRoot.querySelector('#icon-home').classList.contains('consuming'), 'Home icon should be consuming');
    assert.isTrue(card.shadowRoot.querySelector('#icon-battery').classList.contains('consuming'), 'Battery icon should be consuming');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2grid').getAttribute('icon'), 'mdi:arrow-bottom-left', 'Solar2Grid icon should be normal icon');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2home').getAttribute('icon'), 'mdi:arrow-bottom-right', 'Solar2Home icon should be normal icon');
    assert.equal(card.shadowRoot.querySelector('#icon-grid2home').getAttribute('icon'), 'mdi:arrow-right', 'Grid2Home icon should be normal icon');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2battery').getAttribute('icon'), 'mdi:arrow-right', 'Solar2Battery icon should be normal icon');
    assert.isTrue(card.shadowRoot.querySelector('#cell-grid2battery').classList.contains('hidden'), 'Grid2Battery cell should be hidden');
    assert.equal(card.shadowRoot.querySelector('#icon-grid2battery').getAttribute('icon'), 'mdi:arrow-up', 'Grid2Battery icon should be normal icon');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid2battery').classList.contains('inactive'), 'Grid2Battery arrow icon should be inactive');
    assert.equal(card.shadowRoot.querySelector('#icon-battery2home').getAttribute('icon'), 'mdi:arrow-down', 'Battery2Home icon should be normal icon');
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar2grid').classList.contains('inactive'), 'Solar2Grid arrow icon should be inactive');
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar2home').classList.contains('active'), 'Solar2Home arrow icon should be active');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid2home').classList.contains('active'), 'Grid2Home arrow icon should be active');
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar2battery').classList.contains('inactive'), 'Solar2Battery arrow icon should be inactive');
    assert.isTrue(card.shadowRoot.querySelector('#icon-battery2home').classList.contains('active'), 'Battery2Home arrow icon should be active');
  });

  it('displays values when producing to the grid while consuming from the battery', async () => {
    await setCardProducingToGrid();

    assert.equal(card.shadowRoot.querySelector('#value-solar').innerText, '500', 'Solar should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid').innerText, '50', 'Grid should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-home').innerText, '-350', 'Home should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-battery').innerText, '100', 'Battery should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2grid').innerText, '', 'Solar2Grid arrow should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2home').innerText, '', 'Solar2Home arrow should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2home').innerText, '', 'Grid2Home arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2battery').innerText, '', 'Solar2Battery arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2battery').innerText, '', 'Grid2Battery arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-battery2home').innerText, '', 'Battery2Home arrow shouldn\'t have a value');
  });

  it('has ui elements when producing to the grid while consuming from the battery', async () => {
    await setCardProducingToGrid();

    assert.isTrue(card.shadowRoot.querySelector('#icon-solar').classList.contains('producing'), 'Solar icon should be producing');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid').classList.contains('producing'), 'Grid icon should be producing');
    assert.isTrue(card.shadowRoot.querySelector('#icon-home').classList.contains('consuming'), 'Home icon should be consuming');
    assert.isTrue(card.shadowRoot.querySelector('#icon-battery').classList.contains('producing'), 'Battery icon should be producing');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2grid').getAttribute('icon'), 'mdi:arrow-bottom-left', 'Solar2Grid icon should be normal icon');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2home').getAttribute('icon'), 'mdi:arrow-bottom-right', 'Solar2Home icon should be normal icon');
    assert.equal(card.shadowRoot.querySelector('#icon-grid2home').getAttribute('icon'), 'mdi:arrow-right', 'Grid2Home icon should be normal icon');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2battery').getAttribute('icon'), 'mdi:arrow-right', 'Solar2Battery icon should be normal icon');
    assert.isTrue(card.shadowRoot.querySelector('#cell-grid2battery').classList.contains('hidden'), 'Grid2Battery cell should be hidden');
    assert.equal(card.shadowRoot.querySelector('#icon-grid2battery').getAttribute('icon'), 'mdi:arrow-up', 'Grid2Battery icon should be normal icon');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid2battery').classList.contains('inactive'), 'Grid2Battery arrow icon should be inactive');
    assert.equal(card.shadowRoot.querySelector('#icon-battery2home').getAttribute('icon'), 'mdi:arrow-down', 'Battery2Home icon should be normal icon');
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar2grid').classList.contains('active'), 'Solar2Grid arrow icon should be active');
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar2home').classList.contains('active'), 'Solar2Home arrow icon should be active');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid2home').classList.contains('inactive'), 'Grid2Home arrow icon should be inactive');
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar2battery').classList.contains('active'), 'Solar2Battery arrow icon should be active');
    assert.isTrue(card.shadowRoot.querySelector('#icon-battery2home').classList.contains('inactive'), 'Battery2Home arrow icon should be inactive');
  });

  it('displays values when all sensor values are zero', async () => {
    await setCardAllInactive(card, hass, config);

    assert.equal(card.shadowRoot.querySelector('#value-solar').innerText, '0', 'Solar should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid').innerText, '0', 'Grid should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-home').innerText, '0', 'Home should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-battery').innerText, '0', 'Battery should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2grid').innerText, '', 'Solar2Grid arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2home').innerText, '', 'Solar2Home arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2home').innerText, '', 'Grid2Home arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2battery').innerText, '', 'Solar2Battery arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2battery').innerText, '', 'Grid2Battery arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-battery2home').innerText, '', 'Battery2Home arrow shouldn\'t have a value');
  });

  it('has ui elements when all sensor values are zero', async () => {
    await setCardAllInactive(card, hass, config);

    assert.isTrue(card.shadowRoot.querySelector('#icon-solar').classList.contains('inactive'), 'Solar icon should be inactive');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid').classList.contains('inactive'), 'Grid icon should be inactive');
    assert.isTrue(card.shadowRoot.querySelector('#icon-home').classList.contains('inactive'), 'Home icon should be inactive');
    assert.isTrue(card.shadowRoot.querySelector('#cell-battery').classList.contains('hidden'), 'Battery cell should be hidden');
    assert.isTrue(card.shadowRoot.querySelector('#icon-battery').classList.contains('inactive'), 'Battery icon should be inactive');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2grid').getAttribute('icon'), 'mdi:arrow-bottom-left', 'Solar2Grid icon should be normal icon');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2home').getAttribute('icon'), 'mdi:arrow-bottom-right', 'Solar2Home icon should be normal icon');
    assert.equal(card.shadowRoot.querySelector('#icon-grid2home').getAttribute('icon'), 'mdi:arrow-right', 'Grid2Home icon should be normal icon');
    assert.isTrue(card.shadowRoot.querySelector('#cell-solar2battery').classList.contains('hidden'), 'Solar2Battery cell should be hidden');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2battery').getAttribute('icon'), 'mdi:arrow-right', 'Solar2Battery icon should be normal icon');
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar2battery').classList.contains('inactive'), 'Solar2Battery arrow icon should be inactive');
    assert.isTrue(card.shadowRoot.querySelector('#cell-grid2battery').classList.contains('hidden'), 'Grid2Battery cell should be hidden');
    assert.equal(card.shadowRoot.querySelector('#icon-grid2battery').getAttribute('icon'), 'mdi:arrow-up', 'Grid2Battery icon should be normal icon');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid2battery').classList.contains('inactive'), 'Grid2Battery arrow icon should be inactive');
    assert.isTrue(card.shadowRoot.querySelector('#cell-battery2home').classList.contains('hidden'), 'Battery2Home cell should be hidden');
    assert.equal(card.shadowRoot.querySelector('#icon-battery2home').getAttribute('icon'), 'mdi:arrow-down', 'Battery2Home icon should be normal icon');
    assert.isTrue(card.shadowRoot.querySelector('#icon-battery2home').classList.contains('inactive'), 'Battery2Home arrow icon should be inactive');
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar2grid').classList.contains('inactive'), 'Solar2Grid arrow icon should be inactive');
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar2home').classList.contains('inactive'), 'Solar2Home arrow icon should be inactive');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid2home').classList.contains('inactive'), 'Grid2Home arrow icon should be inactive');
  });

  it('displays values when charging the battery by the sun', async () => {
    await setCardBatteryChargedBySolar();

    assert.equal(card.shadowRoot.querySelector('#value-solar').innerText, '500', 'Solar should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid').innerText, '0', 'Grid should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-home').innerText, '-220', 'Home should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-battery').innerText, '280', 'Battery should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2battery').innerText, '', 'Grid2Battery arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2home').innerText, '', 'Grid2Home arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2home').innerText, '', 'Solar2Home arrow should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2battery').innerText, '', 'Solar2Battery arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2grid').innerText, '', 'Solar2Grid arrow should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-battery2home').innerText, '', 'Battery2Home arrow shouldn\'t have a value');
  });

  it('has ui elements when charging the battery by the sun', async () => {
    await setCardBatteryChargedBySolar();

    assert.isTrue(card.shadowRoot.querySelector('#icon-solar').classList.contains('producing'), 'Solar icon should be producing');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid').classList.contains('inactive'), 'Grid icon should be inactive');
    assert.isTrue(card.shadowRoot.querySelector('#icon-home').classList.contains('consuming'), 'Home icon should be consuming');
    assert.isTrue(card.shadowRoot.querySelector('#icon-battery').classList.contains('producing'), 'Battery icon should be producing');
    assert.isTrue(card.shadowRoot.querySelector('#cell-grid2battery').classList.contains('hidden'), 'Grid2Battery cell should be hidden');
    assert.equal(card.shadowRoot.querySelector('#icon-grid2battery').getAttribute('icon'), 'mdi:arrow-up', 'Grid2Battery icon should be normal icon');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid2battery').classList.contains('inactive'), 'Grid2Battery arrow icon should be inactive');
    assert.equal(card.shadowRoot.querySelector('#icon-grid2home').getAttribute('icon'), 'mdi:arrow-right', 'Grid2Home icon should be normal icon');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid2home').classList.contains('inactive'), 'Grid2Home arrow icon should be inactive');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2home').getAttribute('icon'), 'mdi:arrow-bottom-right', 'Solar2Home icon should be normal icon');
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar2home').classList.contains('active'), 'Solar2Home arrow icon should be active');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2battery').getAttribute('icon'), 'mdi:arrow-right', 'Solar2Battery icon should be normal icon');
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar2battery').classList.contains('active'), 'Solar2Battery arrow icon should be active');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2grid').getAttribute('icon'), 'mdi:arrow-bottom-left', 'Solar2Grid icon should be normal icon');
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar2grid').classList.contains('inactive'), 'Solar2Grid arrow icon should be inactive');
    assert.equal(card.shadowRoot.querySelector('#icon-battery2home').getAttribute('icon'), 'mdi:arrow-down', 'Battery2Home icon should be normal icon');
    assert.isTrue(card.shadowRoot.querySelector('#icon-battery2home').classList.contains('inactive'), 'Battery2Home arrow icon should be inactive');
  });

  it('displays values when charging the battery by the sun while producing to the grid', async () => {
    await setCardBatteryChargedBySolarAndProducingToGrid();

    assert.equal(card.shadowRoot.querySelector('#value-solar').innerText, '500', 'Solar should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid').innerText, '100', 'Grid should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-home').innerText, '-120', 'Home should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-battery').innerText, '280', 'Battery should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2grid').innerText, '', 'Solar2Grid arrow should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2home').innerText, '', 'Solar2Home arrow should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2home').innerText, '', 'Grid2Home arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2battery').innerText, '', 'Solar2Battery arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2battery').innerText, '', 'Grid2Battery arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-battery2home').innerText, '', 'Battery2Home arrow shouldn\'t have a value');
  });

  it('has ui elements when charging the battery by the sun while producing to the grid', async () => {
    await setCardBatteryChargedBySolarAndProducingToGrid();

    assert.isTrue(card.shadowRoot.querySelector('#icon-solar').classList.contains('producing'), 'Solar icon should be producing');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid').classList.contains('producing'), 'Grid icon should be producing');
    assert.isTrue(card.shadowRoot.querySelector('#icon-home').classList.contains('consuming'), 'Home icon should be consuming');
    assert.isTrue(card.shadowRoot.querySelector('#icon-battery').classList.contains('producing'), 'Battery icon should be producing');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2grid').getAttribute('icon'), 'mdi:arrow-bottom-left', 'Solar2Grid icon should be normal icon');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2home').getAttribute('icon'), 'mdi:arrow-bottom-right', 'Solar2Home icon should be normal icon');
    assert.equal(card.shadowRoot.querySelector('#icon-grid2home').getAttribute('icon'), 'mdi:arrow-right', 'Grid2Home icon should be normal icon');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2battery').getAttribute('icon'), 'mdi:arrow-right', 'Solar2Battery icon should be normal icon');
    assert.isTrue(card.shadowRoot.querySelector('#cell-grid2battery').classList.contains('hidden'), 'Grid2Battery cell should be hidden');
    assert.equal(card.shadowRoot.querySelector('#icon-grid2battery').getAttribute('icon'), 'mdi:arrow-up', 'Grid2Battery icon should be normal icon');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid2battery').classList.contains('inactive'), 'Grid2Battery arrow icon should be inactive');
    assert.equal(card.shadowRoot.querySelector('#icon-battery2home').getAttribute('icon'), 'mdi:arrow-down', 'Battery2Home icon should be normal icon');
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar2grid').classList.contains('active'), 'Solar2Grid arrow icon should be active');
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar2home').classList.contains('active'), 'Solar2Home arrow icon should be active');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid2home').classList.contains('inactive'), 'Grid2Home arrow icon should be inactive');
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar2battery').classList.contains('active'), 'Solar2Battery arrow icon should be active');
    assert.isTrue(card.shadowRoot.querySelector('#icon-battery2home').classList.contains('inactive'), 'Battery2Home arrow icon should be inactive');
  });

  it('displays values when charging the battery by the grid', async () => {
    await setCardBatteryChargedByGrid();

    assert.equal(card.shadowRoot.querySelector('#value-solar').innerText, '0', 'Solar should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid').innerText, '-1800', 'Grid should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-battery').innerText, '280', 'Battery should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-home').innerText, '-1520', 'Home should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2grid').innerText, '', 'Solar2Grid arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2home').innerText, '', 'Grid2Home arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2battery').innerText, '', 'Solar2Battery arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2battery').innerText, '', 'Grid2Battery arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-battery2home').innerText, '', 'Battery2Home arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2home').innerText, '', 'Solar2Home arrow shouldn\'t have a value');
  });

  it('has ui elements when charging the battery by the grid', async () => {
    await setCardBatteryChargedByGrid();

    assert.isTrue(card.shadowRoot.querySelector('#icon-solar').classList.contains('inactive'), 'Solar icon should be inactive');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid').classList.contains('consuming'), 'Grid icon should be consuming');
    assert.isTrue(card.shadowRoot.querySelector('#icon-home').classList.contains('consuming'), 'Home icon should be consuming');
    assert.isTrue(card.shadowRoot.querySelector('#icon-battery').classList.contains('producing'), 'Battery icon should be producing');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2grid').getAttribute('icon'), 'mdi:arrow-bottom-left', 'Solar2Grid icon should be normal icon');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2home').getAttribute('icon'), 'mdi:arrow-bottom-right', 'Solar2Home icon should be normal icon');
    assert.equal(card.shadowRoot.querySelector('#icon-grid2home').getAttribute('icon'), 'mdi:arrow-right', 'Grid2Home icon should be normal icon');
    assert.isTrue(card.shadowRoot.querySelector('#cell-solar2battery').classList.contains('hidden'), 'Solar2Battery cell should be hidden');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2battery').getAttribute('icon'), 'mdi:arrow-right', 'Solar2Battery icon should be normal icon');
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar2battery').classList.contains('inactive'), 'Solar2Battery arrow icon should be inactive');
    assert.equal(card.shadowRoot.querySelector('#icon-grid2battery').getAttribute('icon'), 'mdi:arrow-up', 'Grid2Battery icon should be normal icon');
    assert.isTrue(card.shadowRoot.querySelector('#cell-battery2home').classList.contains('hidden'), 'Battery2Home cell should be hidden');
    assert.equal(card.shadowRoot.querySelector('#icon-battery2home').getAttribute('icon'), 'mdi:arrow-down', 'Battery2Home icon should be normal icon');
    assert.isTrue(card.shadowRoot.querySelector('#icon-battery2home').classList.contains('inactive'), 'Battery2Home arrow icon should be inactive');
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar2grid').classList.contains('inactive'), 'Solar2Grid arrow icon should be inactive');
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar2home').classList.contains('inactive'), 'Solar2Home arrow icon should be inactive');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid2home').classList.contains('active'), 'Grid2Home arrow icon should be active');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid2battery').classList.contains('active'), 'Grid2Battery arrow icon should be active');
  });

  it('displays values when discharging the battery while producing to the grid', async () => {
    await setCardBatteryDischargedWhenProducingToGrid();

    assert.equal(card.shadowRoot.querySelector('#value-solar').innerText, '0', 'Solar should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2grid').innerText, '', 'Solar2Grid arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-battery').innerText, '-1228', 'Battery should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-battery2home').innerText, '', 'Battery2Home arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2battery').innerText, '', 'Solar2Battery arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2battery').innerText, '', 'Grid2Battery arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2home').innerText, '', 'Grid2Home arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-grid').innerText, '171', 'Grid should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2home').innerText, '', 'Solar2Home arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-home').innerText, '-1057', 'Home should have correct value');
  });

  it('has ui elements when discharging the battery while producing to the grid', async () => {
    await setCardBatteryDischargedWhenProducingToGrid();

    assert.isTrue(card.shadowRoot.querySelector('#icon-solar').classList.contains('inactive'), 'Solar icon should be inactive');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2grid').getAttribute('icon'), 'mdi:arrow-bottom-left', 'Solar2Grid icon should be normal icon');
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar2grid').classList.contains('inactive'), 'Solar2Grid arrow icon should be inactive');
    assert.isTrue(card.shadowRoot.querySelector('#icon-battery').classList.contains('consuming'), 'Battery icon should be consuming');
    assert.equal(card.shadowRoot.querySelector('#icon-battery2home').getAttribute('icon'), 'mdi:arrow-down', 'Battery2Home icon should be normal icon');
    assert.isTrue(card.shadowRoot.querySelector('#icon-battery2home').classList.contains('active'), 'Battery2Home arrow icon should be active');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2battery').getAttribute('icon'), 'mdi:arrow-right', 'Solar2Battery icon should be normal icon');
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar2battery').classList.contains('inactive'), 'Solar2Battery arrow icon should be inactive');
    assert.equal(card.shadowRoot.querySelector('#icon-grid2battery').getAttribute('icon'), 'mdi:arrow-down', 'Grid2Battery icon should be normal icon');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid2battery').classList.contains('active'), 'Grid2Battery arrow icon should be active');
    assert.equal(card.shadowRoot.querySelector('#icon-grid2home').getAttribute('icon'), 'mdi:arrow-right', 'Grid2Home icon should be normal icon');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid2home').classList.contains('inactive'), 'Grid2Home arrow icon should be inactive');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid').classList.contains('producing'), 'Grid icon should be producing');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2home').getAttribute('icon'), 'mdi:arrow-bottom-right', 'Solar2Home icon should be normal icon');
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar2home').classList.contains('inactive'), 'Solar2Home arrow icon should be inactive');
    assert.isTrue(card.shadowRoot.querySelector('#icon-home').classList.contains('consuming'), 'Home icon should be consuming');
  });

  it('displays values when discharging the battery while producing to the grid and some sun', async () => {
    await setCardBatteryDischargedWhenProducingToGridAndSomeSun();

    assert.equal(card.shadowRoot.querySelector('#value-solar').innerText, '5', 'Solar should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid').innerText, '179', 'Grid should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-home').innerText, '-463', 'Home should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-battery').innerText, '-637', 'Battery should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2grid').innerText, '', 'Solar2Grid arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-battery2home').innerText, '458', 'Battery2Home arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2battery').innerText, '', 'Solar2Battery arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2battery').innerText, '', 'Grid2Battery arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2home').innerText, '', 'Grid2Home arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2home').innerText, '', 'Solar2Home arrow shouldn\'t have a value');
  });

  it('has ui elements when discharging the battery while producing to the grid and some sun', async () => {
    await setCardBatteryDischargedWhenProducingToGridAndSomeSun();

    assert.isTrue(card.shadowRoot.querySelector('#icon-solar').classList.contains('producing'), 'Solar icon should be producing');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid').classList.contains('producing'), 'Grid icon should be producing');
    assert.isTrue(card.shadowRoot.querySelector('#icon-home').classList.contains('consuming'), 'Home icon should be consuming');
    assert.isTrue(card.shadowRoot.querySelector('#icon-battery').classList.contains('consuming'), 'Battery icon should be consuming');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2grid').getAttribute('icon'), 'mdi:arrow-bottom-left', 'Solar2Grid icon should be normal icon');
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar2grid').classList.contains('inactive'), 'Solar2Grid arrow icon should be inactive');
    assert.equal(card.shadowRoot.querySelector('#icon-battery2home').getAttribute('icon'), 'mdi:arrow-down', 'Battery2Home icon should be normal icon');
    assert.isTrue(card.shadowRoot.querySelector('#icon-battery2home').classList.contains('active'), 'Battery2Home arrow icon should be active');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2battery').getAttribute('icon'), 'mdi:arrow-right', 'Solar2Battery icon should be normal icon');
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar2battery').classList.contains('inactive'), 'Solar2Battery arrow icon should be inactive');
    assert.equal(card.shadowRoot.querySelector('#icon-grid2battery').getAttribute('icon'), 'mdi:arrow-down', 'Grid2Battery icon should be reversed icon');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid2battery').classList.contains('active'), 'Grid2Battery arrow icon should be active');
    assert.equal(card.shadowRoot.querySelector('#icon-grid2home').getAttribute('icon'), 'mdi:arrow-right', 'Grid2Home icon should be normal icon');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid2home').classList.contains('inactive'), 'Grid2Home arrow icon should be inactive');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2home').getAttribute('icon'), 'mdi:arrow-bottom-right', 'Solar2Home icon should be normal icon');
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar2home').classList.contains('active'), 'Solar2Home arrow icon should be active');
  });

  it('displays values for battery state of charge', async () => {
    await setCardBatterySoC();

    assert.equal(card.shadowRoot.querySelector('#cell-battery').getAttribute('title'), 'More info', 'Battery title should be set');
    assert.equal(card.shadowRoot.querySelector('#value-battery').innerText, '-300 (89%)', 'Battery should have correct value');
  });

});
