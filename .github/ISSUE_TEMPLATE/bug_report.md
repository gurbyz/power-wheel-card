---
name: Bug report
about: Create a report to help me improve. Please read the [wiki](https://github.com/gurbyz/custom-cards-lovelace/wiki/Before-submitting-an-issue-report) first.
title: ''
labels: ''
assignees: ''

---

**Which custom card does give you issues?**
power-wheel-card

**Which version of HA do you use?**

**Which version of the card do you use?**

**Describe the bug**
A clear and concise description of what the bug is. Paste evt. error messages.

**Configuration of the card**
Copy the complete configuration of the card, even if you think it isn't relevant.
```
  - type: "custom:power-wheel-card"
    solar_power_entity: sensor.solar_power
    ...etc...
```

**Dev console debug output**
Copy the complete output of the card that is logged to your dev console when the card is in *debug mode*.
To activate debug mode add `debug: true` to your card parameters. To open the developer console you can press F12 in most browsers.

Example: power-wheel-cardVersion: 0.0.10Lovelace resource: power-wheel-card.js?v=0.0.10HA version: 0.87.1Report issues here: ...etc...

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Additional context**
Add any other context about the problem here.
