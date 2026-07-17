(function () {
  'use strict';

  var home = document.getElementById('home');
  if (!home) return;

  var defaults = {
    desktop: { widthScale: 88, x: 0, y: 130, gap: 12 },
    mobile: { widthScale: 86, x: 0, y: 120, gap: 10 },
    shared: { height: 42, fontSize: 16, radius: 4 }
  };
  var values = JSON.parse(JSON.stringify(defaults));
  var activeMode = window.matchMedia('(max-width: 767.98px)').matches ? 'mobile' : 'desktop';

  var deviceDefinitions = [
    { key: 'widthScale', label: '整体宽度', min: 70, max: 150, step: 1 },
    { key: 'x', label: '水平位置', min: -180, max: 180, step: 1 },
    { key: 'y', label: '垂直位置', min: -180, max: 200, step: 1 },
    { key: 'gap', label: '按钮间距', min: 0, max: 60, step: 1 }
  ];
  var sharedDefinitions = [
    { key: 'height', label: '按钮高度', min: 40, max: 90, step: 1 },
    { key: 'fontSize', label: '文字大小', min: 12, max: 24, step: 1 },
    { key: 'radius', label: '按钮圆角', min: 0, max: 30, step: 1 }
  ];

  var panel = document.createElement('aside');
  panel.className = 'hero-action-controls';
  panel.setAttribute('aria-label', '注册登录按钮临时调节面板');
  panel.innerHTML =
    '<div class="hac-header">' +
      '<strong>注册 / 登录按钮调节</strong>' +
      '<button type="button" class="hac-collapse" aria-label="收起控制面板">−</button>' +
    '</div>' +
    '<div class="hac-body">' +
      '<div class="hac-modes">' +
        '<button type="button" data-mode="desktop">桌面端</button>' +
        '<button type="button" data-mode="mobile">手机端</button>' +
      '</div>' +
      '<div class="hac-device-list"></div>' +
      '<div class="hac-section">两端共用</div>' +
      '<div class="hac-shared-list"></div>' +
      '<div class="hac-actions">' +
        '<button type="button" data-action="copy">复制参数</button>' +
        '<button type="button" data-action="reset">恢复默认</button>' +
      '</div>' +
      '<output class="hac-status" aria-live="polite"></output>' +
    '</div>';

  function createRows(container, definitions, scope) {
    definitions.forEach(function (definition) {
      var row = document.createElement('label');
      row.className = 'hac-row';
      row.innerHTML =
        '<span>' + definition.label + '</span>' +
        '<input type="range" data-scope="' + scope + '" data-key="' + definition.key + '" min="' + definition.min + '" max="' + definition.max + '" step="' + definition.step + '">' +
        '<input type="number" data-number-scope="' + scope + '" data-number-key="' + definition.key + '" min="' + definition.min + '" max="' + definition.max + '" step="' + definition.step + '">';
      container.appendChild(row);
    });
  }

  createRows(panel.querySelector('.hac-device-list'), deviceDefinitions, 'device');
  createRows(panel.querySelector('.hac-shared-list'), sharedDefinitions, 'shared');
  document.body.appendChild(panel);

  function apply() {
    home.style.setProperty('--desktop-actions-width-scale', values.desktop.widthScale / 100);
    home.style.setProperty('--desktop-actions-x', values.desktop.x + 'px');
    home.style.setProperty('--desktop-actions-y', values.desktop.y + 'px');
    home.style.setProperty('--desktop-actions-gap', values.desktop.gap + 'px');
    home.style.setProperty('--mobile-actions-width-scale', values.mobile.widthScale / 100);
    home.style.setProperty('--mobile-actions-x', values.mobile.x + 'px');
    home.style.setProperty('--mobile-actions-y', values.mobile.y + 'px');
    home.style.setProperty('--mobile-actions-gap', values.mobile.gap + 'px');
    home.style.setProperty('--hero-action-height', values.shared.height + 'px');
    home.style.setProperty('--hero-action-font-size', values.shared.fontSize + 'px');
    home.style.setProperty('--hero-action-radius', values.shared.radius + 'px');
  }

  function sync() {
    panel.querySelectorAll('[data-mode]').forEach(function (button) {
      button.classList.toggle('is-active', button.getAttribute('data-mode') === activeMode);
    });
    deviceDefinitions.forEach(function (definition) {
      panel.querySelector('[data-scope="device"][data-key="' + definition.key + '"]').value = values[activeMode][definition.key];
      panel.querySelector('[data-number-scope="device"][data-number-key="' + definition.key + '"]').value = values[activeMode][definition.key];
    });
    sharedDefinitions.forEach(function (definition) {
      panel.querySelector('[data-scope="shared"][data-key="' + definition.key + '"]').value = values.shared[definition.key];
      panel.querySelector('[data-number-scope="shared"][data-number-key="' + definition.key + '"]').value = values.shared[definition.key];
    });
    apply();
  }

  function update(input) {
    var scope = input.getAttribute('data-scope') || input.getAttribute('data-number-scope');
    var key = input.getAttribute('data-key') || input.getAttribute('data-number-key');
    var bucket = scope === 'shared' ? values.shared : values[activeMode];
    bucket[key] = Number(input.value);
    panel.querySelector('[data-scope="' + scope + '"][data-key="' + key + '"]').value = bucket[key];
    panel.querySelector('[data-number-scope="' + scope + '"][data-number-key="' + key + '"]').value = bucket[key];
    apply();
  }

  panel.addEventListener('input', function (event) {
    if (event.target.matches('[data-key], [data-number-key]')) update(event.target);
  });

  panel.querySelectorAll('[data-mode]').forEach(function (button) {
    button.addEventListener('click', function () {
      activeMode = button.getAttribute('data-mode');
      sync();
      panel.querySelector('.hac-status').textContent = activeMode === 'desktop' ? '正在调整桌面端' : '正在调整手机端';
    });
  });

  panel.querySelector('.hac-collapse').addEventListener('click', function (event) {
    var collapsed = panel.classList.toggle('is-collapsed');
    event.currentTarget.textContent = collapsed ? '+' : '−';
    event.currentTarget.setAttribute('aria-label', collapsed ? '展开控制面板' : '收起控制面板');
  });

  panel.querySelector('[data-action="reset"]').addEventListener('click', function () {
    values = JSON.parse(JSON.stringify(defaults));
    sync();
    panel.querySelector('.hac-status').textContent = '已恢复默认参数';
  });

  panel.querySelector('[data-action="copy"]').addEventListener('click', function () {
    var output = JSON.stringify(values, null, 2);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(output).then(function () {
        panel.querySelector('.hac-status').textContent = '参数已复制';
      });
    } else {
      panel.querySelector('.hac-status').textContent = output;
    }
  });

  sync();
})();
