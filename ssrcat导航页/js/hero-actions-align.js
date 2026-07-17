(function () {
  'use strict';

  var home = document.getElementById('home');
  var title = home && home.querySelector('.title');
  var actions = home && home.querySelector('.hero-actions');
  if (!home || !title || !actions) return;

  var frame = 0;

  function syncWidth() {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(function () {
      var width = Math.round(title.offsetWidth);
      if (width > 0) actions.style.setProperty('--hero-actions-width', width + 'px');
    });
  }

  if ('ResizeObserver' in window) {
    var observer = new ResizeObserver(syncWidth);
    observer.observe(title);
  }

  window.addEventListener('resize', syncWidth, { passive: true });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(syncWidth);
  }

  syncWidth();
})();
