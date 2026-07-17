(function () {
  'use strict';

  var host = document.querySelector('#home .black-hole-background');
  if (!host) return;

  var backCanvas = host.querySelector('.black-hole-canvas-back');
  var frontCanvas = host.querySelector('.black-hole-canvas-front');
  var centerLogo = host.querySelector('.black-hole-center-logo');
  var back = backCanvas && backCanvas.getContext('2d');
  var front = frontCanvas && frontCanvas.getContext('2d');
  if (!back || !front) return;

  var config = {
    showCenter: false,
    voidRadius: 40,
    centerX: 50,
    centerY: 30,
    particleCount: 500,
    particleSize: 5,
    colors: ['#ffffff', '#FFE052', '#FF9B3A', '#6C73FF', '#70FFF4', '#FF97F6', '#F8FF3A', '#84C9FF', '#AFFF52'],
    outerRadius: 100,
    orbitSpeed: .8,
    pullSpeed: 0,
    trail: 0,
    tilt: 18,
    tiltSideway: 193,
    logoScale: 145,
    logoOffsetX: 0,
    logoOffsetY: 0,
    logoOpacity: 100,
    logoRotation: 0,
    logoParticleSpread: 26,
    logoParticleSize: .8,
    logoFadeToParticles: 550,
    logoFadeToImage: 820,
    arcRadius: 180,
    arcLength: 30,
    arcSegments: 16,
    arcBrightness: 1.5,
    arcWidth: .9,
    arcFadeIn: 400,
    arcFadeOut: 800,
    perspective: 1300
  };

  var particles = [];
  var size = { width: 0, height: 0, dpr: 1 };
  var animationFrame = 0;
  var lastTime = performance.now();
  var isVisible = true;
  var home = document.getElementById('home');
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var introDuration = window.matchMedia && window.matchMedia('(max-width: 767.98px)').matches ? 1600 : 2100;
  var introStartTime = performance.now();
  var introActive = !reducedMotion;
  var introRaw = introActive ? 0 : 1;
  var introEase = introActive ? 0 : 1;
  var logoParticles = [];
  var logoHovering = false;
  var logoPinnedParticles = false;
  var logoHoverSuppressed = false;
  var logoProgress = 0;
  var pointerFlow = {
    x: 0,
    y: 0,
    lastX: 0,
    lastY: 0,
    vx: 0,
    vy: 0,
    targetVX: 0,
    targetVY: 0,
    lastMove: 0,
    initialized: false,
    inside: false
  };

  function syncCenterLogo() {
    host.style.setProperty('--bh-center-x', config.centerX + '%');
    host.style.setProperty('--bh-center-y', config.centerY + '%');
    host.style.setProperty('--bh-logo-size', Math.max(10, config.voidRadius * config.logoScale / 100) + 'px');
    host.style.setProperty('--bh-logo-offset-x', config.logoOffsetX + 'px');
    host.style.setProperty('--bh-logo-offset-y', config.logoOffsetY + 'px');
    host.style.setProperty('--bh-logo-opacity', Math.max(0, Math.min(100, config.logoOpacity)) / 100);
    host.style.setProperty('--bh-logo-rotation', config.logoRotation + 'deg');
  }

  function outerRadius() {
    return config.voidRadius + (config.outerRadius / 100) * (size.width / 2 - config.voidRadius);
  }

  function seedParticles() {
    var outer = outerRadius();
    particles = [];
    for (var i = 0; i < config.particleCount; i += 1) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        radius: config.voidRadius + Math.pow(Math.random(), 2) * (outer - config.voidRadius),
        height: (Math.random() - .5) * 16,
        speedOffset: .75 + Math.random() * .5,
        colorIdx: Math.floor(Math.random() * config.colors.length),
        introOffset: .58 + Math.random() * .82,
        arcGlow: 0
      });
    }
  }

  function seedLogoParticles() {
    if (!centerLogo || !centerLogo.complete || !centerLogo.naturalWidth) return;
    var sampleSize = 132;
    var sample = document.createElement('canvas');
    sample.width = sampleSize;
    sample.height = sampleSize;
    var sampleContext = sample.getContext('2d', { willReadFrequently: true });
    sampleContext.clearRect(0, 0, sampleSize, sampleSize);
    sampleContext.drawImage(centerLogo, 0, 0, sampleSize, sampleSize);
    var pixels = sampleContext.getImageData(0, 0, sampleSize, sampleSize).data;
    var result = [];

    for (var y = 0; y < sampleSize; y += 3) {
      for (var x = 0; x < sampleSize; x += 3) {
        var index = (y * sampleSize + x) * 4;
        if (pixels[index + 3] < 72) continue;
        var nx = (x - sampleSize / 2) / sampleSize;
        var ny = (y - sampleSize / 2) / sampleSize;
        result.push({
          nx: nx,
          ny: ny,
          angle: Math.atan2(ny, nx),
          phase: Math.random() * Math.PI * 2,
          spread: .35 + Math.random() * .65,
          size: .72 + Math.random() * .7,
          colorIdx: Math.floor(Math.random() * config.colors.length)
        });
      }
    }
    logoParticles = result;
  }

  function resize() {
    var rect = host.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    size.width = Math.max(1, rect.width);
    size.height = Math.max(1, rect.height);
    size.dpr = dpr;

    [backCanvas, frontCanvas].forEach(function (canvas) {
      canvas.width = Math.round(size.width * dpr);
      canvas.height = Math.round(size.height * dpr);
      canvas.style.width = size.width + 'px';
      canvas.style.height = size.height + 'px';
    });
    seedParticles();
  }

  function fadeContext(context) {
    context.setTransform(size.dpr, 0, 0, size.dpr, 0, 0);
    context.globalAlpha = 1;
    context.globalCompositeOperation = 'destination-out';
    var trailAlpha = Math.max(.02, 1 - (Math.max(0, config.trail) / 50) * .98);
    context.fillStyle = 'rgba(0,0,0,' + trailAlpha + ')';
    context.fillRect(0, 0, size.width, size.height);
    context.globalCompositeOperation = 'source-over';
  }

  function drawParticles(context, list) {
    for (var i = 0; i < list.length; i += 1) {
      var particle = list[i];
      context.fillStyle = particle.color;
      if (particle.glow > .01 && particle.trailPoints && particle.trailPoints.length > 1) {
        context.strokeStyle = particle.color;
        context.lineCap = 'round';
        context.lineJoin = 'round';

        for (var trailIndex = 1; trailIndex < particle.trailPoints.length; trailIndex += 1) {
          var trailProgress = trailIndex / (particle.trailPoints.length - 1);
          var from = particle.trailPoints[trailIndex - 1];
          var to = particle.trailPoints[trailIndex];
          var segmentAlpha = (1 - trailProgress) * particle.alpha * particle.glow * config.arcBrightness;

          context.globalAlpha = segmentAlpha * .16;
          context.lineWidth = Math.max(.5, particle.size * config.arcWidth * 2.8 * (1 - trailProgress * .38));
          context.beginPath();
          context.moveTo(from.x, from.y);
          context.lineTo(to.x, to.y);
          context.stroke();

          context.globalAlpha = segmentAlpha * .72;
          context.lineWidth = Math.max(.28, particle.size * config.arcWidth * (1 - trailProgress * .48));
          context.beginPath();
          context.moveTo(from.x, from.y);
          context.lineTo(to.x, to.y);
          context.stroke();
        }
      }
      if (particle.glow > .01) {
        context.globalAlpha = particle.alpha * particle.glow * .1 * config.arcBrightness;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size * (2.2 + particle.glow), 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = Math.min(1, particle.alpha + particle.glow * .2);
      context.beginPath();
      context.arc(particle.x, particle.y, particle.size * (1 + particle.glow * .12), 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;
  }

  function projectOrbitPoint(point, angle, cx, cy, cosTilt, sinTilt, cosSide, sinSide, radiusOverride) {
    var radius = Number.isFinite(radiusOverride) ? radiusOverride : point.radius;
    var xBase = radius * Math.cos(angle);
    var yBase = point.height;
    var zBase = radius * Math.sin(angle);
    var yTilted = yBase * cosTilt + zBase * sinTilt;
    var zTilted = -yBase * sinTilt + zBase * cosTilt;
    var x3d = xBase * cosSide - yTilted * sinSide;
    var y3d = xBase * sinSide + yTilted * cosSide;
    var projectionScale = config.perspective / (config.perspective + zTilted);
    return {
      x: cx + x3d * projectionScale,
      y: cy + y3d * projectionScale,
      z: zTilted,
      scale: projectionScale
    };
  }

  function drawVoid(cx, cy) {
    var radius = config.voidRadius;
    var sphere = back.createRadialGradient(
      cx - radius * .25,
      cy - radius * .3,
      radius * .05,
      cx,
      cy,
      radius
    );
    sphere.addColorStop(0, 'rgba(8,8,8,1)');
    sphere.addColorStop(.65, 'rgba(0,0,0,1)');
    sphere.addColorStop(.92, 'rgba(18,18,18,1)');
    sphere.addColorStop(1, 'rgba(18,18,18,.9)');
    back.fillStyle = sphere;
    back.beginPath();
    back.arc(cx, cy, radius, 0, Math.PI * 2);
    back.fill();

    var rim = back.createRadialGradient(cx, cy, radius * .88, cx, cy, radius * 1.03);
    rim.addColorStop(0, 'rgba(255,255,255,0)');
    rim.addColorStop(.66, 'rgba(210,220,220,.06)');
    rim.addColorStop(.86, 'rgba(210,220,220,.14)');
    rim.addColorStop(1, 'rgba(210,220,220,0)');
    back.fillStyle = rim;
    back.beginPath();
    back.arc(cx, cy, radius * 1.03, 0, Math.PI * 2);
    back.fill();
  }

  function drawLogoParticleState(now, cx, cy, delta) {
    if (!centerLogo || !logoParticles.length) return;
    var target = logoPinnedParticles || (logoHovering && !logoHoverSuppressed) ? 1 : 0;
    var introImageOpacity = 1;

    if (introActive) {
      var logoParticleIn = smoothstep(.16, .42, introRaw);
      var logoParticleOut = 1 - smoothstep(.56, .8, introRaw);
      logoProgress = logoParticleIn * logoParticleOut;
      introImageOpacity = smoothstep(.55, .82, introRaw);
    } else {
      var fadeDuration = target ? config.logoFadeToParticles : config.logoFadeToImage;
      var fadeEase = 1 - Math.exp(-(delta * 16.667 * 4.6) / Math.max(120, fadeDuration));
      logoProgress += (target - logoProgress) * fadeEase;
      if (Math.abs(target - logoProgress) < .002) logoProgress = target;
    }

    var baseOpacity = Math.max(0, Math.min(100, config.logoOpacity)) / 100;
    centerLogo.style.opacity = String(baseOpacity * introImageOpacity * (1 - logoProgress));
    if (logoProgress < .01) return;

    var logoSize = Math.max(10, config.voidRadius * config.logoScale / 100);
    var offsetX = config.logoOffsetX;
    var offsetY = config.logoOffsetY;
    var rotation = config.logoRotation * Math.PI / 180;
    var cosRotation = Math.cos(rotation);
    var sinRotation = Math.sin(rotation);
    var spread = config.logoParticleSpread * logoProgress * (introActive ? .2 : 1);

    for (var i = 0; i < logoParticles.length; i += 1) {
      var point = logoParticles[i];
      var localX = point.nx * logoSize;
      var localY = point.ny * logoSize;
      var rotatedX = localX * cosRotation - localY * sinRotation;
      var rotatedY = localX * sinRotation + localY * cosRotation;
      var pulse = Math.sin(now * .002 + point.phase) * spread * .22;
      var drift = spread * point.spread;
      var x = cx + offsetX + rotatedX * (1 + logoProgress * .08) + Math.cos(point.angle + point.phase) * drift + pulse;
      var y = cy + offsetY + rotatedY * (1 + logoProgress * .08) + Math.sin(point.angle + point.phase) * drift + pulse * .65;

      front.globalAlpha = Math.min(1, logoProgress * 1.3) * (.58 + point.spread * .42);
      front.fillStyle = config.colors[point.colorIdx % config.colors.length];
      front.beginPath();
      front.arc(x, y, Math.max(.35, config.logoParticleSize * point.size), 0, Math.PI * 2);
      front.fill();
    }
    front.globalAlpha = 1;
  }

  function smoothstep(from, to, value) {
    if (to === from) return value >= to ? 1 : 0;
    var progress = Math.max(0, Math.min(1, (value - from) / (to - from)));
    return progress * progress * (3 - 2 * progress);
  }

  function drawIntroPulse(cx, cy) {
    if (!introActive || introRaw < .64 || introRaw > .96) return;
    var pulse = smoothstep(.64, .76, introRaw) * (1 - smoothstep(.78, .96, introRaw));
    var logoSize = Math.max(10, config.voidRadius * config.logoScale / 100);
    var radius = logoSize * (.52 + smoothstep(.64, .96, introRaw) * .9);
    front.save();
    front.globalAlpha = pulse * .24;
    front.strokeStyle = 'rgba(112,255,244,.9)';
    front.lineWidth = Math.max(.7, logoSize * .018);
    front.beginPath();
    front.arc(cx + config.logoOffsetX, cy + config.logoOffsetY, radius, 0, Math.PI * 2);
    front.stroke();
    front.restore();
  }

  function render(now) {
    animationFrame = requestAnimationFrame(render);
    if (!isVisible || document.hidden || !size.width) return;

    var delta = Math.min((now - lastTime) / 16.667, 3);
    lastTime = now;

    if (introActive) {
      introRaw = Math.max(0, Math.min(1, (now - introStartTime) / introDuration));
      introEase = 1 - Math.pow(1 - introRaw, 3);
      if (introRaw >= 1) {
        introActive = false;
        introRaw = 1;
        introEase = 1;
        home.classList.remove('hero-intro-active');
        home.dispatchEvent(new CustomEvent('ssrcat:hero-intro-complete'));
      }
    }

    fadeContext(back);
    fadeContext(front);

    var cx = size.width * (config.centerX / 100);
    var cy = size.height * (config.centerY / 100);
    var outer = outerRadius();
    var background = [];
    var foreground = [];
    var tilt = config.tilt * Math.PI / 180;
    var sideway = config.tiltSideway * Math.PI / 180;
    var cosTilt = Math.cos(tilt);
    var sinTilt = Math.sin(tilt);
    var cosSide = Math.cos(sideway);
    var sinSide = Math.sin(sideway);
    var particleSize = .5 + (Math.max(1, Math.min(50, config.particleSize)) - 1) * (4 / 49);
    var introParticleOpacity = introActive ? .04 + .96 * smoothstep(.04, .68, introRaw) : 1;

    for (var i = 0; i < particles.length; i += 1) {
      var point = particles[i];
      var speedFactor = Math.sqrt(config.voidRadius / Math.max(point.radius, 10));
      point.angle += config.orbitSpeed * speedFactor * point.speedOffset * .012 * delta;
      point.radius -= (Math.max(0, config.pullSpeed) / 2) * speedFactor * point.speedOffset * delta;
      if (point.radius < config.voidRadius) {
        point.radius = config.voidRadius + (.7 + Math.random() * .3) * (outer - config.voidRadius);
        point.angle = Math.random() * Math.PI * 2;
        point.height = (Math.random() - .5) * 16;
        continue;
      }

      var introRadiusOffset = introActive ? outer * .94 * point.introOffset * (1 - introEase) : 0;
      /* Keep the incoming ring in front of the perspective camera plane. */
      var introMaxRadius = Math.min(size.width * .72, config.perspective * .86);
      var displayRadius = introActive
        ? Math.min(point.radius + introRadiusOffset, Math.max(point.radius, introMaxRadius))
        : point.radius;
      var currentProjection = projectOrbitPoint(point, point.angle, cx, cy, cosTilt, sinTilt, cosSide, sinSide, displayRadius);
      var x = currentProjection.x;
      var y = currentProjection.y;
      var z1 = currentProjection.z;
      var scale = currentProjection.scale;

      var targetGlow = 0;
      if (pointerFlow.inside && !logoHovering) {
        var pointerDistanceX = x - pointerFlow.x;
        var pointerDistanceY = y - pointerFlow.y;
        var pointerDistance = Math.sqrt(pointerDistanceX * pointerDistanceX + pointerDistanceY * pointerDistanceY);
        var activationRadius = Math.max(12, config.arcRadius);
        if (pointerDistance < activationRadius) {
          var activation = 1 - pointerDistance / activationRadius;
          targetGlow = activation * activation * (3 - 2 * activation);
        }
      }

      var fadeTime = targetGlow > point.arcGlow ? Math.max(40, config.arcFadeIn) : Math.max(40, config.arcFadeOut);
      var glowEase = 1 - Math.exp(-(delta * 16.667) / fadeTime);
      point.arcGlow += (targetGlow - point.arcGlow) * glowEase;

      var trailPoints = null;
      if (point.arcGlow > .008 && config.arcLength > 0) {
        trailPoints = [];
        var segmentCount = Math.max(2, Math.min(16, Math.round(config.arcSegments)));
        var arcRadians = Math.max(0, config.arcLength) * Math.PI / 180;
        var orbitDirection = config.orbitSpeed >= 0 ? -1 : 1;
        for (var arcIndex = 0; arcIndex <= segmentCount; arcIndex += 1) {
          var arcProgress = arcIndex / segmentCount;
          var sampleAngle = point.angle + orbitDirection * arcRadians * arcProgress;
          trailPoints.push(projectOrbitPoint(point, sampleAngle, cx, cy, cosTilt, sinTilt, cosSide, sinSide, displayRadius));
        }
      }
      if (x < -30 || x > size.width + 30 || y < -30 || y > size.height + 30) continue;

      var projected = {
        x: x,
        y: y,
        z: z1,
        size: Math.max(.3, particleSize * scale),
        alpha: Math.max(.35, 1 - ((z1 + outer) / (2 * outer)) * .45) * introParticleOpacity,
        glow: Math.max(0, Math.min(1, point.arcGlow)),
        trailPoints: trailPoints,
        color: config.colors[point.colorIdx % config.colors.length]
      };
      (z1 >= 0 ? background : foreground).push(projected);
    }

    background.sort(function (a, b) { return b.z - a.z; });
    foreground.sort(function (a, b) { return b.z - a.z; });
    drawParticles(back, background);
    if (config.showCenter) drawVoid(cx, cy);
    drawParticles(front, foreground);
    drawLogoParticleState(now, cx, cy, delta);
    drawIntroPulse(cx, cy);
  }

  function updateLogoHover(event) {
    if (introActive) return;
    var rect = host.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    var wasHovering = logoHovering;
    logoHovering = isLogoHit(x, y);
    if (!logoHovering && wasHovering) logoHoverSuppressed = false;
    document.getElementById('home').classList.toggle('logo-hit-active', logoHovering);
  }

  function isLogoHit(x, y) {
    var cx = size.width * (config.centerX / 100) + config.logoOffsetX;
    var cy = size.height * (config.centerY / 100) + config.logoOffsetY;
    var logoSize = Math.max(10, config.voidRadius * config.logoScale / 100);
    return Math.abs(x - cx) <= logoSize * .62 && Math.abs(y - cy) <= logoSize * .62;
  }

  function toggleLogoParticleState(event) {
    if (introActive) return;
    var rect = host.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    if (!isLogoHit(x, y)) return;

    if (logoPinnedParticles) {
      logoPinnedParticles = false;
      logoHoverSuppressed = true;
    } else {
      logoPinnedParticles = true;
      logoHoverSuppressed = false;
    }
    document.getElementById('home').classList.toggle('logo-particles-pinned', logoPinnedParticles);
  }

  function updatePointerFlow(event) {
    if (introActive) return;
    var rect = host.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    var now = performance.now();

    if (!pointerFlow.initialized) {
      pointerFlow.lastX = x;
      pointerFlow.lastY = y;
      pointerFlow.initialized = true;
    }

    var elapsed = Math.max(8, Math.min(50, now - (pointerFlow.lastMove || now - 16.667)));
    var frameRatio = 16.667 / elapsed;
    var velocityX = (x - pointerFlow.lastX) * frameRatio;
    var velocityY = (y - pointerFlow.lastY) * frameRatio;
    var velocity = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    var maxVelocity = 32;
    if (velocity > maxVelocity) {
      velocityX *= maxVelocity / velocity;
      velocityY *= maxVelocity / velocity;
    }

    pointerFlow.x = x;
    pointerFlow.y = y;
    pointerFlow.lastX = x;
    pointerFlow.lastY = y;
    pointerFlow.targetVX = velocityX;
    pointerFlow.targetVY = velocityY;
    pointerFlow.lastMove = now;
    pointerFlow.inside = true;

  }

  function resetPointerFlow() {
    pointerFlow.inside = false;
    pointerFlow.initialized = false;
    pointerFlow.targetVX = 0;
    pointerFlow.targetVY = 0;
  }

  var resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      isVisible = entries[0].isIntersecting;
      if (isVisible) lastTime = performance.now();
    }, { threshold: .01 }).observe(host);
  }

  if (centerLogo) {
    if (centerLogo.complete) seedLogoParticles();
    else centerLogo.addEventListener('load', seedLogoParticles, { once: true });
  }
  document.getElementById('home').addEventListener('pointermove', function (event) {
    if (event.pointerType === 'touch') return;
    updateLogoHover(event);
    updatePointerFlow(event);
  }, { passive: true });
  document.getElementById('home').addEventListener('pointerleave', function () {
    logoHovering = false;
    logoHoverSuppressed = false;
    document.getElementById('home').classList.remove('logo-hit-active');
    resetPointerFlow();
  }, { passive: true });

  /* Touch uses the same orbit-aware arc glow without cancelling native scroll. */
  document.getElementById('home').addEventListener('touchstart', function (event) {
    if (event.touches.length !== 1) return;
    updatePointerFlow(event.touches[0]);
  }, { passive: true });
  document.getElementById('home').addEventListener('touchmove', function (event) {
    if (event.touches.length !== 1) return;
    updatePointerFlow(event.touches[0]);
  }, { passive: true });
  document.getElementById('home').addEventListener('touchend', resetPointerFlow, { passive: true });
  document.getElementById('home').addEventListener('touchcancel', resetPointerFlow, { passive: true });
  document.getElementById('home').addEventListener('click', toggleLogoParticleState);

  resize();
  syncCenterLogo();
  if (!introActive) home.classList.remove('hero-intro-active');
  animationFrame = requestAnimationFrame(render);

  window.SsrCatBlackHole = {
    getConfig: function () {
      return Object.assign({}, config);
    },
    update: function (values) {
      var reseed = false;
      Object.keys(values || {}).forEach(function (key) {
        if (!(key in config)) return;
        if (key === 'showCenter') {
          config[key] = Boolean(values[key]);
        } else {
          var value = Number(values[key]);
          if (!Number.isFinite(value)) return;
          config[key] = value;
        }
        if (key === 'particleCount' || key === 'voidRadius' || key === 'outerRadius') reseed = true;
      });
      if (reseed) seedParticles();
      syncCenterLogo();
      return this.getConfig();
    },
    reset: function () {
      config.showCenter = false;
      config.voidRadius = 40;
      config.centerX = 50;
      config.centerY = 30;
      config.particleCount = 500;
      config.particleSize = 5;
      config.colors = ['#ffffff', '#FFE052', '#FF9B3A', '#6C73FF', '#70FFF4', '#FF97F6', '#F8FF3A', '#84C9FF', '#AFFF52'];
      config.outerRadius = 100;
      config.orbitSpeed = .8;
      config.pullSpeed = 0;
      config.trail = 0;
      config.tilt = 18;
      config.tiltSideway = 193;
      config.logoScale = 145;
      config.logoOffsetX = 0;
      config.logoOffsetY = 0;
      config.logoOpacity = 100;
      config.logoRotation = 0;
      config.logoParticleSpread = 26;
      config.logoParticleSize = .8;
      config.logoFadeToParticles = 550;
      config.logoFadeToImage = 820;
      config.arcRadius = 180;
      config.arcLength = 30;
      config.arcSegments = 16;
      config.arcBrightness = 1.5;
      config.arcWidth = .9;
      config.arcFadeIn = 400;
      config.arcFadeOut = 800;
      seedParticles();
      syncCenterLogo();
      return this.getConfig();
    }
  };
})();
