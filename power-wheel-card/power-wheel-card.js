import {
  LitElement, html
} from 'https://unpkg.com/@polymer/lit-element@^0.5.2/lit-element.js?module';

class PowerWheelCard extends LitElement {
  static get properties() {
    return {
      hass: Object,
      config: Object,
    }
  }

  _render({ hass, config }) {
    const solarPowerState = hass.states[config.solar_power_entity];
    const solarPowerStateStr = solarPowerState ? parseFloat(solarPowerState.state).toFixed(this.decimals) : 'unavailable';
    const solarPowerIcon = config.solar_power_icon ? config.solar_power_icon
      : (solarPowerState && solarPowerState.attributes.icon ? solarPowerState.attributes.icon : 'mdi:weather-sunny');
    const solarPowerClass = (solarPowerState && parseFloat(solarPowerState.state) > 0) ? 'producing' : 'inactive';

    const gridPowerState = hass.states[config.grid_power_entity];
    const gridPowerStateStr = gridPowerState ? parseFloat(gridPowerState.state).toFixed(this.decimals) : 'unavailable';
    const gridPowerIcon = config.grid_power_icon ? config.grid_power_icon
      : (gridPowerState && gridPowerState.attributes.icon ? gridPowerState.attributes.icon : 'mdi:flash-circle');
    const gridPowerClass = (gridPowerState && parseFloat(gridPowerState.state) > 0)
      ? 'consuming' : ((gridPowerState && parseFloat(gridPowerState.state) < 0) ? 'producing' : 'inactive');

    let homePowerState,
        homePowerStateStr,
        homePowerClass;
    if (config.home_power_entity) { // home power value by sensor
      homePowerState = hass.states[config.home_power_entity];
      homePowerStateStr = homePowerState ? parseFloat(homePowerState.state).toFixed(this.decimals) : 'unavailable';
      homePowerClass = (homePowerState && parseFloat(homePowerState.state) > 0) ? 'consuming' : 'inactive';
    } else { // home power value by calculation
      if (solarPowerState && gridPowerState) {
        homePowerStateStr = (parseFloat(solarPowerState.state) + parseFloat(gridPowerState.state)).toFixed(this.decimals);
        homePowerClass = parseFloat(solarPowerState.state) + parseFloat(gridPowerState.state) > 0 ? 'consuming' : 'inactive';
      } else {
        homePowerStateStr = 'unavailable';
        homePowerClass = 'inactive';
      }
    }
    const homePowerIcon = config.home_power_icon ? config.home_power_icon : 'mdi:home';

    const unitStr = solarPowerState && gridPowerState
      && solarPowerState.attributes.unit_of_measurement && gridPowerState.attributes.unit_of_measurement
      && solarPowerState.attributes.unit_of_measurement == gridPowerState.attributes.unit_of_measurement
      ? solarPowerState.attributes.unit_of_measurement : 'unknown unit';

    const solar2gridClass = gridPowerState && parseFloat(gridPowerState.state) < 0 ? 'active' : 'inactive';
    const solar2homeClass = solarPowerState && parseFloat(solarPowerState.state) > 0
      && gridPowerState && parseFloat(homePowerStateStr) != 0 ? 'active' : 'inactive';
    const grid2homeClass = gridPowerState && parseFloat(gridPowerState.state) > 0
      && solarPowerState && parseFloat(homePowerStateStr) != 0 ? 'active' : 'inactive';

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
        ha-card .cell.power {
          cursor: pointer;
        }
        ha-icon {
          transition: color 0.3s ease-in-out, filter 0.3s ease-in-out;
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
      </style>
      <ha-card>
        <div class="header">
          ${this.title}
        </div>
        <div class="row">
          <div class="cell power" on-click="${e => this._handleClick(e, solarPowerState)}">
            <ha-icon class$="${solarPowerClass}" icon="${solarPowerIcon}"></ha-icon>
            <br/>${solarPowerStateStr} ${unitStr}
          </div>
        </div>
        <div class="row">
          <div class="cell">
            <ha-icon class$="${solar2gridClass}" icon="mdi:arrow-bottom-left"></ha-icon>
          </div>
          <div class="cell">
            <ha-icon class$="${solar2homeClass}" icon="mdi:arrow-bottom-right"></ha-icon>
          </div>
        </div>
        <div class="row">
          <div class="cell power" on-click="${e => this._handleClick(e, gridPowerState)}">
            <ha-icon class$="${gridPowerClass}" icon="${gridPowerIcon}"></ha-icon>
            <br/>${gridPowerStateStr} ${unitStr}
          </div>
          <div class="cell">
            <ha-icon class$="${grid2homeClass}" icon="mdi:arrow-right"></ha-icon>
          </div>
          <div class="cell power" on-click="${e => this._handleClick(e, homePowerState)}">
            <ha-icon class$="${homePowerClass}" icon="${homePowerIcon}"></ha-icon>
            <br/>${homePowerStateStr} ${unitStr}
          </div>
        </div>
      </ha-card>
    `;
  }

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

  setConfig(config) {
    if (!config.solar_power_entity) {
      throw new Error('You need to define a solar_power_entity');
    }
    if (!config.grid_power_entity) {
      throw new Error('You need to define a grid_power_entity');
    }
    this.title = config.title ? config.title : 'Power wheel';
    if (config.decimals && !Number.isInteger(config.decimals)) {
      throw new Error('Decimals should be an integer');
    }
    this.decimals = config.decimals ? config.decimals : 0;
    this.colorPowerIcons = config.color_power_icons ? (config.color_power_icons == true) : false;
    this.consumingColor = this.colorPowerIcons
      ? (config.consuming_color ? config.consuming_color : 'var(--label-badge-yellow, #f4b400)')
      : 'var(--state-icon-unavailable-color, #bdbdbd)';
    this.producingColor = this.colorPowerIcons
      ? (config.producing_color ? config.producing_color : 'var(--label-badge-green, #0da035)')
      : 'var(--state-icon-unavailable-color, #bdbdbd)';
    this.config = config;
  }

  getCardSize() {
    return 5;
  }
}

customElements.define('power-wheel-card', PowerWheelCard);