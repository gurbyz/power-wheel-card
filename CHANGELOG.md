Changelog
====
## 0.1.5-dev
### Fixes

## 0.1.4
### Improvements
* Documentation improvement. As mentioned in #60.
* Prevent impact for HA breaking change about getting LitElement from hui-view. Better solution for issue #61 than in version 0.1.3.

## 0.1.3
### Improvements
* Documentation improvements
  * Rewrite of the icons paragraph in the documentation.
  * Added a paragraph for 'view toggling' in the documentation.
  * Updated HACS installation instruction. Simplified some documentation.
  * Battery feature documentation restructured.
  * Updated installation instructions and HACS info file.
  * Rewrite of the documentation for requirements and configuration.
* Prevent impact for HA breaking change about getting LitElement from hui-view. Possible solution for issue #61.

## 0.1.2
### New features
* Allowing to hide the title. Default value for `title` is empty now. If you want the previous behavior you could add `title: 'Power wheel'` to your config. Issue #51.
* ** BETA.** You can switch the polarity of `battery_power_entity` with the new card parameter `charging_is_positive`. No need to make an extra template sensor for this anymore. Issue #46.
### Improvements
* Removed deprecated input parameter `energy_price`. This parameter was deprecated since version 0.1.0.
### Fixes 
* After a startup of HA sensor validation errors stayed visible since the new startup order of HA 0.111.0. Sensor validation is disabled temporarily. 

## 0.1.1
### New features
* Custom color for active arrows. New card parameter `active_arrow_color`.
* Invert grid icon coloring for consuming/producing. New card parameter `invert_grid_colors`. Default `false`.
### Fixes
* Provisional fix for icon sizes (as of HA 0.110.0). Issue #48.

## 0.1.0
### New features
* **BETA.** Basic support for a battery in the *power view*.
  * New card parameter `battery_power_entity`. Charging should have positive values.
  * New card parameter `battery_soc_entity` to display the state of charge.
  * New card parameter `battery_icon` to override the default icon.
### Improvements
* Total rebuild of the core functions.
* Moved from web-components-tester to Karma.
* **DEPRECATED.** Visual warning if still using card parameter `energy_price` which is deprecated since version 0.0.13.
  Please replace `energy_price` by `energy_consumption_rate` in your setup.
* Log version to console also when not in debug mode.
### Fixes
* Number of decimals can be set to zero in *energy view* and *money view*. Issue #39.

## 0.0.16
### Fixes
* Prepare for future card config changes.

## 0.0.15
### Improvements
* Removal of support for Customer Updater.
* Preparations to support HACS. Repo file tree restructuring and repo name change from `custom-cards-lovelace` to `power-wheel-card`.

## 0.0.14
### Improvements
* Update for HA Cast. LitElement is taken from `hui-view`.
### Fixes
* Fixed a link in readme.

## 0.0.13
### New features
* Split energy rates for consuming from the grid and producing to the grid.
  * Use new card parameters `energy_consumption_rate` and optional `energy_production_rate`.
  * **DEPRECATED.** Current card parameter `energy_price` is deprecated and its value will be used as value for `energy_consumption_rate` for a while.
  Please replace `energy_price` by `energy_consumption_rate` in your setup.
### Improvements
* Hide values near arrows in more cases.
* Code improvements.

## 0.0.12
### Improvements
* Replaced ES6 *rest destructuring* language constructs to support iOS10.3 on iPad4.
* Added version number to the debug warning in the card, because not all browsers have a dev console.
### Fixes
* Added `home_energy_entity` to the registered sensors in debug info.

## 0.0.11
### New features
* Support for one (nett) grid power sensor.
Some setups don't have separate sensors for grid power consumption (from the grid) and grid power production (to the grid).
Previously you had to make an extra template sensor for this.
  * Use current card parameter `grid_power_entity` to supply your input for the card.
