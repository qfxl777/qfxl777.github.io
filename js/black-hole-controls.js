(function () {
  'use strict';

  var api = window.SsrCatBlackHole;
  if (!api) return;

  var definitions = [
    { key: 'centerX', label: '水平位置', min: 0, max: 100, step: 1 },
    { key: 'centerY', label: '垂直位置', min: 0, max: 100, step: 1 },
    { key: 'voidRadius', label: '中心半径', min: 1, max: 120, step: 1 },
    { key: 'outerRadius', label: '轨道半径', min: 5, max: 100, step: 1 },
    { key: 'particleCount', label: '粒子数量', min: 100, max: 1500, step: 50 },
    { key: 'particleSize', label: '粒径', min: 1, max: 50, step: 1 },
    { key: 'trail', label: '踪迹', min: 0, max: 50, step: 1 },
    { key: 'tilt', label: '倾斜角度', min: 0, max: 360, step: 1 },
    { key: 'tiltSideway', label: '侧向倾斜', min: 0, max: 360, step: 1 },
    { key: 'pullSpeed', label: '重力流入', min: 0, max: 20, step: .5 },
    { key: 'orbitSpeed', label: '速度', min: 0, max: 10, step: .1 },
    { key: 'logoScale', label: 'Logo 大小', min: 30, max: 300, step: 1, section: 'Logo 调节' },
    { key: 'logoOffsetX', label: '水平偏移', min: -150, max: 150, step: 1 },
    { key: 'logoOffsetY', label: '垂直偏移', min: -150, max: 150, step: 1 },
    { key: 'logoOpacity', label: '透明度', min: 0, max: 100, step: 1 },
    { key: 'logoRotation', label: '旋转角度', min: -180, max: 180, step: 1 },
    { key: 'logoParticleSpread', label: '粒子扩散', min: 0, max: 80, step: 1 },
    { key: 'logoParticleSize', label: '粒子大小', min: .3, max: 4, step: .05 }
  ];

  var panel = document.createElement('aside');
  panel.className = 'black-hole-controls';
  panel.setAttribute('aria-label', '粒子动画临时控制面板');
  panel.innerHTML =
    '<div class="bh-control-header">' +
      '<strong>粒子动画控制</strong>' +
      '<button type="button" class="bh-control-collapse" aria-label="收起控制面板">−</button>' +
    '</div>' +
    '<div class="bh-control-body">' +
      '<label class="bh-control-check"><span>显示中心</span><input type="checkbox" data-key="showCenter" checked></label>' +
      '<div class="bh-control-list"></div>' +
      '<div class="bh-control-actions">' +
        '<button type="button" data-action="copy">复制参数</button>' +
        '<button type="button" data-action="reset">恢复默认</button>' +
      '</div>' +
      '<output class="bh-control-status" aria-live="polite"></output>' +
    '</div>';

  var list = panel.querySelector('.bh-control-list');
  definitions.forEach(function (definition) {
    if (definition.section) {
      var heading = document.createElement('div');
      heading.className = 'bh-control-section';
      heading.textContent = definition.section;
      list.appendChild(heading);
    }
    var row = document.createElement('label');
    row.className = 'bh-control-row';
    row.innerHTML =
      '<span>' + definition.label + '</span>' +
      '<input type="range" data-key="' + definition.key + '" min="' + definition.min + '" max="' + definition.max + '" step="' + definition.step + '">' +
      '<input type="number" data-number-key="' + definition.key + '" min="' + definition.min + '" max="' + definition.max + '" step="' + definition.step + '">';
    list.appendChild(row);
  });
  document.body.appendChild(panel);

  function sync(config) {
    panel.querySelector('[data-key="showCenter"]').checked = config.showCenter;
    definitions.forEach(function (definition) {
      panel.querySelector('[data-key="' + definition.key + '"]').value = config[definition.key];
      panel.querySelector('[data-number-key="' + definition.key + '"]').value = config[definition.key];
    });
  }

  function updateFrom(input) {
    var key = input.getAttribute('data-key') || input.getAttribute('data-number-key');
    var value = input.type === 'checkbox' ? input.checked : Number(input.value);
    var values = {};
    values[key] = value;
    var config = api.update(values);
    if (input.type !== 'checkbox') {
      panel.querySelector('[data-key="' + key + '"]').value = config[key];
      panel.querySelector('[data-number-key="' + key + '"]').value = config[key];
    }
  }

  panel.addEventListener('input', function (event) {
    if (event.target.matches('[data-key], [data-number-key]')) updateFrom(event.target);
  });

  panel.querySelector('.bh-control-collapse').addEventListener('click', function (event) {
    var collapsed = panel.classList.toggle('is-collapsed');
    event.currentTarget.textContent = collapsed ? '+' : '−';
    event.currentTarget.setAttribute('aria-label', collapsed ? '展开控制面板' : '收起控制面板');
  });

  panel.querySelector('[data-action="reset"]').addEventListener('click', function () {
    sync(api.reset());
    panel.querySelector('.bh-control-status').textContent = '已恢复默认参数';
  });

  panel.querySelector('[data-action="copy"]').addEventListener('click', function () {
    var config = api.getConfig();
    var output = JSON.stringify(config, null, 2);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(output).then(function () {
        panel.querySelector('.bh-control-status').textContent = '参数已复制';
      });
    } else {
      panel.querySelector('.bh-control-status').textContent = output;
    }
  });

  sync(api.getConfig());
})();
