(function () {
  'use strict';

  var home = document.getElementById('home');
  if (!home) return;

  var defaults = {
    groupX: 0,
    groupY: 0,
    titleX: 0,
    titleY: 18,
    titleScale: 100,
    leadX: 0,
    leadY: -40,
    leadScale: 100,
    actionsX: 0,
    actionsY: 116,
    actionsScale: 100,
    actionsGap: 12
  };
  var values = Object.assign({}, defaults);
  var definitions = [
    { key: 'groupX', label: '整体水平', min: -240, max: 240, step: 1, section: '整体位置' },
    { key: 'groupY', label: '整体垂直', min: -240, max: 240, step: 1 },
    { key: 'titleX', label: '标题水平', min: -240, max: 240, step: 1, section: 'SsrCat 标题' },
    { key: 'titleY', label: '标题垂直', min: -180, max: 180, step: 1 },
    { key: 'titleScale', label: '标题大小', min: 60, max: 180, step: 1 },
    { key: 'leadX', label: '说明水平', min: -240, max: 240, step: 1, section: '说明文字' },
    { key: 'leadY', label: '说明垂直', min: -180, max: 180, step: 1 },
    { key: 'leadScale', label: '说明大小', min: 60, max: 160, step: 1 },
    { key: 'actionsX', label: '按钮水平', min: -240, max: 240, step: 1, section: '注册 / 登录' },
    { key: 'actionsY', label: '按钮垂直', min: -180, max: 180, step: 1 },
    { key: 'actionsScale', label: '按钮大小', min: 60, max: 150, step: 1 },
    { key: 'actionsGap', label: '按钮间距', min: 0, max: 80, step: 1 }
  ];
  var cssVariables = {
    groupX: ['--desktop-hero-group-x', 'px'],
    groupY: ['--desktop-hero-group-y', 'px'],
    titleX: ['--desktop-title-x', 'px'],
    titleY: ['--desktop-title-y', 'px'],
    titleScale: ['--desktop-title-scale', '', .01],
    leadX: ['--desktop-lead-x', 'px'],
    leadY: ['--desktop-lead-y', 'px'],
    leadScale: ['--desktop-lead-scale', '', .01],
    actionsX: ['--desktop-actions-x', 'px'],
    actionsY: ['--desktop-actions-y', 'px'],
    actionsScale: ['--desktop-actions-scale', '', .01],
    actionsGap: ['--desktop-actions-gap', 'px']
  };

  var panel = document.createElement('aside');
  panel.className = 'desktop-hero-controls';
  panel.setAttribute('aria-label', '桌面端首屏临时调节面板');
  panel.innerHTML =
    '<div class="dh-control-header">' +
      '<strong>桌面端首屏调节</strong>' +
      '<button type="button" class="dh-control-collapse" aria-label="收起控制面板">−</button>' +
    '</div>' +
    '<div class="dh-control-body">' +
      '<div class="dh-control-list"></div>' +
      '<div class="dh-control-actions">' +
        '<button type="button" data-action="copy">复制参数</button>' +
        '<button type="button" data-action="reset">恢复默认</button>' +
      '</div>' +
      '<output class="dh-control-status" aria-live="polite"></output>' +
    '</div>';

  var list = panel.querySelector('.dh-control-list');
  definitions.forEach(function (definition) {
    if (definition.section) {
      var heading = document.createElement('div');
      heading.className = 'dh-control-section';
      heading.textContent = definition.section;
      list.appendChild(heading);
    }
    var row = document.createElement('label');
    row.className = 'dh-control-row';
    row.innerHTML =
      '<span>' + definition.label + '</span>' +
      '<input type="range" data-key="' + definition.key + '" min="' + definition.min + '" max="' + definition.max + '" step="' + definition.step + '">' +
      '<input type="number" data-number-key="' + definition.key + '" min="' + definition.min + '" max="' + definition.max + '" step="' + definition.step + '">';
    list.appendChild(row);
  });
  document.body.appendChild(panel);

  function apply() {
    Object.keys(cssVariables).forEach(function (key) {
      var setting = cssVariables[key];
      var multiplier = setting[2] || 1;
      home.style.setProperty(setting[0], values[key] * multiplier + setting[1]);
    });
  }

  function sync() {
    definitions.forEach(function (definition) {
      panel.querySelector('[data-key="' + definition.key + '"]').value = values[definition.key];
      panel.querySelector('[data-number-key="' + definition.key + '"]').value = values[definition.key];
    });
    apply();
  }

  function update(input) {
    var key = input.getAttribute('data-key') || input.getAttribute('data-number-key');
    values[key] = Number(input.value);
    panel.querySelector('[data-key="' + key + '"]').value = values[key];
    panel.querySelector('[data-number-key="' + key + '"]').value = values[key];
    apply();
  }

  panel.addEventListener('input', function (event) {
    if (event.target.matches('[data-key], [data-number-key]')) update(event.target);
  });

  panel.querySelector('.dh-control-collapse').addEventListener('click', function (event) {
    var collapsed = panel.classList.toggle('is-collapsed');
    event.currentTarget.textContent = collapsed ? '+' : '−';
    event.currentTarget.setAttribute('aria-label', collapsed ? '展开控制面板' : '收起控制面板');
  });

  panel.querySelector('[data-action="reset"]').addEventListener('click', function () {
    values = Object.assign({}, defaults);
    sync();
    panel.querySelector('.dh-control-status').textContent = '已恢复默认参数';
  });

  panel.querySelector('[data-action="copy"]').addEventListener('click', function () {
    var output = JSON.stringify(values, null, 2);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(output).then(function () {
        panel.querySelector('.dh-control-status').textContent = '参数已复制';
      });
    } else {
      panel.querySelector('.dh-control-status').textContent = output;
    }
  });

  sync();
})();