Default the polarity of this parameter has to be positive for producing (to the grid) and negative for consuming (from the grid). 
* Support for one (nett) grid energy sensor.
Some setups don't have separate sensors for grid energy consumption (from the grid) and grid energy production (to the grid).
Previously you were not able to use the *energy view*.
  * Use current card parameter `grid_energy_entity` to supply your input for the card.
  * Use current card parameter `home_energy_entity` to supply your input for the card. This extra parameter is needed because the consumed energy of your home can't be calculated if you only have one grid energy sensor.
  * Default the polarity of these parameters has to be positive for producing (to the grid) and negative for consuming (from the grid).
  * Nb. There still won't be active arrows in the *energy view* nor values near the arrows.
This is because you supply too less information to calculate these values.
Power-wheel-card can't do magic.
* Support for switching the polarity of `grid_power_entity`, `grid_energy_entity` and `home_energy_entity`.
Default the polarity of these parameters has to be positive for producing (to the grid) and negative for consuming (from the grid).
  * You can switch the polarity of all these 3 entities with the new card parameter `production_is_positive`.
  * Nb. The parameter is switching the polarity of exactly only the 3 mentioned input parameters. All other input parameters are not affected.
  * Nb. The parameter is switching the polarity of **input** values to be able to use them in calculations. Negative output values (i.e. displayed values) always represent consuming (from the grid).  
### Improvements
* Arrows will reverse when their value becomes negative.
(E.g. solar panel inverters start consuming when there is no sun and some users have a sensor that detects this.)
The values next to arrows always are positive now. 
* About coloring the *solar*, *grid* and *home* icons, polarity of their values ('+' when producing, '-' when consuming) and sign of their values ('+' or '-'):
  * When `color_icons` is set to `true` the Solar, Grid and Home values always are displayed as positive values,
because the color of the icon represents the plus or minus sign already. 
  * The polarity of the values for Grid and Home is switched for better consistency throughout the card.
The polarity of the colors stayed the same.
The changed polarity is visible only when `color_icons` is set to `false`, because negative values are displayed then only.
  * Card parameter `color_icons` is now default `true`.
If you don't want colored icons and see negative values, you have to set the parameter to `false` explicitly.
* Added user agent to the debug output.
* Automated testing before each commit.
* Added tests to get a good functional and code coverage. There are 627 tests now.

## 0.0.10
### New features
* New `debug` parameter for logging debug information in the console of the browser.
Useful when you want to investigate or register an issue.
* Errors and warnings are displayed in the card if they occur after the config step of HA Lovelace.
### Improvements
* Setup for automated testing of the card. 142 tests to start with.
* Replaced default grid icon `mdi:flash-circle` with `mdi:transmission-tower` which is available since HA 0.87.0.
* Render styles according to version 2.0.0-rc.5 of lit-element in HA 0.87.0.
* Validation on HA sensors in the config. Display an error when a sensor couldn't be found.
E.g. when a user makes a typo in the config.
* Improved error display on validation of units of sensors.
* Performance improvement on unit definition. Define once instead of on each render.
* Code improvements. Small performance improvements.
### Fixes
* Fix for disappearing `hui-error-entity-row` in HA 0.88.0 which would break the card.

## 0.0.9
### New features
* Set a different title per view by using optional card parameters `title_power`, `title_energy` and/or `title_money`.
  All three card parameters default to the value of card parameter `title`.
* Auto-toggle between views. Click the recycle icon to turn on and off the auto-toggle.
  The initial auto-toggle state can  be set by optional card parameter `initial_auto_toggle_view`.
  The period between views can be set by optional card parameter `auto_toggle_view_period` (in seconds).
### Improvements
* Performance. Update only on specific changes of the `hass` object.
* Don't suppress zero values on solar, home and grid icon; only on arrows.
* More explanation in the readme about which sensor to use for what card parameter.

## 0.0.8
### New features
* All zero values are suppressed. And values on the arrows are visible only when relevant. E.g. on a sunny day when part of your produced solar panel energy was returned to the grid and the other part was consumed by your home.
* More-info dialogues for arrows that are related to a sensor.
### Improvements
* Immediate response when you click on the unit to toggle between views. 
* Using the local version of lit-element.
* Code improvements.
### Fixes
* More-info dialogues only for icons that are related to a sensor.
* Reduced clickable area for toggling the view.

