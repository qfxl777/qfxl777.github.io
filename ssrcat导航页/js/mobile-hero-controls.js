(function () {
  'use strict';

  var home = document.getElementById('home');
  if (!home) return;

  var defaults = {
    groupX: 0,
    groupY: 58,
    titleX: 0,
    titleY: 40,
    titleScale: 140,
    leadY: -10,
    actionsX: 0,
    actionsY: 65,
    actionsScale: 100,
    actionsGap: 10
  };
  var values = Object.assign({}, defaults);
  var definitions = [
    { key: 'groupX', label: '整体水平', min: -120, max: 120, step: 1, section: '整体位置' },
    { key: 'groupY', label: '整体垂直', min: -120, max: 220, step: 1 },
    { key: 'titleX', label: '标题水平', min: -120, max: 120, step: 1, section: 'SsrCat 标题' },
    { key: 'titleY', label: '标题垂直', min: -120, max: 120, step: 1 },
    { key: 'titleScale', label: '标题大小', min: 60, max: 180, step: 1 },
    { key: 'leadY', label: '说明垂直', min: -120, max: 120, step: 1, section: '说明文字' },
    { key: 'actionsX', label: '按钮水平', min: -120, max: 120, step: 1, section: '注册 / 登录' },
    { key: 'actionsY', label: '按钮垂直', min: -120, max: 160, step: 1 },
    { key: 'actionsScale', label: '按钮大小', min: 60, max: 150, step: 1 },
    { key: 'actionsGap', label: '按钮间距', min: 0, max: 60, step: 1 }
  ];

  var cssVariables = {
    groupX: ['--mobile-hero-group-x', 'px'],
    groupY: ['--mobile-hero-group-y', 'px'],
    titleX: ['--mobile-title-x', 'px'],
    titleY: ['--mobile-title-y', 'px'],
    titleScale: ['--mobile-title-scale', '', .01],
    leadY: ['--mobile-lead-y', 'px'],
    actionsX: ['--mobile-actions-x', 'px'],
    actionsY: ['--mobile-actions-y', 'px'],
    actionsScale: ['--mobile-actions-scale', '', .01],
    actionsGap: ['--mobile-actions-gap', 'px']
  };

  var panel = document.createElement('aside');
  panel.className = 'mobile-hero-controls';
  panel.setAttribute('aria-label', '移动端首屏临时调节面板');
  panel.innerHTML =
    '<div class="mh-control-header">' +
      '<strong>移动端首屏调节</strong>' +
      '<button type="button" class="mh-control-collapse" aria-label="收起控制面板">−</button>' +
    '</div>' +
    '<div class="mh-control-body">' +
      '<div class="mh-control-list"></div>' +
      '<div class="mh-control-actions">' +
        '<button type="button" data-action="copy">复制参数</button>' +
        '<button type="button" data-action="reset">恢复默认</button>' +
      '</div>' +
      '<output class="mh-control-status" aria-live="polite"></output>' +
    '</div>';

  var list = panel.querySelector('.mh-control-list');
  definitions.forEach(function (definition) {
    if (definition.section) {
      var heading = document.createElement('div');
      heading.className = 'mh-control-section';
      heading.textContent = definition.section;
      list.appendChild(heading);
    }
    var row = document.createElement('label');
    row.className = 'mh-control-row';
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

  panel.querySelector('.mh-control-collapse').addEventListener('click', function (event) {
    var collapsed = panel.classList.toggle('is-collapsed');
    event.currentTarget.textContent = collapsed ? '+' : '−';
    event.currentTarget.setAttribute('aria-label', collapsed ? '展开控制面板' : '收起控制面板');
  });

  panel.querySelector('[data-action="reset"]').addEventListener('click', function () {
    values = Object.assign({}, defaults);
    sync();
    panel.querySelector('.mh-control-status').textContent = '已恢复默认参数';
  });

  panel.querySelector('[data-action="copy"]').addEventListener('click', function () {
    var output = JSON.stringify(values, null, 2);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(output).then(function () {
        panel.querySelector('.mh-control-status').textContent = '参数已复制';
      });
    } else {
      panel.querySelector('.mh-control-status').textContent = output;
    }
  });

  sync();
})();
