import {
  LitElement, html
} from 'https://unpkg.com/@polymer/lit-element@^0.5.2/lit-element.js?module';

class PowerWheelCard extends LitElement {
  static get properties() {
    return {
      hass: Object,
      config: Object,
    }
  };

  _generateClass(producingIsPositive, value) {
    if (producingIsPositive) {
      return value > 0 ? 'producing' : ((value < 0) ? 'consuming' : 'inactive');
    } else {
      return value > 0 ? 'consuming' : ((value < 0) ? 'producing' : 'inactive');
    }
  };

  _makePositionObject(hass, val, entity, configIcon, defaultIcon, decimals, producingIsPositive) {
    const stateStr = typeof val === 'undefined' ? 'unavailable' : val.toFixed(decimals);
    const stateObj = hass.states[entity];
    const icon = configIcon ? configIcon : (stateObj && stateObj.attributes.icon ? stateObj.attributes.icon : defaultIcon);
    const classValue = this._generateClass(producingIsPositive, val);

    return {
      stateObj,
      stateStr,
      val,
      icon,
      classValue,
    };
  };

  _makeArrowObject(val, icon, decimals) {
    const valueStr = typeof val === 'undefined' ? 'unavailable' : val.toFixed(decimals);
    const classValue = typeof val !== 'undefined' && val > 0 ? 'active' : 'inactive';

    return {
      valueStr,
      val,
      icon,
      classValue
    }
  };

  _calculateSolarValue(hass, solar_entity) {
    const solarStateObj = hass.states[solar_entity];
    return solarStateObj ? parseFloat(solarStateObj.state) : undefined;
  };

  _calculateGrid2HomeValue(hass, grid_consumption_entity) {
    const gridConsumptionStateObj = hass.states[grid_consumption_entity];
    return gridConsumptionStateObj ? parseFloat(gridConsumptionStateObj.state) : undefined;
  };

  _calculateSolar2GridValue(hass, grid_production_entity) {
    const gridProductionStateObj = hass.states[grid_production_entity];
    return gridProductionStateObj ? parseFloat(gridProductionStateObj.state) : undefined;
  };

  _calculateGridValue(data) {
    return typeof data.grid2home.val !== 'undefined' && typeof data.solar2grid.val !== 'undefined'
      ? data.grid2home.val - data.solar2grid.val : undefined;
  };

  _calculateHomeValue(data) {
    return typeof data.solar.val !== 'undefined' && typeof data.grid.val !== 'undefined'
      ? data.solar.val + data.grid.val : undefined;
  };

  _calculateSolar2HomeValue(data) {
    return typeof data.solar.val !== 'undefined' && typeof data.solar2grid.val !== 'undefined'
      ? data.solar.val - data.solar2grid.val : undefined;
  };

  _getEntityUnit(stateObj) {
    return stateObj && stateObj.attributes.unit_of_measurement
      ? stateObj.attributes.unit_of_measurement : 'unknown unit';
  };

  _defineUnit(hass, view, solar_entity, grid_consumption_entity, grid_production_entity, moneyUnit) {
    const solarUnit = this._getEntityUnit(hass.states[solar_entity]);
    const gridConsumptionUnit = this._getEntityUnit(hass.states[grid_consumption_entity]);
    const gridProductionUnit = this._getEntityUnit(hass.states[grid_production_entity]);
    return solarUnit === gridConsumptionUnit && gridConsumptionUnit === gridProductionUnit
      ? (view === 'money' ? moneyUnit : solarUnit) : 'units not equal';
  };