## 0.0.7
### Improvements
* Upgrade to lit-element 0.6.5.
### Fixes
* Switch back from unpkg-gcp.firebaseapp.com to unpkg.com again because of CORS error.

## 0.0.6
### New features
* Unit is displayed in the center of the wheel.
* **BREAKING.** To switch views click the unit. The button has been removed.
* Arrow coloring now also in *energy view*. *)
* Power, energy and money values displayed next to all arrows. *)
* A third view: *money view* for displaying energy costs and savings. *)
  When you supply card parameter `energy_price` (in addition to the parameters needed for the *energy view*) the *money view* becomes available.

*) To make this feature possible the breaking changes as described below were needed.

### Improvements
* Rewrite: separating calculating values in the code.
* Value for home will be calculated always and not taken from evt. home sensors anymore.
* **BREAKING.** Card parameter `grid_power_entity` has been split into `grid_power_consumption_entity` and `grid_power_production_entity`.
  Both card parameters are required and should have positive values.
  The combined parameter `grid_power_entity` can still be used to supply the grid icon in the *power view*, but the power value isn't used anymore. 
* **BREAKING.** Card parameter `grid_energy_entity` has been split into `grid_energy_consumption_entity` and `grid_energy_production_entity`.
  Both card parameters are required if you want to use the *energy view* and should have positive values.
  The combined parameter `grid_energy_entity` can still be used to supply the grid icon in the *energy view*, but the energy value isn't used anymore. 

## 0.0.5
### Fixes
* Switch from unpkg.com to unpkg-gcp.firebaseapp.com for broken lit-html dependency.

## 0.0.4
### New features
* New optional card parameters `solor_energy_entity`, `grid_energy_entity` and `home_energy_entity` to feed the new *energy view* of the wheel.
If you want to use the *energy view* the first two are required.
The third one for *home energy* will be calculated if omitted.
* A button to toggle between *power view* and the new *energy view*. The button is visible only when the *energy view* is available.
* A card parameter `initial_view` to set the initial view to *power view* or *energy view*. Valid values are `"power"` (default) and `"energy"`. 
* A card parameter `energy_decimals` to set the number of decimals used in the *energy view*.
### Improvements
* Rewrite of the code.
* Preparations in the code for showing values near arrows in a future release.
* A slightly better positioning of the icons.
* **BREAKING.** Renamed card parameter `decimals` to `power_decimals`.
* **BREAKING.** Renamed card parameter `solar_power_icon` to `solar_icon`.
* **BREAKING.** Renamed card parameter `grid_power_icon` to `grid_icon`.
* **BREAKING.** Renamed card parameter `home_power_icon` to `home_icon`.
* **BREAKING.** Renamed card parameter `color_power_icons` to `color_icons`.

## 0.0.3
### New features
* Added `color_power_icons` as optional boolean card parameter to color the power icons or not (=default). Yellow for consuming, green for producing.
With the new optional card parameters `consuming_color` and `producing_color` you can choose your own colors.
* Click on the power icons to open the more-info modals of your sensors.
* Support for [custom_updater](https://github.com/custom-components/custom_updater) custom component.
### Improvements
* Performance. Moved some code to run it only after config changes.
* Better syntax for 'Example requirements configuration' in readme.
* Icon for home power can also be set via `customize:` sensor settings now.

## 0.0.2
### New features
* Added `solar_power_icon` and `grid_power_icon` as optional card parameters.
* Added `decimals` as optional card parameter to display the power values in this number of decimals.
* Added `home_power_entity` as optional card parameter in case you already have a sensor for it and want to use it,
instead of letting the card calculate the value of it. 

## 0.0.1
### New features
* Calculates the current power that your home is consuming: home power.
  Input for the calculation is the (produced) solar power and the (consumed or produced) grid power.
* Displays the three power values (solar, grid and home) in 'a wheel'.
* Displays the transition between these powers as arrows.
  E.g. if your solar power panels produce power, the arrow from solar to home turns active.
  And if your solar power panels produce enough power to deliver some back to the grid, the arrow from solar to grid turns active.
* Works for default theme and custom themes that use [standard CSS vars](https://github.com/home-assistant/home-assistant-polymer/blob/master/src/resources/ha-style.js).
