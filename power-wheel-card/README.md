power-wheel-card
====

An intuïtive way to represent the power that your home is consuming or producing.
> This component is discussed [here](https://community.home-assistant.io/t/lovelace-power-wheel-card/82374) on the Home Assistant forum.

## Features
Features of the custom power-wheel-card:
* Displays the three power values (solar, grid and home) in 'a wheel'.
* Optionally calculates the current power that your home is consuming: home power.
  Input for the calculation is the (produced) solar power and the (consumed or produced) grid power.
* Displays the transition between these powers as arrows.
  E.g. if your solar power panels produce power, the arrow from solar to home turns active.
  And if your solar power panels produce enough power to deliver some back to the grid, the arrow from solar to grid turns active.
* Optionally uses icons of your own choice, which can be set by card parameters or taken from your `customize:` sensor settings.
* Optionally colors the consuming power icons yellow and the producing power icons green. You can choose your own colors for consuming and producing.
* Works for default theme and custom themes that use [standard CSS vars](https://github.com/home-assistant/home-assistant-polymer/blob/master/src/resources/ha-style.js).
* Has support for [custom_updater](https://github.com/custom-components/custom_updater) custom component to check for new release via the custom tracker-card.

![example1](./example-card.gif "The power-wheel-card in Default theme")
![example2](./example-card-dark.gif "The power-wheel-card in a random dark theme")

## Requirements
1. You need to have a working sensor for your solar power. Write down the entity id of this sensor. This is *YOUR_SOLAR_POWER_SENSOR* in the instructions below.
    - This sensor has a `unit_of_measurement` set up, e.g. `'W'` or `'kW'`.
    - The sensor value should be of type *int* or *float*.
    - The sensor value should be positive.
    - The sensor could have an icon (optional) that will override the icon in the power-wheel-card if the card parameter `solar_power_icon` is not used.
1. You need to have a working sensor for your grid power. Write down the entity id of this sensor. This is *YOUR_GRID_POWER_SENSOR* in the instructions below.
    - This sensor has **the same** `unit_of_measurement` set up as the sensor for solar power.
    - Preferably this sensor has the same update interval as the sensor for solar power. (If not, the calculated value for home power can give unreal results sometimes.)
    - The sensor value should be of type *int* or *float*.
    - The sensor value should be **negative** for **producing** power to the grid and **positive** for **consuming** power of the grid.
    - The sensor could have an icon (optional) that will override the icon in the power-wheel-card if the card parameter `grid_power_icon` is not used.

Nb. You don't need a sensor for your home power, but you can use if you have it available. The value will be calculated if your don't supply this sensor as card parameter.

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
      grid_power:
        friendly_name: 'Grid power consumption'
        unit_of_measurement: 'W'
        value_template: >-
          {{ (1000 * (states("sensor.power_consumption") | float -
                      states("sensor.power_production") | float)) | int }}
```

In this example the sensors names for *YOUR_SOLAR_POWER_SENSOR* and *YOUR_GRID_POWER_SENSOR* are `solar_power` resp. `grid_power`.

Not visible in the example above, but of course you have to have installed the hardware and configured it to feed your sensors.
In the example above I used a [rest sensor](https://www.home-assistant.io/components/sensor.rest/) for my [Youless](http://youless.nl/winkel/product/ls120.html) for the solar power.
For the grid power I used a [dsmr sensor](https://www.home-assistant.io/components/sensor.dsmr/) for my Iskra Smart Meter.
Because the dsmr sensor supplies 2 separate sensors for grid power consumption and grid power production, I had to combine them into one grid power sensor.
And because my solar power sensor and dsmr sensor don't report in the same unit of measurement, I had to convert that as well.

## Instructions
1. Check the requirements above. If you don't comply to the requirements, the card won't be much of use for you or just won't work.
1. Download the file [power-wheel-card.js](https://raw.githubusercontent.com/gurbyz/custom-cards-lovelace/master/power-wheel-card/power-wheel-card.js).
1. Save the file in the `www` folder inside your Home Assistant config folder.
1. Include the card code in your `ui-lovelace.yaml` file:

```yaml
resources:
  - url: /local/power-wheel-card.js?v=1
    type: module
```

> Note: The actual number in `v=A_NUMBER` isn't relevant. You can increase the number whenever updating the source code to avoid having to manually clear the cache of your browsers and mobile apps.

5. Include a configuration for the power-wheel-card in your `ui-lovelace.yaml` file:

```yaml
views:
  - id: example_view
    cards:
      - type: "custom:power-wheel-card"
        solar_power_entity: sensor.YOUR_SOLAR_POWER_SENSOR
        grid_power_entity: sensor.YOUR_GRID_POWER_SENSOR
        color_power_icons: true
```

## Parameters

| Parameter | Type | Mandatory? | Default | Description |
|--------|------|------------|---------|-------------|
|type|string|**required**||Type of the card. Use `"custom:power-wheel-card"`.|
|title|string|optional|`"Power wheel"`|Title of the card.|
|solar_power_entity|string|**required**||Entity id of your solar power sensor. E.g. `sensor.YOUR_SOLAR_POWER_SENSOR`. See requirements above.|
|solar_power_icon|string|optional|The icon of your own customized solar power sensor. If not available, then `"mdi:weather-sunny"` will be used.|Icon for solar power.|
|grid_power_entity|string|**required**||Entity id of your grid power sensor. E.g. `sensor.YOUR_GRID_POWER_SENSOR`. See requirements above.|
|grid_power_icon|string|optional|The icon of your own customized grid power sensor. If not available, then `"mdi:flash-circle"` will be used.|Icon for grid power.|
|home_power_entity|string|optional|Default the home power value will be calculated.|Entity id of your home power sensor.|
|home_power_icon|string|optional|The icon of your own customized home power sensor if `home_power_entity` is set. If not available, then `"mdi:home"` will be used.|Icon for home power.|
|decimals|integer|optional|`0`|Number of decimals for the power values.|
|color_power_icons|boolean|optional|`false`|To color the consuming power icons green and the producing power icons yellow.|
|consuming_color|string|optional|The yellow color for `--label-badge-yellow` from your theme. If not available, then `"#f4b400"` will be used.|CSS color code for consuming power icons if `color_power_icons` is set to `true`. Examples: `"orange"`, `"#ffcc66"` or `"rgb(200,100,50)"`. Don't forget the quotation marks when using the `#` color notation.|
|producing_color|string|optional|The green color for `--label-badge-green` from your theme. If not available, then `"#0da035"` will be used.|CSS color code for producing power icons if `color_power_icons` is set to `true`.|

### More about icons
The icons for solar power and grid power can be set by card parameters as shown in the table above.
If you don't specify them as card parameters, the icons are taken from your own sensors for solar power and grid power.
You could have specified those with the `customize` option for `homeassistant` in your `configuration.yaml`.
If you haven't set up icons for them, default icons will be used. For solar power: `mdi:weather-sunny`; and for grid power: `mdi:flash-circle`.

An example for reusing the icons of your sensors, to be put in `configuration.yaml`:

```yaml
homeassistant:
  customize:
    sensor.solar_power:
      icon: mdi:white-balance-sunny
    sensor.grid_power:
      icon: mdi:flash
```

## Advanced configuration example
A more advanced example for in the `ui-lovelace.yaml` file:
```yaml
- type: "custom:power-wheel-card"
  title: "Power distribution"
  solar_power_entity: sensor.YOUR_SOLAR_POWER_SENSOR
  solar_power_icon: "mdi:white-balance-sunny"
  grid_power_entity: sensor.YOUR_GRID_POWER_SENSOR
  grid_power_icon: "mdi:flash"
  home_power_icon: "mdi:home-assistant"
  decimals: 2
  color_power_icons: true
  consuming_color: "#33ff33"
  producing_color: "#dd5500"
```

## License
This custom card is licensed under the [Apache License 2.0](https://github.com/gurbyz/custom-cards-lovelace/blob/master/LICENSE).

## Credits
* [gurbyz](https://github.com/gurbyz)