(function () {
  'use strict';

  var row = document.querySelector('.hero-actions-row');
  if (!row) return;

  var buttons = row.querySelectorAll('.btn');
  var states = new WeakMap();
  var animationFrame = 0;

  buttons.forEach(function (button) {
    states.set(button, { x: 50, y: 50, targetX: 50, targetY: 50 });
  });

  function animate() {
    var moving = false;
    buttons.forEach(function (button) {
      var state = states.get(button);
      state.x += (state.targetX - state.x) * .13;
      state.y += (state.targetY - state.y) * .13;
      if (Math.abs(state.targetX - state.x) > .03 || Math.abs(state.targetY - state.y) > .03) moving = true;
      button.style.setProperty('--hero-button-light-x', state.x.toFixed(2) + '%');
      button.style.setProperty('--hero-button-light-y', state.y.toFixed(2) + '%');
    });
    animationFrame = moving ? window.requestAnimationFrame(animate) : 0;
  }

  function startAnimation() {
    if (!animationFrame) animationFrame = window.requestAnimationFrame(animate);
  }

  function reset(button) {
    var state = states.get(button);
    state.targetX = 50;
    state.targetY = 50;
    startAnimation();
  }

  row.addEventListener('pointermove', function (event) {
    if (event.pointerType === 'touch') return;
    var button = event.target.closest('.btn');
    if (!button || !row.contains(button)) return;

    var rect = button.getBoundingClientRect();
    var x = ((event.clientX - rect.left) / rect.width) * 100;
    var y = ((event.clientY - rect.top) / rect.height) * 100;
    var state = states.get(button);
    state.targetX = x;
    state.targetY = y;
    startAnimation();
  }, { passive: true });

  row.addEventListener('pointerleave', function () {
    buttons.forEach(reset);
  }, { passive: true });
})();
