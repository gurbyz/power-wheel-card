/**
 *
 * power-wheel-card version 0.0.8
 *
 */

const LitElement = Object.getPrototypeOf(customElements.get("hui-error-entity-row"));
const html = LitElement.prototype.html;

class PowerWheelCard extends LitElement {
  static get properties() {
    return {
      hass: Object,
      config: Object,
      data: { type: Object },
      style: { type: String },
      unit: { type: String },
      view: { type: String },
    }
  };

  _generateClass(producingIsPositive, value) {
    if (producingIsPositive) {
      return value > 0 ? 'producing' : ((value < 0) ? 'consuming' : 'inactive');
    } else {
      return value > 0 ? 'consuming' : ((value < 0) ? 'producing' : 'inactive');
    }
  };

  _makePositionObject(val, entity, configIcon, defaultIcon, decimals, producingIsPositive) {
    const valueStr = typeof val === 'undefined' ? 'unavailable' : val.toFixed(decimals);
    const stateObj = this.hass.states[entity];
    const icon = configIcon ? configIcon : (stateObj && stateObj.attributes.icon ? stateObj.attributes.icon : defaultIcon);
    const classValue = this._generateClass(producingIsPositive, val);

    return {
      stateObj,
      valueStr,
      val,
      icon,
      classValue,
      hasSensor: !!stateObj && this.view !== 'money',
    };
  };

  _makeArrowObject(val, entity, icon, decimals) {
    const valueStr = typeof val === 'undefined' ? 'unavailable' : val.toFixed(decimals);
    const stateObj = entity ? this.hass.states[entity] : false;
    const classValue = typeof val !== 'undefined' && val > 0 ? 'active' : 'inactive';

    return {
      stateObj,
      valueStr,
      val,
      icon,
      classValue,
      hasSensor: !!stateObj,
    }
  };

  _calculateSolarValue(solar_entity) {
    const solarStateObj = this.hass.states[solar_entity];
    return solarStateObj ? parseFloat(solarStateObj.state) : undefined;
  };

  _calculateGrid2HomeValue(grid_consumption_entity) {
    const gridConsumptionStateObj = this.hass.states[grid_consumption_entity];
    return gridConsumptionStateObj ? parseFloat(gridConsumptionStateObj.state) : undefined;
  };

  _calculateSolar2GridValue(grid_production_entity) {
    const gridProductionStateObj = this.hass.states[grid_production_entity];
    return gridProductionStateObj ? parseFloat(gridProductionStateObj.state) : undefined;
  };

  _calculateGridValue() {
    return typeof this.data.grid2home.val !== 'undefined' && typeof this.data.solar2grid.val !== 'undefined'
      ? this.data.grid2home.val - this.data.solar2grid.val : undefined;
  };

  _calculateHomeValue() {
    return typeof this.data.solar.val !== 'undefined' && typeof this.data.grid.val !== 'undefined'
      ? this.data.solar.val + this.data.grid.val : undefined;
  };

  _calculateSolar2HomeValue() {
    return typeof this.data.solar.val !== 'undefined' && typeof this.data.solar2grid.val !== 'undefined'
      ? this.data.solar.val - this.data.solar2grid.val : undefined;
  };

  _getEntityUnit(stateObj) {
    return stateObj && stateObj.attributes.unit_of_measurement
      ? stateObj.attributes.unit_of_measurement : 'unknown unit';
  };

  _defineUnit(solar_entity, grid_consumption_entity, grid_production_entity) {
    const solarUnit = this._getEntityUnit(this.hass.states[solar_entity]);
    const gridConsumptionUnit = this._getEntityUnit(this.hass.states[grid_consumption_entity]);
    const gridProductionUnit = this._getEntityUnit(this.hass.states[grid_production_entity]);
    return solarUnit === gridConsumptionUnit && gridConsumptionUnit === gridProductionUnit
      ? (this.view === 'money' ? this.config.money_unit : solarUnit) : 'units not equal';
  };

  constructor() {
    super();
    this.data = {
      solar: {},
      solar2grid: {},
      solar2home: {},
      grid: {},
      grid2home: {},
      home: {},
    };
    this.style = `
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
        font-weight: bold;
      }
      ha-card .cell.arrow {
        color: var(--state-icon-unavailable-color, #bdbdbd);
      }
      ha-card .cell.sensor {
        cursor: pointer;
      }
      .value {
          min-height: 16px;
        }
      .unit-container {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 230px;
      }
      .unit {
        padding: 3px 10px;
        font-size: calc(1.5 * var(--paper-font-headline_-_font-size));
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
      ha-icon#toggle-button {
        padding-top: 4px;
        width: 24px;
        height: 24px;
        float: right;
        cursor: pointer;
      }
    `;
  };

