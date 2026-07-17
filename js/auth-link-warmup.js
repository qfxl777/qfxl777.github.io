(function () {
  'use strict';

  var authOrigin = 'https://ssrcat.beer';
  var authDocument = authOrigin + '/index.php';
  var selector = '.hero-actions a[href*="ssrcat.beer/index.php#/login"], .hero-actions a[href*="ssrcat.beer/index.php#/register"], a.page-transition-link';
  var prefetched = false;
  var transitioning = false;
  var transitionDuration = 1320;

  function addHint(rel, href) {
    if (document.head.querySelector('link[rel="' + rel + '"][href="' + href + '"]')) return;
    var link = document.createElement('link');
    link.rel = rel;
    link.href = href;
    document.head.appendChild(link);
  }

  function prefetchAuthDocument() {
    if (prefetched) return;
    prefetched = true;

    var link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = authDocument;
    link.as = 'document';
    link.setAttribute('fetchpriority', 'low');
    document.head.appendChild(link);
  }

  function resetPageTransition() {
    transitioning = false;
    document.documentElement.classList.remove('auth-transition-lock');
    document.body.classList.remove('auth-transition-lock', 'auth-page-transition-visible', 'auth-page-transition-leaving');
    var particleLayer = document.querySelector('#home .black-hole-background');
    if (particleLayer) particleLayer.classList.remove('auth-page-transition');
  }

  function playPageTransition(event) {
    if (event.defaultPrevented || transitioning) return;
    if (event.button != null && event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    var link = event.currentTarget;
    var destination = link && link.href;
    if (!destination) return;

    event.preventDefault();
    transitioning = true;
    prefetchAuthDocument();

    var particleLayer = document.querySelector('#home .black-hole-background');
    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!particleLayer || reducedMotion) {
      window.setTimeout(function () { window.location.href = destination; }, reducedMotion ? 80 : 180);
      return;
    }

    document.documentElement.classList.add('auth-transition-lock');
    document.body.classList.add('auth-transition-lock');
    particleLayer.classList.add('auth-page-transition');
    particleLayer.getBoundingClientRect();

    window.requestAnimationFrame(function () {
      document.body.classList.add('auth-page-transition-visible');
    });

    window.setTimeout(function () {
      document.body.classList.add('auth-page-transition-leaving');
    }, transitionDuration - 260);

    window.setTimeout(function () {
      window.location.href = destination;
    }, transitionDuration);
  }

  addHint('dns-prefetch', '//ssrcat.beer');
  addHint('preconnect', authOrigin);

  window.addEventListener('load', function () {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(prefetchAuthDocument, { timeout: 1800 });
    } else {
      window.setTimeout(prefetchAuthDocument, 350);
    }
  }, { once: true });

  document.querySelectorAll(selector).forEach(function (link) {
    ['pointerenter', 'focus', 'touchstart', 'pointerdown'].forEach(function (eventName) {
      link.addEventListener(eventName, prefetchAuthDocument, { passive: true, once: true });
    });
    link.addEventListener('click', playPageTransition);
  });

  window.addEventListener('pageshow', resetPageTransition);
})();
