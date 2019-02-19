/**
 *
 * power-wheel-card by Gerben ten Hove
 * https://github.com/gurbyz/custom-cards-lovelace/tree/master/power-wheel-card
 *
 */

const __VERSION = "0.0.10";

const LitElement = Object.getPrototypeOf(customElements.get("home-assistant-main"));
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

class PowerWheelCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      autoToggleView: { type: Boolean },
      autoToggleViewTimerId: { type: Number },
      data: { type: Object },
      energy_capable: { type: Boolean },
      money_capable: { type: Boolean },
      messages: { type: Array },
      sensors: { type: Array },
      titles: { type: Object },
      units: { type: Object },
      view: { type: String },
    }
  }

  static get styles() {
    return [css`
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
      #unit {
        padding: 3px 10px;
        font-size: calc(1.5 * var(--paper-font-headline_-_font-size));
      }
      #unit.toggle {
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
      .message {
        display: block;
        color: white;
        padding: 8px;
        font-weight: 500;
        margin-bottom: 3px;
      }
      .message.error {
        background-color: #ef5350;
      }
      .message.warn {
        background-color: #fdd835;
      }
    `];
  }
  
  /* Card functions */

  _generateClass(producingIsPositive, value) {
    if (producingIsPositive) {
      return value > 0 ? 'producing' : ((value < 0) ? 'consuming' : 'inactive');
    } else {
      return value > 0 ? 'consuming' : ((value < 0) ? 'producing' : 'inactive');
    }
  }

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
    }
  }

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
  }

  _calculateSolarValue(solar_entity) {
    const solarStateObj = this.hass.states[solar_entity];
    return solarStateObj ? parseFloat(solarStateObj.state) : undefined;
  }

  _calculateGrid2HomeValue(grid_consumption_entity) {
    const gridConsumptionStateObj = this.hass.states[grid_consumption_entity];
    return gridConsumptionStateObj ? parseFloat(gridConsumptionStateObj.state) : undefined;
  }

  _calculateSolar2GridValue(grid_production_entity) {
    const gridProductionStateObj = this.hass.states[grid_production_entity];
    return gridProductionStateObj ? parseFloat(gridProductionStateObj.state) : undefined;
  }

  _calculateGridValue() {
    return typeof this.data.grid2home.val !== 'undefined' && typeof this.data.solar2grid.val !== 'undefined'
      ? this.data.grid2home.val - this.data.solar2grid.val : undefined;
  }

  _calculateHomeValue() {
    return typeof this.data.solar.val !== 'undefined' && typeof this.data.grid.val !== 'undefined'
      ? this.data.solar.val + this.data.grid.val : undefined;
  }

  _calculateSolar2HomeValue() {
    return typeof this.data.solar.val !== 'undefined' && typeof this.data.solar2grid.val !== 'undefined'
      ? this.data.solar.val - this.data.solar2grid.val : undefined;
  }

  _logConsole(message) {
    if (this.config.debug) {
      console.info(`%cpower-wheel-card%c\n${message}`, "color: green; font-weight: bold", "");
    }
  }

  /* Lit functions */

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
    this.messages = [];
    this.sensors = [];
    this.titles = {};
    this.units = {};
  }

  _lovelaceResource() {
    const scripts = document.getElementsByTagName("script");
    let src = '404';
    Object.keys(scripts).some((key) => {
      let pos = scripts[key].src.indexOf("power-wheel-card.js");
      if (pos !== -1) {
        src = scripts[key].src.substr(pos);
        return true;
      } else {
        return false;
      }
    });
    return src;
  }

  _addMessage(type, text) {
    this.messages = [ ...this.messages, { type: type, text: text } ];
    console[type](text);
  }

  _validateSensors() {
    this.sensors.forEach(sensor => {
      if (!this.hass.states[sensor]) {
        this._addMessage('error', `Entity "${sensor}" not found in HA.`);
      }
    });
  }

  _getSensorUnit(entity) {
    const stateObj = this.hass.states[entity];
    const unit = stateObj && stateObj.attributes.unit_of_measurement
      ? stateObj.attributes.unit_of_measurement : undefined;
    if (stateObj && !unit) {
      this._addMessage('error', `Attribute "unit_of_measurement" for the entity "${entity}" not found in HA.`);
    }
    return unit;
  }

  _defineUnit(viewName, solar_entity, grid_consumption_entity, grid_production_entity) {
    const solarUnit = this._getSensorUnit(solar_entity);
    const gridConsumptionUnit = this._getSensorUnit(grid_consumption_entity);
    const gridProductionUnit = this._getSensorUnit(grid_production_entity);
    if (solarUnit === gridConsumptionUnit && gridConsumptionUnit === gridProductionUnit) {
      return solarUnit;
    } else {
      this._addMessage('error', `Units not equal for all sensors for the ${viewName} view.`);
      return 'error';
    }
  }

  _defineUnits() {
    return {
      power: this._defineUnit('Power', this.config.solar_power_entity,
        this.config.grid_power_consumption_entity, this.config.grid_power_production_entity),
      energy: this._defineUnit('Energy', this.config.solar_energy_entity,
        this.config.grid_energy_consumption_entity, this.config.grid_energy_production_entity),
      money: this.config.money_unit,
    }
  }

  firstUpdated() {
    if (this.config.debug) {
      let line = `Version: ${__VERSION}\nLovelace resource: ${this._lovelaceResource()}\nHA version: ${this.hass.config.version}`;
      line += `\nReport issues here: https://github.com/gurbyz/custom-cards-lovelace/issues`;
      line += `\nProcessed config: ${JSON.stringify(this.config, '', ' ')}\nRegistered sensors: ${JSON.stringify(this.sensors, '', ' ')}`;
      this._logConsole(line);
      this._addMessage('warn', 'Debug mode is on.');
    }
    this._validateSensors();
    this.units = this._defineUnits();
  }

  _sensorChangeDetected(oldValue) {
    return this.sensors.reduce((change, sensor) => {
      return change || this.hass.states[sensor].state !== oldValue.states[sensor].state;
    }, false);
  }

  shouldUpdate(changedProperties) {
    // Don't update when there is a new value for a hass property that's not a registered sensor.
    // Update in all other cases, e.g. when there is a change of config or old values are undefined.
    let update = true;
    [ ...changedProperties.keys() ].some((propName) => {
      const oldValue = changedProperties.get(propName);
      if (propName === "hass" && oldValue) {
        update = update && this._sensorChangeDetected(oldValue);
      }
      return !update;
    });
    return update;
  }

  render() {
    if (this.view === 'money' && this.money_capable) {
      this.data.solar.val = this.config.energy_price * this._calculateSolarValue(this.config.solar_energy_entity);
      this.data.grid2home.val = this.config.energy_price * this._calculateGrid2HomeValue(this.config.grid_energy_consumption_entity);
      this.data.solar2grid.val = this.config.energy_price * this._calculateSolar2GridValue(this.config.grid_energy_production_entity);
      this.data.grid.val = this._calculateGridValue();
      this.data.home.val = this._calculateHomeValue();
      this.data.solar2home.val = this._calculateSolar2HomeValue();
      this.data.solar = this._makePositionObject(this.data.solar.val, this.config.solar_energy_entity, this.config.solar_icon,
        'mdi:weather-sunny', this.config.money_decimals, true);
      this.data.grid = this._makePositionObject(this.data.grid.val, this.config.grid_energy_entity, this.config.grid_icon,
        'mdi:transmission-tower', this.config.money_decimals, false);
      this.data.home = this._makePositionObject(this.data.home.val, this.config.home_energy_entity, this.config.home_icon,
        'mdi:home', this.config.money_decimals, false);
      this.data.solar2grid = this._makeArrowObject(this.data.solar2grid.val, false, 'mdi:arrow-bottom-left', this.config.money_decimals);
      this.data.solar2home = this._makeArrowObject(this.data.solar2home.val, false, 'mdi:arrow-bottom-right', this.config.money_decimals);
      this.data.grid2home = this._makeArrowObject(this.data.grid2home.val, false, 'mdi:arrow-right', this.config.money_decimals);
    } else if (this.view === 'energy' && this.energy_capable) {
      this.data.solar.val = this._calculateSolarValue(this.config.solar_energy_entity);
      this.data.grid2home.val = this._calculateGrid2HomeValue(this.config.grid_energy_consumption_entity);
      this.data.solar2grid.val = this._calculateSolar2GridValue(this.config.grid_energy_production_entity);
      this.data.grid.val = this._calculateGridValue();
      this.data.home.val = this._calculateHomeValue();
      this.data.solar2home.val = this._calculateSolar2HomeValue();
      this.data.solar = this._makePositionObject(this.data.solar.val, this.config.solar_energy_entity, this.config.solar_icon,
          'mdi:weather-sunny', this.config.energy_decimals, true);
      this.data.grid = this._makePositionObject(this.data.grid.val, this.config.grid_energy_entity, this.config.grid_icon,
          'mdi:transmission-tower', this.config.energy_decimals, false);
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
      this.data.solar = this._makePositionObject(this.data.solar.val, this.config.solar_power_entity, this.config.solar_icon,
          'mdi:weather-sunny', this.config.power_decimals, true);
      this.data.grid = this._makePositionObject(this.data.grid.val, this.config.grid_power_entity, this.config.grid_icon,
          'mdi:transmission-tower', this.config.power_decimals, false);
      this.data.home = this._makePositionObject(this.data.home.val, this.config.home_power_entity, this.config.home_icon,
          'mdi:home', this.config.power_decimals, false);
      this.data.solar2grid = this._makeArrowObject(this.data.solar2grid.val, this.config.grid_power_production_entity, 'mdi:arrow-bottom-left', this.config.power_decimals);
      this.data.solar2home = this._makeArrowObject(this.data.solar2home.val, false, 'mdi:arrow-bottom-right', this.config.power_decimals);
      this.data.grid2home = this._makeArrowObject(this.data.grid2home.val, this.config.grid_power_consumption_entity, 'mdi:arrow-right', this.config.power_decimals);
    }

    if (this.autoToggleView) {
      this.autoToggleViewTimerId = this.autoToggleViewTimerId || setInterval(() => {
        this._toggleViewHelper();
      }, this.config.auto_toggle_view_period * 1000);
    } else if (this.autoToggleViewTimerId) {
      this.autoToggleViewTimerId = clearInterval(this.autoToggleViewTimerId);
    }

    return html`
      <style>
        ha-icon.consuming {
          color: ${this.config.consuming_color};
        }
        ha-icon.producing {
          color: ${this.config.producing_color};
        }
      </style>
      <ha-card>
        ${this.messages.length ? this.messages.map((message) => { return html`<div class="message ${message.type}">${message.text}</div>`}) : ''}
        ${this.energy_capable ? html`<ha-icon id="toggle-button" class="${this.autoToggleView ? `active` : `inactive`}" icon="mdi:recycle" @click="${() => this._toggleAutoToggleView()}" title="Turn ${this.autoToggleView ? `off` : `on`} auto-toggle"></ha-icon>` : ''}        
        <div id="title" class="header">
          ${this.titles[this.view]}
        </div>
        <div class="wheel">
          <div class="unit-container">
            ${this.energy_capable ? html`<div id="unit" class="toggle" @click="${() => this._toggleView()}" title="Toggle view">${this.units[this.view]}</div>` : html`<div id="unit">${this.units[this.view]}</div>`}
          </div>
          <div class="row">
            ${this._cell('solar', this.data.solar, 'position')}
          </div>
          <div class="row">
            ${this._cell('solar2grid', this.data.solar2grid, 'arrow', this.data.solar.val)}
            ${this._cell('solar2home', this.data.solar2home, 'arrow', this.data.solar.val)}
          </div>
          <div class="row">
            ${this._cell('grid', this.data.grid, 'position')}
            ${this._cell('grid2home', this.data.grid2home, 'arrow', this.data.grid.val)}
            ${this._cell('home', this.data.home, 'position')}
          </div>
        </div>
      </ha-card>
    `;
  }
  
  /* Template functions */

  _cell(id, cellObj, cellType, hideValue) {
    return html`
      <div id="cell-${id}"
            class="cell ${cellType} ${cellObj.hasSensor ? 'sensor' : ''}" 
            @click="${cellObj.hasSensor ? () => this._handleClick(cellObj.stateObj) : () => {}}"
            title="${cellObj.hasSensor ? `More info${cellObj.stateObj.attributes.friendly_name ? ':\n' + cellObj.stateObj.attributes.friendly_name : ''}` : ''}">
        <ha-icon id="icon-${id}" class="${cellObj.classValue}" icon="${cellObj.icon}"></ha-icon>
        <div id="value-${id}" class="value">${cellType === 'arrow' && (cellObj.val === 0 || cellObj.val === hideValue) ? '' : cellObj.valueStr}</div>
      </div>
    `;
  }

  _handleClick(stateObj) {
    const event = new Event('hass-more-info', {
      bubbles: true,
      cancelable: true,
      composed: true,
    });
    event.detail = { entityId: stateObj.entity_id };
    this.shadowRoot.dispatchEvent(event);
  }

  _toggleAutoToggleView() {
    if (!this.autoToggleView) {
      this._toggleViewHelper();
    }
    this.autoToggleView = !this.autoToggleView;
  }

  _toggleView() {
    this.autoToggleView = false;
    this._toggleViewHelper();
  }

  _toggleViewHelper() {
    switch (this.view) {
      case 'power':
        this.view = 'energy';
        break;
      case 'energy':
        if (this.money_capable) {
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
  
  /* Config functions */

  _getSensors(config) {
    return [
      "solar_power_entity",
      "grid_power_consumption_entity",
      "grid_power_production_entity",
      "solar_energy_entity",
      "grid_energy_consumption_entity",
      "grid_energy_production_entity",
    ].reduce((sensors, cardParameter) => {
      if (config.hasOwnProperty(cardParameter)) {
        sensors.push(config[cardParameter]);
      }
      return sensors;
    }, []);
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
    config.title_power = config.title_power ? config.title_power : config.title;
    config.title_energy = config.title_energy ? config.title_energy : config.title;
    config.title_money = config.title_money ? config.title_money : config.title;
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
    config.initial_view = config.initial_view ? config.initial_view : 'power';
    config.initial_auto_toggle_view = config.initial_auto_toggle_view ? (config.initial_auto_toggle_view == true) : false;
    if (config.auto_toggle_view_period && !Number.isInteger(config.auto_toggle_view_period)) {
      throw new Error('Auto_toggle_view_period should be an integer');
    }
    config.auto_toggle_view_period = config.auto_toggle_view_period ? config.auto_toggle_view_period : 10;
    config.debug = config.debug ? config.debug : false;

    this.energy_capable = !!(config.solar_energy_entity && config.grid_energy_consumption_entity
      && config.grid_energy_production_entity);
    this.money_capable = !!(this.energy_capable && config.energy_price);
    this.autoToggleView = config.initial_auto_toggle_view;
    this.sensors = this._getSensors(config);
    this.view = config.initial_view;
    this.titles = {
      power: config.title_power,
      energy: config.title_energy,
      money: config.title_money
    };
    this.config = { ...config };
  }

  /* HA functions */

  getCardSize() {
    return 5;
  }
}

customElements.define('power-wheel-card', PowerWheelCard);