(function () {
  'use strict';

  var button = document.querySelector('.navbar-toggler');
  var menu = document.getElementById('navbarCollapse');
  var themeButton = document.querySelector('.theme-toggle');
  var navRoot = button && button.closest('.smart-scroll');
  var closeTimer = 0;
  if (!button || !menu) return;

  function finishClosed() {
    menu.classList.remove('show', 'menu-closing');
    menu.style.setProperty('display', 'none', 'important');
    menu.style.setProperty('visibility', 'hidden', 'important');
    menu.style.setProperty('pointer-events', 'none', 'important');
  }

  function setMenu(open, animate) {
    // Bootstrap's collapse styles and the custom desktop animation can leave a
    // stale transition class/inline height behind after a quick toggle. Always
    // rebuild the visible state so a second click reliably opens the menu.
    menu.classList.remove('collapsing');
    menu.style.height = '';
    window.clearTimeout(closeTimer);

    if (open) {
      menu.classList.remove('menu-closing');
      menu.classList.remove('show');
      // Force the browser to commit the closed state before re-adding `show`.
      // This also guarantees that desktopMenuOpen restarts on every reopen.
      void menu.offsetWidth;
      menu.classList.add('show');
      menu.style.setProperty('display', desktopMenu.matches ? 'flex' : 'block', 'important');
      menu.style.setProperty('visibility', 'visible', 'important');
      menu.style.setProperty('pointer-events', 'auto', 'important');
    } else {
      if (animate && menu.classList.contains('show')) {
        // Keep the menu rendered while its closing keyframes run. Removing
        // display immediately is what previously made closing look abrupt.
        menu.classList.add('menu-closing');
        menu.style.setProperty('display', desktopMenu.matches ? 'flex' : 'block', 'important');
        menu.style.setProperty('visibility', 'visible', 'important');
        menu.style.setProperty('pointer-events', 'none', 'important');
        closeTimer = window.setTimeout(finishClosed, desktopMenu.matches ? 260 : 330);
      } else {
        finishClosed();
      }
    }

    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? '收起导航菜单' : '展开导航菜单');
  }

  var desktopMenu = window.matchMedia('(min-width: 768px)');

  function applyResponsiveDefault(event) {
    setMenu(event.matches, false);
  }

  button.addEventListener('click', function (event) {
    event.preventDefault();
    event.stopPropagation();

    // The page-load entrance belongs only to the initial hero reveal. Once the
    // visitor uses the menu, switch to the shorter interaction animation.
    if (navRoot) navRoot.classList.add('nav-menu-interacted');

    // aria-expanded is updated synchronously by setMenu and is therefore more
    // reliable than reading a class that another collapse handler may mutate.
    setMenu(button.getAttribute('aria-expanded') !== 'true', true);
  });

  menu.addEventListener('click', function (event) {
    if (!event.target.closest('a')) return;

    // Desktop navigation stays expanded after an anchor jump. Only the
    // mobile drawer should close when one of its links is selected.
    if (desktopMenu.matches) {
      setMenu(true, false);
    } else {
      setMenu(false, true);
    }
  });

  if (desktopMenu.addEventListener) {
    desktopMenu.addEventListener('change', applyResponsiveDefault);
  } else {
    desktopMenu.addListener(applyResponsiveDefault);
  }
  setMenu(desktopMenu.matches, false);

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
