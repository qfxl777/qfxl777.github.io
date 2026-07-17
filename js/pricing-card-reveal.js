(function () {
  'use strict';

  var pricing = document.getElementById('pricing');
  if (!pricing) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('pricing-card-reveal-ready');

  function reveal() {
    pricing.classList.add('is-cards-revealed');
  }

  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveal();
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    if (!entries[0].isIntersecting) return;
    reveal();
    observer.disconnect();
  }, { threshold: .16, rootMargin: '0px 0px -10% 0px' });

  observer.observe(pricing);
})();
