(function () {
  'use strict';

  var root = document.documentElement;

  function usePointerMode() {
    root.classList.remove('keyboard-navigation');
  }

  function useKeyboardMode(event) {
    if (event.key === 'Tab' || event.key.indexOf('Arrow') === 0) {
      root.classList.add('keyboard-navigation');
    }
  }

  document.addEventListener('keydown', useKeyboardMode, true);
  document.addEventListener('pointerdown', usePointerMode, true);
  document.addEventListener('mousedown', usePointerMode, true);
  document.addEventListener('touchstart', usePointerMode, { capture: true, passive: true });
}());