  _render({ hass, config }) {
    let data = {
      solar: {},
      solar2grid: {},
      solar2home: {},
      grid: {},
      grid2home: {},
      home: {},
    };
    let unit = '';

    if (config.view === 'money' && this.money_capable) {
      data.solar.val = config.energy_price * this._calculateSolarValue(hass, config.solar_energy_entity);
      data.grid2home.val = config.energy_price * this._calculateGrid2HomeValue(hass, config.grid_energy_consumption_entity);
      data.solar2grid.val = config.energy_price * this._calculateSolar2GridValue(hass, config.grid_energy_production_entity);
      data.grid.val = this._calculateGridValue(data);
      data.home.val = this._calculateHomeValue(data);
      data.solar2home.val = this._calculateSolar2HomeValue(data);
      unit = this._defineUnit(hass, config.view, config.solar_energy_entity,
        config.grid_energy_consumption_entity, config.grid_energy_production_entity, this.money_unit);
      data.solar = this._makePositionObject(hass, data.solar.val, config.solar_energy_entity, config.solar_icon,
        'mdi:weather-sunny', this.money_decimals, true);
      data.grid = this._makePositionObject(hass, data.grid.val, config.grid_energy_entity, config.grid_icon,
        'mdi:flash-circle', this.money_decimals, false);
      data.home = this._makePositionObject(hass, data.home.val, config.home_energy_entity, config.home_icon,
        'mdi:home', this.money_decimals, false);
      data.solar2grid = this._makeArrowObject(data.solar2grid.val, 'mdi:arrow-bottom-left', this.money_decimals);
      data.solar2home = this._makeArrowObject(data.solar2home.val, 'mdi:arrow-bottom-right', this.money_decimals);
      data.grid2home = this._makeArrowObject(data.grid2home.val, 'mdi:arrow-right', this.money_decimals);
    } else if (config.view === 'energy' && this.energy_capable) {
      data.solar.val = this._calculateSolarValue(hass, config.solar_energy_entity);
      data.grid2home.val = this._calculateGrid2HomeValue(hass, config.grid_energy_consumption_entity);
      data.solar2grid.val = this._calculateSolar2GridValue(hass, config.grid_energy_production_entity);
      data.grid.val = this._calculateGridValue(data);
      data.home.val = this._calculateHomeValue(data);
      data.solar2home.val = this._calculateSolar2HomeValue(data);
      unit = this._defineUnit(hass, config.view, config.solar_energy_entity,
        config.grid_energy_consumption_entity, config.grid_energy_production_entity, this.money_unit);
      data.solar = this._makePositionObject(hass, data.solar.val, config.solar_energy_entity, config.solar_icon,
          'mdi:weather-sunny', this.energy_decimals, true);
      data.grid = this._makePositionObject(hass, data.grid.val, config.grid_energy_entity, config.grid_icon,
          'mdi:flash-circle', this.energy_decimals, false);
      data.home = this._makePositionObject(hass, data.home.val, config.home_energy_entity, config.home_icon,
          'mdi:home', this.energy_decimals, false);
      data.solar2grid = this._makeArrowObject(data.solar2grid.val, 'mdi:arrow-bottom-left', this.energy_decimals);
      data.solar2home = this._makeArrowObject(data.solar2home.val, 'mdi:arrow-bottom-right', this.energy_decimals);
      data.grid2home = this._makeArrowObject(data.grid2home.val, 'mdi:arrow-right', this.energy_decimals);
    } else {
      data.solar.val = this._calculateSolarValue(hass, config.solar_power_entity);
      data.grid2home.val = this._calculateGrid2HomeValue(hass, config.grid_power_consumption_entity);
      data.solar2grid.val = this._calculateSolar2GridValue(hass, config.grid_power_production_entity);
      data.grid.val = this._calculateGridValue(data);
      data.home.val = this._calculateHomeValue(data);
      data.solar2home.val = this._calculateSolar2HomeValue(data);
      unit = this._defineUnit(hass, config.view, config.solar_power_entity,
        config.grid_power_consumption_entity, config.grid_power_production_entity, this.money_unit);
      data.solar = this._makePositionObject(hass, data.solar.val, config.solar_power_entity, config.solar_icon,
          'mdi:weather-sunny', this.power_decimals, true);
      data.grid = this._makePositionObject(hass, data.grid.val, config.grid_power_entity, config.grid_icon,
          'mdi:flash-circle', this.power_decimals, false);
      data.home = this._makePositionObject(hass, data.home.val, config.home_power_entity, config.home_icon,
          'mdi:home', this.power_decimals, false);
      data.solar2grid = this._makeArrowObject(data.solar2grid.val, 'mdi:arrow-bottom-left', this.power_decimals);
      data.solar2home = this._makeArrowObject(data.solar2home.val, 'mdi:arrow-bottom-right', this.power_decimals);
      data.grid2home = this._makeArrowObject(data.grid2home.val, 'mdi:arrow-right', this.power_decimals);
    }

    return html`
      <style>
        ha-card {
          padding: 16px;
        }
        ha-card .header {
          font-family: var(--paper-font-headline_-_font-family);
          -webkit-font-smoothing: var(--paper-font-headline_-_-webkit-font-smoothing);
          font-size: var(--paper-font-headline_-_font-size);
          font-weight: var(--paper-font-headline_-_font-weight);
          letter-spacing: var(--paper-font-headline_-_letter-spacing);
          line-height: var(--paper-font-headline_-_line-height);
          color: var(--primary-text-color);
          padding: 4px 0 12px;
          display: flex;
          justify-content: space-between;
        }
        ha-card .wheel {
          position: relative;
        }
        ha-card .row {
          display: flex;
          justify-content: center;
          padding: 8px;
          align-items: center;
          height: 60px;
        }
        ha-card .cell {
          text-align: center;
          width: 150px;
        }
        ha-card .cell.position {
          cursor: pointer;
          font-weight: bold;
        }
        ha-card .cell.arrow {
          color: var(--state-icon-unavailable-color, #bdbdbd);
        }
        .unit-container {
          position: absolute;
          display: table;
          width: 100%;
          height: 230px;
        }
        .unit {
          display: table-cell;
          text-align: center;
          vertical-align: middle;
          font-size: calc(1.5 * var(--paper-font-headline_-_font-size));
          font-weight: bold;
        }
        .unit.toggle {
          cursor: pointer;
        }
        ha-icon {
          transition: color 0.5s ease-in-out, filter 0.3s ease-in-out;
          color: var(--paper-item-icon-color, #44739e);
          width: 48px;
          height: 48px;
        }
        ha-icon.active {
          color: var(--paper-item-icon-active-color, #fdd835);
        }
        ha-icon.inactive {
          color: var(--state-icon-unavailable-color, #bdbdbd);
        }
        ha-icon.consuming {
          color: ${this.consumingColor};
        }
        ha-icon.producing {
          color: ${this.producingColor};
        }
        ha-icon#toggle-button {
          padding-top: 4px;
          width: 24px;
          height: 24px;
          float: right;
          cursor: pointer;
        }
      </style>
      <ha-card>
        ${this.energy_capable ? html`<ha-icon id="toggle-button" icon="mdi:recyclexxx" on-click="${e => this._toggleView(e, config)}" title="Toggle view"></ha-icon>` : ''}        
        <div class="header">
          ${this.title}
        </div>
        <div class="wheel">
          <div class="unit-container">
            ${this.energy_capable ? html`<div class="unit toggle" on-click="${e => this._toggleView(e, config)}" title="Toggle view">${unit}</div>` : html`<div class="unit">${unit}</div>`}
          </div>
          <div class="row">
            ${this._positionCell(data.solar)}
          </div>
          <div class="row">
            ${this._arrowCell(data.solar2grid)}
            ${this._arrowCell(data.solar2home)}
          </div>
          <div class="row">
            ${this._positionCell(data.grid)}
            ${this._arrowCell(data.grid2home)}
            ${this._positionCell(data.home)}
          </div>
        </div>
      </ha-card>
    `;
  }

