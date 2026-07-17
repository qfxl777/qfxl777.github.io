(function () {
  'use strict';

  var api = window.SsrCatBlackHole;
  if (!api) return;

  var definitions = [
    { key: 'arcRadius', label: '激活范围', min: 20, max: 180, step: 1 },
    { key: 'arcLength', label: '圆弧长度', min: 2, max: 65, step: 1 },
    { key: 'arcSegments', label: '圆弧细腻', min: 2, max: 16, step: 1 },
    { key: 'arcBrightness', label: '拖尾亮度', min: 0, max: 1.5, step: .02 },
    { key: 'arcWidth', label: '拖尾线宽', min: .2, max: 2.5, step: .05 },
    { key: 'arcFadeIn', label: '淡入时间', min: 40, max: 1400, step: 20 },
    { key: 'arcFadeOut', label: '淡出时间', min: 80, max: 2200, step: 20 },
    { key: 'logoFadeToParticles', label: 'Logo 粒子化', min: 200, max: 2500, step: 50 },
    { key: 'logoFadeToImage', label: 'Logo 复原', min: 200, max: 2500, step: 50 }
  ];

  var panel = document.createElement('aside');
  panel.className = 'particle-flow-controls';
  panel.setAttribute('aria-label', '粒子流水交互临时调节面板');
  panel.innerHTML =
    '<div class="pf-control-header">' +
      '<strong>粒子轨道弧光</strong>' +
      '<button type="button" class="pf-control-collapse" aria-label="收起控制面板">−</button>' +
    '</div>' +
    '<div class="pf-control-body">' +
      '<div class="pf-control-list"></div>' +
      '<div class="pf-control-actions">' +
        '<button type="button" data-action="copy">复制参数</button>' +
        '<button type="button" data-action="reset">恢复默认</button>' +
      '</div>' +
      '<output class="pf-control-status" aria-live="polite"></output>' +
    '</div>';

  var list = panel.querySelector('.pf-control-list');
  definitions.forEach(function (definition) {
    var row = document.createElement('label');
    row.className = 'pf-control-row';
    row.innerHTML =
      '<span>' + definition.label + '</span>' +
      '<input type="range" data-key="' + definition.key + '" min="' + definition.min + '" max="' + definition.max + '" step="' + definition.step + '">' +
      '<input type="number" data-number-key="' + definition.key + '" min="' + definition.min + '" max="' + definition.max + '" step="' + definition.step + '">';
    list.appendChild(row);
  });
  document.body.appendChild(panel);

  function sync(config) {
    definitions.forEach(function (definition) {
      panel.querySelector('[data-key="' + definition.key + '"]').value = config[definition.key];
      panel.querySelector('[data-number-key="' + definition.key + '"]').value = config[definition.key];
    });
  }

  function update(input) {
    var key = input.getAttribute('data-key') || input.getAttribute('data-number-key');
    var changes = {};
    changes[key] = Number(input.value);
    var config = api.update(changes);
    panel.querySelector('[data-key="' + key + '"]').value = config[key];
    panel.querySelector('[data-number-key="' + key + '"]').value = config[key];
  }

  panel.addEventListener('input', function (event) {
    if (event.target.matches('[data-key], [data-number-key]')) update(event.target);
  });

  panel.querySelector('.pf-control-collapse').addEventListener('click', function (event) {
    var collapsed = panel.classList.toggle('is-collapsed');
    event.currentTarget.textContent = collapsed ? '+' : '−';
    event.currentTarget.setAttribute('aria-label', collapsed ? '展开控制面板' : '收起控制面板');
  });

  panel.querySelector('[data-action="reset"]').addEventListener('click', function () {
    sync(api.update({
      arcRadius: 180,
      arcLength: 30,
      arcSegments: 16,
      arcBrightness: 1.5,
      arcWidth: .9,
      arcFadeIn: 400,
      arcFadeOut: 800,
      logoFadeToParticles: 550,
      logoFadeToImage: 820
    }));
    panel.querySelector('.pf-control-status').textContent = '已恢复默认参数';
  });

  panel.querySelector('[data-action="copy"]').addEventListener('click', function () {
    var config = api.getConfig();
    var output = JSON.stringify({
      arcRadius: config.arcRadius,
      arcLength: config.arcLength,
      arcSegments: config.arcSegments,
      arcBrightness: config.arcBrightness,
      arcWidth: config.arcWidth,
      arcFadeIn: config.arcFadeIn,
      arcFadeOut: config.arcFadeOut,
      logoFadeToParticles: config.logoFadeToParticles,
      logoFadeToImage: config.logoFadeToImage
    }, null, 2);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(output).then(function () {
        panel.querySelector('.pf-control-status').textContent = '参数已复制';
      });
    } else {
      panel.querySelector('.pf-control-status').textContent = output;
    }
  });

  sync(api.getConfig());
})();