  render() {
    if (this.view === 'money' && this.config.money_capable) {
      this.data.solar.val = this.config.energy_price * this._calculateSolarValue(this.config.solar_energy_entity);
      this.data.grid2home.val = this.config.energy_price * this._calculateGrid2HomeValue(this.config.grid_energy_consumption_entity);
      this.data.solar2grid.val = this.config.energy_price * this._calculateSolar2GridValue(this.config.grid_energy_production_entity);
      this.data.grid.val = this._calculateGridValue();
      this.data.home.val = this._calculateHomeValue();
      this.data.solar2home.val = this._calculateSolar2HomeValue();
      this.unit = this._defineUnit(this.config.solar_energy_entity,
        this.config.grid_energy_consumption_entity, this.config.grid_energy_production_entity);
      this.data.solar = this._makePositionObject(this.data.solar.val, this.config.solar_energy_entity, this.config.solar_icon,
        'mdi:weather-sunny', this.config.money_decimals, true);
      this.data.grid = this._makePositionObject(this.data.grid.val, this.config.grid_energy_entity, this.config.grid_icon,
        'mdi:flash-circle', this.config.money_decimals, false);
      this.data.home = this._makePositionObject(this.data.home.val, this.config.home_energy_entity, this.config.home_icon,
        'mdi:home', this.config.money_decimals, false);
      this.data.solar2grid = this._makeArrowObject(this.data.solar2grid.val, false, 'mdi:arrow-bottom-left', this.config.money_decimals);
      this.data.solar2home = this._makeArrowObject(this.data.solar2home.val, false, 'mdi:arrow-bottom-right', this.config.money_decimals);
      this.data.grid2home = this._makeArrowObject(this.data.grid2home.val, false, 'mdi:arrow-right', this.config.money_decimals);
    } else if (this.view === 'energy' && this.config.energy_capable) {
      this.data.solar.val = this._calculateSolarValue(this.config.solar_energy_entity);
      this.data.grid2home.val = this._calculateGrid2HomeValue(this.config.grid_energy_consumption_entity);
      this.data.solar2grid.val = this._calculateSolar2GridValue(this.config.grid_energy_production_entity);
      this.data.grid.val = this._calculateGridValue();
      this.data.home.val = this._calculateHomeValue();
      this.data.solar2home.val = this._calculateSolar2HomeValue();
      this.unit = this._defineUnit(this.config.solar_energy_entity,
        this.config.grid_energy_consumption_entity, this.config.grid_energy_production_entity);
      this.data.solar = this._makePositionObject(this.data.solar.val, this.config.solar_energy_entity, this.config.solar_icon,
          'mdi:weather-sunny', this.config.energy_decimals, true);
      this.data.grid = this._makePositionObject(this.data.grid.val, this.config.grid_energy_entity, this.config.grid_icon,
          'mdi:flash-circle', this.config.energy_decimals, false);
      this.data.home = this._makePositionObject(this.data.home.val, this.config.home_energy_entity, this.config.home_icon,
          'mdi:home', this.config.energy_decimals, false);
      this.data.solar2grid = this._makeArrowObject(this.data.solar2grid.val, this.config.grid_energy_production_entity, 'mdi:arrow-bottom-left', this.config.energy_decimals);
      this.data.solar2home = this._makeArrowObject(this.data.solar2home.val, false, 'mdi:arrow-bottom-right', this.config.energy_decimals);
      this.data.grid2home = this._makeArrowObject(this.data.grid2home.val, this.config.grid_energy_consumption_entity, 'mdi:arrow-right', this.config.energy_decimals);
    } else {
      this.data.solar.val = this._calculateSolarValue(this.config.solar_power_entity);
      this.data.grid2home.val = this._calculateGrid2HomeValue(this.config.grid_power_consumption_entity);
      this.data.solar2grid.val = this._calculateSolar2GridValue(this.config.grid_power_production_entity);
      this.data.grid.val = this._calculateGridValue();
      this.data.home.val = this._calculateHomeValue();
      this.data.solar2home.val = this._calculateSolar2HomeValue();
      this.unit = this._defineUnit(this.config.solar_power_entity,
        this.config.grid_power_consumption_entity, this.config.grid_power_production_entity);
      this.data.solar = this._makePositionObject(this.data.solar.val, this.config.solar_power_entity, this.config.solar_icon,
          'mdi:weather-sunny', this.config.power_decimals, true);
      this.data.grid = this._makePositionObject(this.data.grid.val, this.config.grid_power_entity, this.config.grid_icon,
          'mdi:flash-circle', this.config.power_decimals, false);
      this.data.home = this._makePositionObject(this.data.home.val, this.config.home_power_entity, this.config.home_icon,
          'mdi:home', this.config.power_decimals, false);
      this.data.solar2grid = this._makeArrowObject(this.data.solar2grid.val, this.config.grid_power_production_entity, 'mdi:arrow-bottom-left', this.config.power_decimals);
      this.data.solar2home = this._makeArrowObject(this.data.solar2home.val, false, 'mdi:arrow-bottom-right', this.config.power_decimals);
      this.data.grid2home = this._makeArrowObject(this.data.grid2home.val, this.config.grid_power_consumption_entity, 'mdi:arrow-right', this.config.power_decimals);
    }

    // todo: [Feature] Auto toggle view
    // setTimeout(() => {
    //   this._toggleView();
    // }, 5000);

    return html`
      <style>
        ${this.style}
        ha-icon.consuming {
          color: ${this.config.consuming_color};
        }
        ha-icon.producing {
          color: ${this.config.producing_color};
        }
      </style>
      <ha-card>
        ${this.config.energy_capable ? html`<ha-icon id="toggle-button" icon="mdi:recyclexxx" @click="${() => this._toggleView()}" title="Toggle view"></ha-icon>` : ''}        
        <div class="header">
          ${this.config.title}
        </div>
        <div class="wheel">
          <div class="unit-container">
            ${this.config.energy_capable ? html`<div class="unit toggle" @click="${() => this._toggleView()}" title="Toggle view">${this.unit}</div>` : html`<div class="unit">${this.unit}</div>`}
          </div>
          <div class="row">
            ${this._cell(this.data.solar, 'position', 0)}
          </div>
          <div class="row">
            ${this._cell(this.data.solar2grid, 'arrow', this.data.solar.val)}
            ${this._cell(this.data.solar2home, 'arrow', this.data.solar.val)}
          </div>
          <div class="row">
            ${this._cell(this.data.grid, 'position', 0)}
            ${this._cell(this.data.grid2home, 'arrow', this.data.grid.val)}
            ${this._cell(this.data.home, 'position', 0)}
          </div>
        </div>
      </ha-card>
    `;
  }

