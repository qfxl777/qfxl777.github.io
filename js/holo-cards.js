(function () {
  'use strict';

  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  var cards = document.querySelectorAll('.holo-card');
  var maxTiltX = 18;
  var maxTiltY = 22;

  function backgroundOffset(containerSize, imageSize, percent) {
    return (containerSize - imageSize) * percent / 100;
  }

  function updateBrandFilm(card, rect, x, y, fromCenterX, fromCenterY) {
    var brand = card.querySelector('.plan-card-top > span:first-child');
    if (!brand) return;

    var cardRect = rect || card.getBoundingClientRect();
    var brandRect = brand.getBoundingClientRect();
    var offsetX = brandRect.left - cardRect.left;
    var offsetY = brandRect.top - cardRect.top;
    var cardW = cardRect.width || 260;
    var cardH = cardRect.height || 364;
    var bgX = 50 - (fromCenterX || 0) * 68;
    var bgY = 50 - (fromCenterY || 0) * 68;

    card.style.setProperty('--brand-film-w', cardW.toFixed(2) + 'px');
    card.style.setProperty('--brand-film-h', cardH.toFixed(2) + 'px');
    card.style.setProperty('--brand-film-1-w', (cardW * 1.4).toFixed(2) + 'px');
    card.style.setProperty('--brand-film-1-h', (cardH * 1.4).toFixed(2) + 'px');
    card.style.setProperty('--brand-film-2-w', (cardW * 1.9).toFixed(2) + 'px');
    card.style.setProperty('--brand-film-2-h', (cardH * 1.9).toFixed(2) + 'px');
    card.style.setProperty('--brand-film-3-w', (cardW * 1.5).toFixed(2) + 'px');
    card.style.setProperty('--brand-film-3-h', (cardH * 1.5).toFixed(2) + 'px');
    card.style.setProperty('--brand-film-x', offsetX.toFixed(2) + 'px');
    card.style.setProperty('--brand-film-y', offsetY.toFixed(2) + 'px');
    card.style.setProperty('--brand-film-base-x', (-offsetX).toFixed(2) + 'px');
    card.style.setProperty('--brand-film-base-y', (-offsetY).toFixed(2) + 'px');
    card.style.setProperty('--brand-film-1-x', (backgroundOffset(cardW, cardW * 1.4, bgX) - offsetX).toFixed(2) + 'px');
    card.style.setProperty('--brand-film-1-y', (backgroundOffset(cardH, cardH * 1.4, bgY) - offsetY).toFixed(2) + 'px');
    card.style.setProperty('--brand-film-2-x', (backgroundOffset(cardW, cardW * 1.9, x) - offsetX).toFixed(2) + 'px');
    card.style.setProperty('--brand-film-2-y', (backgroundOffset(cardH, cardH * 1.9, y) - offsetY).toFixed(2) + 'px');
    card.style.setProperty('--brand-film-3-x', (backgroundOffset(cardW, cardW * 1.5, 100 - x) - offsetX).toFixed(2) + 'px');
    card.style.setProperty('--brand-film-3-y', (backgroundOffset(cardH, cardH * 1.5, 100 - y) - offsetY).toFixed(2) + 'px');
  }

  function smoothstep(value) {
    return value * value * (3 - 2 * value);
  }

  function getSurfaceGlareFromPoint(x, y) {
    var fromCenterX = (x - 50) / 50;
    var fromCenterY = (y - 50) / 50;
    var distance = Math.min(1, Math.sqrt(fromCenterX * fromCenterX + fromCenterY * fromCenterY));
    var deadZone = .16;
    var normalized = Math.max(0, (distance - deadZone) / (1 - deadZone));
    var eased = smoothstep(normalized);

    return {
      x: x,
      y: y,
      fromCenter: eased,
      glareOpacity: eased * .42,
      shineOpacity: eased * .28
    };
  }

  function applySurfaceGlare(card, glare) {
    var x = glare.x;
    var y = glare.y;
    var glareOpacity = glare.glareOpacity || 0;
    var shineOpacity = glare.shineOpacity || 0;
    var fromCenter = glare.fromCenter || 0;

    card.style.setProperty('--surface-glare-x', x.toFixed(2) + '%');
    card.style.setProperty('--surface-glare-y', y.toFixed(2) + '%');
    card.style.setProperty('--surface-glare-opacity', glareOpacity.toFixed(3));
    card.style.setProperty('--surface-shine-opacity', shineOpacity.toFixed(3));
    card.style.setProperty('--surface-from-center', fromCenter.toFixed(3));

    /* Keep the old variable names alive for smaller masked brand details. */
    card.style.setProperty('--surface-highlight-x', x.toFixed(2) + '%');
    card.style.setProperty('--surface-highlight-y', y.toFixed(2) + '%');
    card.style.setProperty('--surface-highlight-opacity', glareOpacity.toFixed(3));
  }

  function updateSurfaceHighlight(card, x, y) {
    applySurfaceGlare(card, getSurfaceGlareFromPoint(x, y));
  }

  function getSurfaceShadowFromTilt(rotateX, rotateY) {
    var tiltX = Math.max(-1, Math.min(1, -rotateY / maxTiltY));
    var tiltY = Math.max(-1, Math.min(1, rotateX / maxTiltX));
    var distance = Math.min(1, Math.sqrt(tiltX * tiltX + tiltY * tiltY));
    var deadZone = .12;
    var normalized = Math.max(0, (distance - deadZone) / (1 - deadZone));
    var eased = normalized * normalized * (3 - 2 * normalized);
    var shadowX = 50 - tiltX * 54;
    var shadowY = 50 - tiltY * 54;
    var angle = Math.atan2(shadowY - 50, shadowX - 50) * 180 / Math.PI + 90;
    var shadowOpacity = eased * .72;

    return {
      x: shadowX,
      y: shadowY,
      angle: angle,
      opacity: shadowOpacity
    };
  }

  function applySurfaceShadow(card, shadow) {
    card.style.setProperty('--surface-shadow-x', shadow.x.toFixed(2) + '%');
    card.style.setProperty('--surface-shadow-y', shadow.y.toFixed(2) + '%');
    card.style.setProperty('--surface-shadow-angle', shadow.angle.toFixed(2) + 'deg');
    card.style.setProperty('--surface-shadow-opacity', shadow.opacity.toFixed(3));
  }

  function updateSurfaceShadowFromTilt(card, rotateX, rotateY) {
    applySurfaceShadow(card, getSurfaceShadowFromTilt(rotateX, rotateY));
  }

  function prepareCard(card) {
    updateBrandFilm(card, null, 50, 50, 0, 0);
    updateSurfaceHighlight(card, 50, 50);
    updateSurfaceShadowFromTilt(card, 0, 0);
  }

  window.addEventListener('resize', function () {
    document.querySelectorAll('.holo-card').forEach(function (card) {
      prepareCard(card);
    });
  }, { passive: true });

  function bindTouchCard(card) {
    if (card.dataset.ssrcatHoloBound) return;
    card.dataset.ssrcatHoloBound = 'touch';

    var tapTimer;
    card.addEventListener('pointerdown', function (event) {
      var rect = card.getBoundingClientRect();
      var x = (event.clientX - rect.left) / rect.width * 100;
      var y = (event.clientY - rect.top) / rect.height * 100;
      var fromCenterX = (x - 50) / 50;
      var fromCenterY = (y - 50) / 50;
      card.style.setProperty('--pointer-x', x.toFixed(2) + '%');
      card.style.setProperty('--pointer-y', y.toFixed(2) + '%');
      card.style.setProperty('--background-x', (50 - fromCenterX * 68).toFixed(2) + '%');
      card.style.setProperty('--background-y', (50 - fromCenterY * 68).toFixed(2) + '%');
      updateSurfaceHighlight(card, x, y);
      updateSurfaceShadowFromTilt(card, fromCenterY * maxTiltX, fromCenterX * -maxTiltY);
      updateBrandFilm(card, rect, x, y, fromCenterX, fromCenterY);
      window.clearTimeout(tapTimer);
      card.classList.add('is-holo-tap');
      tapTimer = window.setTimeout(function () {
        card.classList.remove('is-holo-tap');
      }, 500);
    }, { passive: true });
  }

  function bindFinePointerCard(card) {
    if (card.dataset.ssrcatHoloBound) return;
    card.dataset.ssrcatHoloBound = 'fine';

    var tiltHost = card.closest('.pricing-tilt');

    var computed = window.getComputedStyle(card);
    var baseScale = parseFloat(computed.getPropertyValue('--base-scale')) || 1;
    var hoverScale = parseFloat(computed.getPropertyValue('--hover-scale')) || 1.025;
    var activeRect = null;
    var releaseTimer = null;
    var state = {
      rx: 0, ry: 0, vx: 0, vy: 0,
      sx: 50, sy: 50, sa: 215, so: 0,
      gx: 50, gy: 50, go: 0, gs: 0, gc: 0,
      scale: baseScale, scaleVelocity: 0,
      desiredRX: 0, desiredRY: 0,
      desiredGX: 50, desiredGY: 50, desiredGO: 0, desiredGS: 0, desiredGC: 0,
      targetRX: 0, targetRY: 0, targetScale: baseScale,
      active: false, returning: false, running: false
    };

    function setDesiredGlare(x, y) {
      var glare = getSurfaceGlareFromPoint(x, y);
      state.desiredGX = glare.x;
      state.desiredGY = glare.y;
      state.desiredGO = glare.glareOpacity;
      state.desiredGS = glare.shineOpacity;
      state.desiredGC = glare.fromCenter;
    }

    function render() {
      /* Tracking feels weighted; release uses a much softer spring so the
         last tilt decays naturally over roughly 1–2 seconds. */
      var stiffness = state.returning ? .028 : .085;
      var damping = state.returning ? .86 : .74;
      var scaleStiffness = state.returning ? .025 : .075;
      var scaleDamping = state.returning ? .85 : .72;
      var targetEase = state.returning ? .075 : .16;

      state.targetRX += (state.desiredRX - state.targetRX) * targetEase;
      state.targetRY += (state.desiredRY - state.targetRY) * targetEase;

      state.vx = (state.vx + (state.targetRX - state.rx) * stiffness) * damping;
      state.vy = (state.vy + (state.targetRY - state.ry) * stiffness) * damping;
      state.rx += state.vx;
      state.ry += state.vy;

      state.scaleVelocity = (state.scaleVelocity + (state.targetScale - state.scale) * scaleStiffness) * scaleDamping;
      state.scale += state.scaleVelocity;

      card.style.setProperty('--rotate-x', state.rx.toFixed(3) + 'deg');
      card.style.setProperty('--rotate-y', state.ry.toFixed(3) + 'deg');
      card.style.setProperty('--current-scale', state.scale.toFixed(4));

      var targetShadow = getSurfaceShadowFromTilt(state.rx, state.ry);
      var shadowEase = state.returning ? .055 : .095;
      if (targetShadow.opacity < .025 && state.so < .04) {
        targetShadow.angle = state.sa;
      }
      var angleDelta = ((targetShadow.angle - state.sa + 540) % 360) - 180;
      state.sx += (targetShadow.x - state.sx) * shadowEase;
      state.sy += (targetShadow.y - state.sy) * shadowEase;
      state.sa += angleDelta * shadowEase;
      state.so += (targetShadow.opacity - state.so) * shadowEase;
      applySurfaceShadow(card, {
        x: state.sx,
        y: state.sy,
        angle: state.sa,
        opacity: state.so
      });

      var glareEase = state.returning ? .065 : .135;
      state.gx += (state.desiredGX - state.gx) * glareEase;
      state.gy += (state.desiredGY - state.gy) * glareEase;
      state.go += (state.desiredGO - state.go) * glareEase;
      state.gs += (state.desiredGS - state.gs) * glareEase;
      state.gc += (state.desiredGC - state.gc) * glareEase;
      applySurfaceGlare(card, {
        x: state.gx,
        y: state.gy,
        glareOpacity: state.go,
        shineOpacity: state.gs,
        fromCenter: state.gc
      });

      var moving = Math.abs(state.desiredRX - state.targetRX) > .008 ||
        Math.abs(state.desiredRY - state.targetRY) > .008 ||
        Math.abs(state.targetRX - state.rx) > .008 ||
        Math.abs(state.targetRY - state.ry) > .008 ||
        Math.abs(state.vx) > .008 || Math.abs(state.vy) > .008 ||
        Math.abs(state.targetScale - state.scale) > .0002 ||
        Math.abs(state.scaleVelocity) > .0002 ||
        Math.abs(targetShadow.x - state.sx) > .02 ||
        Math.abs(targetShadow.y - state.sy) > .02 ||
        Math.abs(angleDelta) > .02 ||
        Math.abs(targetShadow.opacity - state.so) > .001 ||
        Math.abs(state.desiredGX - state.gx) > .03 ||
        Math.abs(state.desiredGY - state.gy) > .03 ||
        Math.abs(state.desiredGO - state.go) > .001 ||
        Math.abs(state.desiredGS - state.gs) > .001 ||
        Math.abs(state.desiredGC - state.gc) > .001;

      if (moving) {
        window.requestAnimationFrame(render);
      } else {
        state.targetRX = state.desiredRX;
        state.targetRY = state.desiredRY;
        state.rx = state.targetRX;
        state.ry = state.targetRY;
        state.scale = state.targetScale;
        state.returning = false;
        state.running = false;
      }
    }

    function startSpring() {
      if (state.running) return;
      state.running = true;
      window.requestAnimationFrame(render);
    }

    card.addEventListener('pointerenter', function () {
      window.clearTimeout(releaseTimer);
      /* Keep one untransformed coordinate space for the whole hover session.
         Re-reading the tilted bounds on every frame creates a feedback jitter. */
      activeRect = card.getBoundingClientRect();
      state.active = true;
      state.returning = false;
      state.desiredRX = state.targetRX;
      state.desiredRY = state.targetRY;
      state.targetScale = hoverScale;
      card.classList.add('is-holo-active');
      if (tiltHost) tiltHost.classList.add('is-holo-host-active');
      setDesiredGlare(50, 50);
      updateSurfaceShadowFromTilt(card, state.rx, state.ry);
      updateBrandFilm(card, activeRect, 50, 50, 0, 0);
      startSpring();
    });

    card.addEventListener('pointermove', function (event) {
      var rect = activeRect || card.getBoundingClientRect();
      var x = Math.max(0, Math.min(100, (event.clientX - rect.left) / rect.width * 100));
      var y = Math.max(0, Math.min(100, (event.clientY - rect.top) / rect.height * 100));
      var fromCenterX = (x - 50) / 50;
      var fromCenterY = (y - 50) / 50;

      state.returning = false;
      /* Lift the side under the pointer toward the viewer. */
      state.desiredRX = fromCenterY * maxTiltX;
      state.desiredRY = fromCenterX * -maxTiltY;

      card.style.setProperty('--pointer-x', x.toFixed(2) + '%');
      card.style.setProperty('--pointer-y', y.toFixed(2) + '%');
      card.style.setProperty('--background-x', (50 - fromCenterX * 68).toFixed(2) + '%');
      card.style.setProperty('--background-y', (50 - fromCenterY * 68).toFixed(2) + '%');
      card.style.setProperty('--shadow-x', (fromCenterX * -13).toFixed(2) + 'px');
      card.style.setProperty('--shadow-y', (22 + fromCenterY * -8).toFixed(2) + 'px');
      setDesiredGlare(x, y);
      updateBrandFilm(card, rect, x, y, fromCenterX, fromCenterY);
      startSpring();
    }, { passive: true });

    card.addEventListener('pointerleave', function () {
      activeRect = null;
      state.active = false;
      card.classList.remove('is-holo-active');
      if (tiltHost) tiltHost.classList.remove('is-holo-host-active');
      card.style.setProperty('--pointer-x', '50%');
      card.style.setProperty('--pointer-y', '50%');
      card.style.setProperty('--background-x', '50%');
      card.style.setProperty('--background-y', '50%');
      card.style.setProperty('--shadow-x', '0px');
      card.style.setProperty('--shadow-y', '18px');
      setDesiredGlare(50, 50);
      updateBrandFilm(card, card.getBoundingClientRect(), 50, 50, 0, 0);
      window.clearTimeout(releaseTimer);
      releaseTimer = window.setTimeout(function () {
        if (state.active) return;
        state.returning = true;
        state.desiredRX = 0;
        state.desiredRY = 0;
        state.targetScale = baseScale;
        startSpring();
      }, 140);
    });
  }

  function initCard(card) {
    if (!card) return;
    prepareCard(card);
    if (!finePointer) {
      bindTouchCard(card);
      return;
    }
    bindFinePointerCard(card);
  }

  var api = {
    initCard: initCard,
    refreshCard: prepareCard
  };
  window.SsrCatHoloCards = api;
  document.ssrcatHoloCards = api;

  document.addEventListener('ssrcat:init-holo-card', function (event) {
    var card = event.detail && event.detail.card;
    initCard(card);
  });

  cards.forEach(function (card) {
    initCard(card);
  });
})();
