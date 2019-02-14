suite('<power-wheel-card>', () => {
  let card;
  setup(() => {
    card = fixture('simple');
  });
  test('sets the "view" property from markup', () => {
    assert.equal(card.view, 'power');
  });
});
