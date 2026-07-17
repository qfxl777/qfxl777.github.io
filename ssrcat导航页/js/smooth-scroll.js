(function () {
  'use strict';

  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!finePointer || reduceMotion || !window.Lenis) return;

  window.SsrCatLenis = new Lenis({
    autoRaf: true,
    smoothWheel: true,
    syncTouch: false,
    lerp: .085,
    wheelMultiplier: .9,
    anchors: false
  });
})();