  _cell(cellObj, cellType, hideValue) {
    return html`
      <div class="cell ${cellType} ${cellObj.hasSensor ? 'sensor' : ''}" 
            @click="${cellObj.hasSensor ? () => this._handleClick(cellObj.stateObj) : () => {}}"
            title="${cellObj.hasSensor ? `More info${cellObj.stateObj.attributes.friendly_name ? ':\n' + cellObj.stateObj.attributes.friendly_name : ''}` : ''}">
        <ha-icon class="${cellObj.classValue}" icon="${cellObj.icon}"></ha-icon>
        <div class="value">${cellObj.val === 0 || cellObj.val === hideValue ? '' : cellObj.valueStr}</div>
      </div>
    `;
  };

  _handleClick(stateObj) {
    const event = new Event('hass-more-info', {
      bubbles: true,
      cancelable: true,
      composed: true,
    });
    event.detail = { entityId: stateObj.entity_id };
    this.shadowRoot.dispatchEvent(event);
  }

  _toggleView() {
    switch (this.view) {
      case 'power':
        this.view = 'energy';
        break;
      case 'energy':
        if (this.config.money_capable) {
          this.view = 'money';
        } else {
          this.view = 'power';
        }
        break;
      case 'money':
        this.view = 'power';
        break;
      default:
        this.view = 'power';
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
    config.title = config.title ? config.title : 'Power wheel';
    if (config.power_decimals && !Number.isInteger(config.power_decimals)) {
      throw new Error('Power_decimals should be an integer');
    }
    config.power_decimals = config.power_decimals ? config.power_decimals : 0;
    if (config.energy_decimals && !Number.isInteger(config.energy_decimals)) {
      throw new Error('Energy_decimals should be an integer');
    }
    config.energy_decimals = config.energy_decimals ? config.energy_decimals : 3;
    if (config.money_decimals && !Number.isInteger(config.money_decimals)) {
      throw new Error('Money_decimals should be an integer');
    }
    config.money_decimals = config.money_decimals ? config.money_decimals : 2;
    config.money_unit = config.money_unit ? config.money_unit : '€';
    config.color_icons = config.color_icons ? (config.color_icons == true) : false;
    config.consuming_color = config.color_icons
      ? (config.consuming_color ? config.consuming_color : 'var(--label-badge-yellow, #f4b400)')
      : 'var(--state-icon-unavailable-color, #bdbdbd)';
    config.producing_color = config.color_icons
      ? (config.producing_color ? config.producing_color : 'var(--label-badge-green, #0da035)')
      : 'var(--state-icon-unavailable-color, #bdbdbd)';
    if (config.initial_view && !['power', 'energy', 'money'].includes(config.initial_view)) {
      throw new Error("Initial_view should 'power', 'energy' or 'money'");
    }
    config.energy_capable = config.solar_energy_entity && config.grid_energy_consumption_entity
      && config.grid_energy_production_entity;
    config.money_capable = config.energy_capable && config.energy_price;
    config.initial_view = config.initial_view ? config.initial_view : 'power';
    this.view = config.initial_view;
    this.config = config;
  }

  getCardSize() {
    return 5;
  }
}

customElements.define('power-wheel-card', PowerWheelCard);