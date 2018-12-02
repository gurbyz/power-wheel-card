Changelog
====

## 0.0.2
### New features
* Added `solar_power_icon` and `grid_power_icon` as card options.

## 0.0.1
### New features
* Calculates the current power that your home is consuming: home power.
  Input for the calculation is the (produced) solar power and the (consumed or produced) grid power.
* Displays the three power values (solar, grid and home) in 'a wheel'.
* Displays the transition between these powers as arrows.
  E.g. if your solar power panels produce power, the arrow from solar to home turns active.
  And if your solar power panels produce enough power to deliver some back to the grid, the arrow from solar to grid turns active.
* Works for default theme and custom themes that use [standard CSS vars](https://github.com/home-assistant/home-assistant-polymer/blob/master/src/resources/ha-style.js).
