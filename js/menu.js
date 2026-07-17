(function () {
  'use strict';

  var button = document.querySelector('.navbar-toggler');
  var menu = document.getElementById('navbarCollapse');
  var themeButton = document.querySelector('.theme-toggle');
  if (!button || !menu) return;

  function setMenu(open) {
    menu.classList.remove('collapsing');
    menu.style.height = '';
    menu.classList.toggle('show', open);
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? '收起导航菜单' : '展开导航菜单');
  }

  var desktopMenu = window.matchMedia('(min-width: 768px)');

  function applyResponsiveDefault(event) {
    setMenu(event.matches);
  }

  button.addEventListener('click', function () {
    setMenu(!menu.classList.contains('show'));
  });

  menu.addEventListener('click', function (event) {
    if (!event.target.closest('a')) return;

    // Desktop navigation stays expanded after an anchor jump. Only the
    // mobile drawer should close when one of its links is selected.
    if (desktopMenu.matches) {
      setMenu(true);
    } else {
      setMenu(false);
    }
  });

  if (desktopMenu.addEventListener) {
    desktopMenu.addEventListener('change', applyResponsiveDefault);
  } else {
    desktopMenu.addListener(applyResponsiveDefault);
  }
  setMenu(desktopMenu.matches);

  if (themeButton) {
    themeButton.addEventListener('click', function () {
      if (themeButton.dataset.transitioning === 'true') return;

      var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var nextDayMode = !document.documentElement.classList.contains('theme-day');

      function commitTheme() {
        document.documentElement.classList.toggle('theme-day', nextDayMode);
        themeButton.setAttribute('aria-pressed', String(nextDayMode));
        themeButton.setAttribute('aria-label', nextDayMode ? '切换到黑夜模式' : '切换到白天模式');
      }

      if (reduceMotion || typeof Element.prototype.animate !== 'function') {
        commitTheme();
        return;
      }

      themeButton.dataset.transitioning = 'true';
      var rect = themeButton.getBoundingClientRect();
      var originX = rect.left + rect.width / 2;
      var originY = rect.top + rect.height / 2;
      var radius = Math.hypot(
        Math.max(originX, window.innerWidth - originX),
        Math.max(originY, window.innerHeight - originY)
      );

      var mask = document.createElement('div');
      mask.className = 'theme-circle-mask';
      mask.style.left = originX + 'px';
      mask.style.top = originY + 'px';
      document.body.appendChild(mask);

      var animation = mask.animate([
        { transform: 'translate(-50%, -50%) scale(0)' },
        { transform: 'translate(-50%, -50%) scale(' + (radius / 10 + 2) + ')' }
      ], {
        duration: 720,
        easing: 'cubic-bezier(.76, 0, .24, 1)',
        fill: 'forwards'
      });

      animation.onfinish = function () {
        commitTheme();
        mask.remove();
        delete themeButton.dataset.transitioning;
      };

      animation.oncancel = function () {
        mask.remove();
        delete themeButton.dataset.transitioning;
      };
    });
  }
})();