  _positionCell(positionObj) {
    return html`
      <div class="cell position" on-click="${e => this._handleClick(e, positionObj.stateObj)}">
        <ha-icon class$="${positionObj.classValue}" icon="${positionObj.icon}"></ha-icon>
        <br/>${positionObj.stateStr}&nbsp;
      </div>
    `;
  };

  _arrowCell(arrowObj) {
    return html`
      <div class="cell arrow">
        <ha-icon class$="${arrowObj.classValue}" icon="${arrowObj.icon}"></ha-icon>
        <div>&nbsp;${arrowObj.valueStr}&nbsp;</div>
      </div>
    `;
  };

  _handleClick(ev, stateObj) {
    if (!stateObj) {
      return;
    }
    const event = new Event('hass-more-info', {
      bubbles: true,
      cancelable: true,
      composed: true,
    });
    event.detail = { entityId: stateObj.entity_id };
    this.shadowRoot.dispatchEvent(event);
  }

  _toggleView(ev, config) {
    switch (config.view) {
      case 'power':
        config.view = 'energy';
        break;
      case 'energy':
        if (this.money_capable) {
          config.view = 'money';
        } else {
          config.view = 'power';
        }
        break;
      case 'money':
        config.view = 'power';
        break;
      default:
        config.view = 'power';
    }
  }

  setConfig(config) {
    if (!config.solar_power_entity) {
      throw new Error('You need to define a solar_power_entity');
    }
    if (!config.grid_power_consumption_entity) {
      throw new Error('You need to define a grid_power_consumption_entity');
    }
    if (!config.grid_power_production_entity) {
      throw new Error('You need to define a grid_power_production_entity');
    }
    this.title = config.title ? config.title : 'Power wheel';
    if (config.power_decimals && !Number.isInteger(config.power_decimals)) {
      throw new Error('Power_decimals should be an integer');
    }
    this.power_decimals = config.power_decimals ? config.power_decimals : 0;
    if (config.energy_decimals && !Number.isInteger(config.energy_decimals)) {
      throw new Error('Energy_decimals should be an integer');
    }
    this.energy_decimals = config.energy_decimals ? config.energy_decimals : 3;
    if (config.money_decimals && !Number.isInteger(config.money_decimals)) {
      throw new Error('Money_decimals should be an integer');
    }
    this.money_decimals = config.money_decimals ? config.money_decimals : 2;
    this.money_unit = config.money_unit ? config.money_unit : '€';
    this.colorIcons = config.color_icons ? (config.color_icons == true) : false;
    this.consumingColor = this.colorIcons
      ? (config.consuming_color ? config.consuming_color : 'var(--label-badge-yellow, #f4b400)')
      : 'var(--state-icon-unavailable-color, #bdbdbd)';
    this.producingColor = this.colorIcons
      ? (config.producing_color ? config.producing_color : 'var(--label-badge-green, #0da035)')
      : 'var(--state-icon-unavailable-color, #bdbdbd)';
    if (config.initial_view && !['power', 'energy', 'money'].includes(config.initial_view)) {
      throw new Error("Initial_view should 'power', 'energy' or 'money'");
    }
    if (!config.view) {
      config.view = config.initial_view ? config.initial_view : 'power';
    }
    this.energy_capable = config.solar_energy_entity && config.grid_energy_consumption_entity
      && config.grid_energy_production_entity;
    this.money_capable = this.energy_capable && config.energy_price;
    this.config = config;
  }

  getCardSize() {
    return 5;
  }
}

customElements.define('power-wheel-card', PowerWheelCard);