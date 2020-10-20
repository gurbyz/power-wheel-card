// Part of testing for #64: could lazy loading of HA be the culprit?

const preloadCard = type => window.loadCardHelpers()
  .then(({ createCardElement }) => createCardElement({type}))

preloadCard("custom:power-wheel-card");
