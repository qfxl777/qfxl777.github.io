(function () {
  'use strict';

  var layer = document.createElement('div');
  layer.className = 'click-effect-layer';
  layer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(layer);

  var svgNS = 'http://www.w3.org/2000/svg';
  var directions = [
    { x1: 35, y1: 30, x2: 47, y2: 30, tx: 17, ty: 0 },
    { x1: 30, y1: 25, x2: 30, y2: 13, tx: 0, ty: -17 },
    { x1: 25, y1: 30, x2: 13, y2: 30, tx: -17, ty: 0 },
    { x1: 30, y1: 35, x2: 30, y2: 47, tx: 0, ty: 17 }
  ];
  var particleAngles = [30, 60, 120, 150, 210, 240, 300, 330];

  function addClickEffect(event) {
    if (event.button !== undefined && event.button !== 0) return;

    var effect = document.createElement('span');
    effect.className = 'click-effect-sniper';
    effect.style.setProperty('--click-x', event.clientX + 'px');
    effect.style.setProperty('--click-y', event.clientY + 'px');

    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 60 60');

    directions.forEach(function (direction) {
      var line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', direction.x1);
      line.setAttribute('y1', direction.y1);
      line.setAttribute('x2', direction.x2);
      line.setAttribute('y2', direction.y2);
      line.style.setProperty('--tx', direction.tx + 'px');
      line.style.setProperty('--ty', direction.ty + 'px');
      svg.appendChild(line);
    });

    effect.appendChild(svg);

    particleAngles.forEach(function (degrees) {
      var angle = degrees * Math.PI / 180;
      var particle = document.createElement('i');
      particle.style.setProperty('--tx', (Math.cos(angle) * 24).toFixed(2) + 'px');
      particle.style.setProperty('--ty', (Math.sin(angle) * 24).toFixed(2) + 'px');
      effect.appendChild(particle);
    });

    layer.appendChild(effect);
    window.setTimeout(function () { effect.remove(); }, 380);
  }

  document.addEventListener('click', addClickEffect, { passive: true });
}());
