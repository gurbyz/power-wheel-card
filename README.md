power-wheel-card
====

An intuïtive way to represent the power and energy that your home is consuming or producing.
> This component is discussed [here](https://community.home-assistant.io/t/lovelace-power-wheel-card/82374) on the Home Assistant forum. There's also a [wiki](https://github.com/gurbyz/custom-cards-lovelace/wiki/Before-submitting-an-issue-report) on GitHub.

## Features
Features of the custom power-wheel-card:
* Displays the three values (solar, grid and home) in 'a wheel'.

* Has different views for showing power values, showing energy values and showing costs/savings: the *power view*, the *energy view* resp. the *money view*.
  The initial view can be set. Click the unit to switch between views.
* Has options for a different card title per view.
* Can auto-toggle between views.
  Click the recycle icon to turn on or off the auto-toggle.
  You can choose the initial state of the auto-toggle.
  You can choose a custom period (in seconds) between views.
* Calculates the current power that you nett consume from the grid: grid power.
  Input for the calculation is the power that you consume from the grid and the power that you produce to the grid.
* Calculates the current power that your home is consuming: home power.
  Input for the calculation is the power that your solar panels produce and the power consumed from and produced to the grid.
* Calculates the energy that you nett consumed from the grid: grid energy.
  Input for the calculation is the energy that you consumed from the grid and the energy that you produced to the grid.
* Calculates the energy that your home is consuming: home energy.
  Input for the calculation is the energy that your solar panels produced and the energy that you consumed from and produced to the grid.
* Calculates the costs/savings for all the energy values. Takes into account different rates for consuming and producing energy from and to the grid.
* Displays the transition between these power, energy and money values as arrows.
  E.g. if your solar power panels produce power, the arrow from solar to home turns active.
  And if your solar power panels produce enough power to deliver some back to the grid, the arrow from solar to grid turns active.
* Arrows can have values next to them. Zero values are suppressed. And values on the arrows are visible only when relevant. E.g. on a sunny day when part of your produced solar panel energy was returned to the grid and the other part was consumed by your home.
* Has support for setups that don't have separated grid sensors for consuming and producing.
  In these setups arrow values and arrow coloring are not available in *energy view* and *money view* due to lack of input details.
* Optionally uses icons of your own choice, which can be set by card parameters or taken from your `customize:` sensor settings.
* Optionally colors the consuming icons yellow and the producing icons green. You can choose your own colors for consuming and producing.
* Works for default theme and custom themes that use [standard CSS vars](https://github.com/home-assistant/home-assistant-polymer/blob/master/src/resources/ha-style.ts).
* Has support for [custom_updater](https://github.com/custom-components/custom_updater) custom component to check for new release via the custom tracker-card.

![example1](./example_power_view.gif "The power-wheel-card displaying the power view")
![example2](./example_energy_view.gif "The power-wheel-card displaying the energy view")
![example3](./example_money_view.gif "The power-wheel-card displaying the money view")

## Requirements for the *power view*
1. You need to have a working sensor for your solar power.
   Write down the entity id of this sensor. This is *YOUR_SOLAR_POWER_SENSOR* in the instructions below.
   - The sensor could have an icon (optional) that will override the default icon in the power-wheel-card if the card parameter `solar_icon` is not used.
   - The sensor state value should be a positive number when producing power.

1. You either need to have (i) separate grid power sensors for consuming and producing OR need to have (ii) one (nett) grid power sensor:
   1. You need to have a working sensor for your grid power consumption (i.e. power you consume from the grid).
      Write down the entity id of this sensor. This is *YOUR_GRID_POWER_CONSUMPTION_SENSOR* in the instructions below.

      You need to have a working sensor for your grid power production (i.e. power you produce to the grid).
      Write down the entity id of this sensor. This is *YOUR_GRID_POWER_PRODUCTION_SENSOR* in the instructions below.
      - Preferably these sensors have the same update interval as the sensor for solar power. (If not, the calculated value for home power can give unreal results sometimes.)
      - The sensor state values should be a positive number.

      *OR:*
   1. You need to have a working sensor for your (nett) grid power.
      Write down the entity id of this sensor. This is *YOUR_GRID_POWER_SENSOR* in the instructions below.
      - Default the polarity of this parameter has to be positive for producing (to the grid) and negative for consuming (from the grid).
1. For all these sensors:
   - A `unit_of_measurement` has been set up, e.g. `'W'` or `'kW'`.
   - The `unit_of_measurement` is the same as the other power sensors.
   - The sensor state should always be parsable to an *int* or - even better - a *float* value.

You don't always need a sensor for your (nett) grid power but you can use it if you have it available and want to use its **icon**.

You don't need a sensor for your home power, but you can use it if you have it available and want to use its **icon**. The **value** of this sensor will not be used. 

### Example requirements configuration
This is not the configuration of the power-wheel-card itself, but an example configuration that's needed to have input sensors for the power-wheel-card.
An example configuration in `configuration.yaml` to comply to the requirements:

```yaml
sensor:
  - platform: template
    sensors:
      solar_power:
        friendly_name: 'Solar power production'
        unit_of_measurement: 'W'
        value_template: >-
          {{ state_attr("sensor.youless", "pwr") }}
      grid_power_consumption:
        friendly_name: 'Grid power consumption'
        unit_of_measurement: 'W'
        value_template: >-
          {{ (1000 * (states("sensor.power_consumption") | float) | int }}
      grid_power_production:
        friendly_name: 'Grid power production'
        unit_of_measurement: 'W'
        value_template: >-
          {{ (1000 * (states("sensor.power_production") | float) | int }}
```

In this example the sensors names for *YOUR_SOLAR_POWER_SENSOR*, *YOUR_GRID_POWER_CONSUMPTION_SENSOR* and *YOUR_GRID_POWER_PRODUCTION_SENSOR* are `solar_power`, `grid_power_consumption` resp. `grid_power_production`.

Not visible in the example above, but of course you have to have installed the hardware and configured it to feed your sensors.
In the example above I used a [rest sensor](https://www.home-assistant.io/components/sensor.rest/) for my [Youless](http://youless.nl/winkel/product/ls120.html) for the solar power.
For the grid power I used a [dsmr sensor](https://www.home-assistant.io/components/sensor.dsmr/) for my Iskra Smart Meter.
Because my solar power sensor and dsmr sensor don't report in the same unit of measurement, I had to convert that.

> **Tip.** If you are creating extra sensors for the power-wheel-card, maybe you want to exclude them in your `recorder:` setting.
Extra sensors based on your heavily updating DSMR sensors will let your database grow fast. 

## Requirements for the *energy view*
The *energy view* itself is not required. As a result you don't have to specify any *energy view* related card parameters. 
The toggle functions to switch between views will be disabled.

> **Tip.** You can skip this paragraph and [start](#instructions) with a more simple setup first. 

But if you want the *energy view*:
1. Comply to all the requirements of the *power view* first.

1. Decide what kind of energy sensors you want to use. 
   You could use your *smart meter counters* directly, but using self made sensors for e.g. *energy consumed or produced since last midnight* could provide more meaningful information on your power-wheel-card.
   Then you are able to see the actual energy costs/savings today in the *money view*.
1. You need to have a working sensor for your solar energy. 
   Write down the entity id of this sensor. This is *YOUR_SOLAR_ENERGY_SENSOR* in the instructions below.
   - The sensor could have an icon (optional) that will override the default icon in the power-wheel-card if the card parameter `solar_icon` is not used.
   - The sensor state value should be a positive number for having produced energy.
1. You either need to have (i) separate grid energy sensors for consuming and producing OR need to have (ii) one (nett) grid energy sensor and a home energy sensor:
   1. You need to have a working sensor for your grid energy consumption (i.e. energy you consumed from the grid).
      Write down the entity id of this sensor. This is *YOUR_GRID_ENERGY_CONSUMPTION_SENSOR* in the instructions below.

      You need to have a working sensor for your grid energy production (i.e. energy you produced to the grid).
      Write down the entity id of this sensor. This is *YOUR_GRID_ENERGY_PRODUCTION_SENSOR* in the instructions below.
      - Preferably these sensors have the same update interval as the sensor for solar energy. (If not, the calculated value for home energy can give unreal results sometimes.)
      - The sensor state values should be a positive number.
      
      *OR: (not recommended)*
   1. You need to have a working sensor for your (nett) grid energy.
      Write down the entity id of this sensor. This is *YOUR_GRID_ENERGY_SENSOR* in the instructions below.

      You need to have a working sensor for your home energy, because it can't be calculated.
      Write down the entity id of this sensor. This is *YOUR_HOME_ENERGY_SENSOR* in the instructions below.
      - Default the polarity of these parameters have to be positive for producing (to the grid) and negative for consuming (from the grid).
      - Nb. You will lack arrow coloring and arrow values in the *energy view* and *money view* due to supplying too less information to calculate these.      
1. For all these sensors:
   - A `unit_of_measurement` has been set up, e.g. `'Wh'` or `'kWh'`.
   - The `unit_of_measurement` is the same as the other energy sensors.
   - The sensor state should always be parsable to an *int* or - even better - a *float* value.

You don't always need a sensor for your (nett) grid energy but you can use it if you have it available and want to use its **icon**.

You don't always need a sensor for your home energy, but you can use it if you have it available and want to use its **icon**.

## Requirements for the *money view*
The *money view* itself is not required. As a result you don't have to specify any *money view* related card parameters. 
The toggle functions to switch to the *money view* will be disabled.

But if you want the *money view*:
1. Comply to all the requirements of the *energy view* first.
1. Supply the card parameter `energy_consumption_rate`.
1. (Optional) If you have a different rate for producing energy back to the grid, you can also supply the card parameter `energy_production_rate`.

> The power-wheel-card only has rates for the energy depending on whether you consume or produce it.
If your energy rate is depending on the (time of) day, please supply the average rates for high and low tariff or choose to not use the *money view*. 


## Instructions
1. Check the requirements above. If you don't comply to the requirements, the card won't be much of use for you or just won't work.

1. Download the file [power-wheel-card.js](https://raw.githubusercontent.com/gurbyz/custom-cards-lovelace/master/power-wheel-card.js).
1. Save the file in the `www` folder inside your Home Assistant config folder.
1. Include the card code in your `ui-lovelace.yaml` file:

```yaml
resources:
  - url: /local/power-wheel-card.js?v=1
    type: module
```

> **Note.** The actual number in `v=A_NUMBER` isn't relevant. You have to increase the number whenever updating the source code to avoid having to manually clear the cache of your browsers and mobile apps.

5. Include a configuration for the power-wheel-card in your `ui-lovelace.yaml` file:

```yaml
views:
  - id: example_view
    cards:
      - type: custom:power-wheel-card
        solar_power_entity: sensor.YOUR_SOLAR_POWER_SENSOR
        grid_power_consumption_entity: sensor.YOUR_GRID_POWER_CONSUMPTION_SENSOR
        grid_power_production_entity: sensor.YOUR_GRID_POWER_PRODUCTION_SENSOR
```

There are many more card parameters available, but it's advised to start with this simple setup to get things running. 

## Card parameters

| Parameter | Type | Mandatory? | Default | Description |
|-----------|------|------------|---------|-------------|
|type|string|**required**| |Type of the card. Use `"custom:power-wheel-card"`.|
|title|string|optional|`"Power wheel"`|Title of the card in all views, if not overridden with a title per view.|
|title_power|string|optional|Value of `title`.|Title of the card in *power view*.|
|title_energy|string|optional|Value of `title`.|Title of the card in *energy view*.|
|title_money|string|optional|Value of `title`.|Title of the card in *money view*.|
|solar_power_entity|string|**required**| |Entity id of your solar power sensor. E.g. `sensor.YOUR_SOLAR_POWER_SENSOR`. See requirements above.|
|grid_power_consumption_entity (A)|string|optional, always together with B| |Entity id of your sensor for power that you are consuming from the grid. E.g. `sensor.YOUR_GRID_POWER_CONSUMPTION_SENSOR`. See requirements above.|
|grid_power_production_entity (B)|string|optional, always together with A| |Entity id of your sensor for power that you are producing to the grid. E.g. `sensor.YOUR_GRID_POWER_PRODUCTION_SENSOR`. See requirements above.|
|solar_energy_entity|string|optional|Default the *energy view* will not be enabled.|Entity id of your solar energy sensor. E.g. `sensor.YOUR_SOLAR_ENERGY_SENSOR`. See requirements above.|
|grid_energy_consumption_entity (D)|string|optional, always together with E|Default the *energy view* will not be enabled.|Entity id of your sensor for energy that's consumed from the grid. E.g. `sensor.YOUR_GRID_ENERGY_CONSUMPTION_SENSOR`. See requirements above.|
|grid_energy_production_entity (E)|string|optional, always together with D|Default the *energy view* will not be enabled.|Entity id of your sensor for energy that's produced to the grid. E.g. `sensor.YOUR_GRID_ENERGY_PRODUCTION_SENSOR`. See requirements above.|
|energy_consumption_rate|float|optional|Default the *money view* will not be enabled.|The rate of your energy consumed from the grid per unit of energy. E.g. `0.20`.|
|energy_production_rate|float|optional|The value of `energy_consumption_rate`.|The rate of your energy produced to the grid per unit of energy. E.g. `0.15`.|
|energy_price *(deprecated)*|float|optional| |Deprecated. Please use `energy_consumption_rate` and evt. the optional `energy_production_rate` as of version 0.0.13.|
|money_unit|string|optional|`"€"`|The unit of `energy_consumption_rate` and `energy_production_rate`. This unit will be used for displaying all money values.|
|solar_icon|string|optional|The icon of your own customized solar sensor(s). If not available, then `"mdi:weather-sunny"` will be used.|Icon for solar power and energy.|
|grid_icon|string|optional|The icon of your own customized grid sensor(s) if its entity parameter is set. If not available, then `"mdi:transmission-tower"` will be used.|Icon for grid power and energy.|
|home_icon|string|optional|The icon of your own customized home sensor(s) if its entity parameter is set. If not available, then `"mdi:home"` will be used.|Icon for home power and energy.|
|power_decimals|integer|optional|`0`|Number of decimals for the power values.|
|energy_decimals|integer|optional|`3`|Number of decimals for the energy values.|
|money_decimals|integer|optional|`2`|Number of decimals for the money values.|
|color_icons|boolean|optional|`true`|To color the consuming icons green and the producing icons yellow. Icon values will have an absolute value. This setting only is affecting the three big icons for *solar*, *home* and *grid*. The arrows have colors by default.|
|consuming_color|string|optional|The yellow color for `--label-badge-yellow` from your theme. If not available, then `"#f4b400"` will be used.|CSS color code for consuming power icons if `color_icons` is set to `true`. Examples: `"orange"`, `"#ffcc66"` or `"rgb(200,100,50)"`. Don't forget the quotation marks when using the `#` color notation.|
|producing_color|string|optional|The green color for `--label-badge-green` from your theme. If not available, then `"#0da035"` will be used.|CSS color code for producing power icons if `color_icons` is set to `true`.|
|initial_view|string|optional|`"power"`|The initial view that will displayed. Allowed values are `"power"` for *power view*, `"energy"` for *energy view* and `"money"` for *money view*.|
|initial_auto_toggle_view|boolean|optional|`false`|The initial state of the auto-toggle for views.|
|auto_toggle_view_period|integer|optional|`10`|Period in seconds between views when auto-toggle for views is turned on.|
|debug|boolean|optional|`false`|Logs debug information in the console of your browser. Useful when you want to investigate or register an issue.|

Some extra parameters for users who don't have separate grid sensors for producing and consuming:

| Parameter | Type | Mandatory? | Default | Description |
|-----------|------|------------|---------|-------------|
|grid_power_entity (C)|string|optional, but required if you don't have A and B| |Entity id of your nett grid power sensor if you don't have separate sensors for grid power production (to the grid) and grid power consumption (from the grid). E.g. `sensor.YOUR_GRID_POWER_SENSOR`.|
|grid_energy_entity (F)|string|optional, but required if you don't have D and E and want to use the *energy view*| |Entity id of your nett grid energy sensor if you don't have separate sensors for grid energy production (to the grid) and grid energy consumption (from the grid). E.g. `sensor.YOUR_GRID_ENERGY_SENSOR`.|
|home_energy_entity (G)|string|optional, but required if you don't have D and E and want to use the *energy view*| |Entity id of your home energy sensor if you don't have separate sensors for grid energy production (to the grid) and grid energy consumption (from the grid). E.g. `sensor.YOUR_HOME_ENERGY_SENSOR`.|
|production_is_positive|boolean|optional|`true`|If you use C, F or G you can specify the polarity of these input sensors. Use `true` for producing to the grid has positive values in your input sensors. Use `false` for producing to the grid has negative values.| 

Some extra parameters for advanced users who use dynamic icons in their HA setup and want to use them in the power-wheel-card: 

| Parameter | Type | Mandatory? | Default | Description |
|-----------|------|------------|---------|-------------|
|home_power_entity|string|optional|Default the icon specified in `home_icon` will be used. If not specified `"mdi:home"` will be used.|Entity id of your home power sensor if you want to use its icon in the *power view* instead of supplying a static `home_icon` on card level.|
|grid_power_entity|string|optional|Default the icon specified in `grid_icon` will be used. If not specified `"mdi:transmission-tower"` will be used.|Entity id of your grid power sensor if you want to use its icon in the *power view* instead of supplying a static `grid_icon` on card level.|
|home_energy_entity|string|optional|Default the icon specified in `home_icon` will be used. If not specified `"mdi:home"` will be used.|Entity id of your home energy sensor if you want to use its icon in the *energy view* instead of supplying a static `home_icon` on card level.|
|grid_energy_entity|string|optional|Default the icon specified in `grid_icon` will be used. If not specified `"mdi:transmission-tower"` will be used.|Entity id of your grid energy sensor if you want to use its icon in the *energy view* instead of supplying a static `grid_icon` on card level.|


### More about icons
The icons for solar and grid can be set by card parameters as shown in the tables above.
If you don't specify them as card parameters, the icons are taken from your own sensors for solar power and grid power (in the *power view*) and from your own sensors for solar energy and grid energy (in the *energy view* and *money view*).
You could have specified those with the `customize:` option for `homeassistant` in your `configuration.yaml`.

If you haven't set up any icons for them, default icons will be used in all views. For solar: `mdi:weather-sunny`; and for grid: `mdi:transmission-tower`.

An example for reusing the icons of your sensors used in the *power view*, to be put in `configuration.yaml`:

```yaml
homeassistant:
  customize:
    sensor.YOUR_SOLAR_POWER_SENSOR:
      icon: mdi:white-balance-sunny
    sensor.YOUR_GRID_POWER_SENSOR:
      icon: mdi:flash
```

## Advanced configuration example
A more advanced example for in the `ui-lovelace.yaml` file:
```yaml
- type: custom:power-wheel-card
  title_power: "Power distribution"
  title_energy: "Energy distribution"
  title_money: "Energy costs/savings"
  solar_power_entity: sensor.YOUR_SOLAR_POWER_SENSOR
  grid_power_consumption_entity: sensor.YOUR_GRID_POWER_CONSUMPTION_SENSOR
  grid_power_production_entity: sensor.YOUR_GRID_POWER_PRODUCTION_SENSOR
  solar_energy_entity: sensor.YOUR_SOLAR_ENERGY_SENSOR
  grid_energy_consumption_entity: sensor.YOUR_GRID_ENERGY_CONSUMPTION_SENSOR
  grid_energy_production_entity: sensor.YOUR_GRID_ENERGY_PRODUCTION_SENSOR
  energy_consumption_rate: 0.20
  energy_production_rate: 0.15
  money_unit: "$"
  solar_icon: "mdi:white-balance-sunny"
  grid_icon: "mdi:flash"
  home_icon: "mdi:home-assistant"
  power_decimals: 2
  energy_decimals: 2
  money_decimals: 0
  color_icons: true
  consuming_color: "#33ff33"
  producing_color: "#dd5500"
  initial_view: "energy"
  initial_auto_toggle_view: true
  auto_toggle_view_period: 5
```

## License
This custom card is licensed under the [Apache License 2.0](https://github.com/gurbyz/custom-cards-lovelace/blob/master/LICENSE).

## Credits
* [gurbyz](https://github.com/gurbyz)