(function () {
  'use strict';

  var home = document.getElementById('home');
  if (!home) return;

  var defaults = {
    registerOutline: '#ffffff',
    login: ['#9cf4ff', '#c5ffda', '#52ffbd', '#c4ffbd', '#7dece3'],
    loginText: '#040d0e'
  };
  var values = JSON.parse(JSON.stringify(defaults));

  var panel = document.createElement('aside');
  panel.className = 'hero-button-color-controls';
  panel.setAttribute('aria-label', '注册登录按钮临时颜色调节面板');
  panel.innerHTML =
    '<div class="hbcc-header">' +
      '<strong>按钮虹彩颜色</strong>' +
      '<button type="button" class="hbcc-collapse" aria-label="收起控制面板">−</button>' +
    '</div>' +
    '<div class="hbcc-body">' +
      '<div class="hbcc-section">注册 / 备用链接 · 描边</div>' +
      '<label class="hbcc-row"><span>边框颜色</span><input type="color" data-group="registerOutline" value="#ffffff"><output>#ffffff</output></label>' +
      '<div class="hbcc-section">登录按钮 · 填充</div>' +
      '<div class="hbcc-login"></div>' +
      '<label class="hbcc-row"><span>文字颜色</span><input type="color" data-group="loginText" value="#040d0e"><output>#040d0e</output></label>' +
      '<div class="hbcc-actions">' +
        '<button type="button" data-action="copy">复制参数</button>' +
        '<button type="button" data-action="reset">恢复默认</button>' +
      '</div>' +
      '<output class="hbcc-status" aria-live="polite"></output>' +
    '</div>';

  function makeRows(container, group, colors) {
    colors.forEach(function (color, index) {
      var row = document.createElement('label');
      row.className = 'hbcc-row';
      row.innerHTML =
        '<span>颜色 ' + (index + 1) + '</span>' +
        '<input type="color" data-group="' + group + '" data-index="' + index + '" value="' + color + '">' +
        '<output>' + color + '</output>';
      container.appendChild(row);
    });
  }

  makeRows(panel.querySelector('.hbcc-login'), 'login', values.login);
  document.body.appendChild(panel);

  function apply() {
    home.style.setProperty('--register-outline-color', values.registerOutline);
    values.login.forEach(function (color, index) {
      home.style.setProperty('--login-fill-color-' + (index + 1), color);
    });
    home.style.setProperty('--login-button-text-color', values.loginText);
  }

  function sync() {
    panel.querySelectorAll('input[type="color"]').forEach(function (input) {
      var group = input.getAttribute('data-group');
      var index = input.getAttribute('data-index');
      var color = group === 'loginText' || group === 'registerOutline' ? values[group] : values[group][Number(index)];
      input.value = color;
      input.parentElement.querySelector('output').textContent = color;
    });
    apply();
  }

  panel.addEventListener('input', function (event) {
    var input = event.target.closest('input[type="color"]');
    if (!input) return;
    var group = input.getAttribute('data-group');
    var color = input.value.toLowerCase();
    if (group === 'loginText' || group === 'registerOutline') {
      values[group] = color;
    } else {
      values[group][Number(input.getAttribute('data-index'))] = color;
    }
    input.parentElement.querySelector('output').textContent = color;
    apply();
  });

  panel.querySelector('.hbcc-collapse').addEventListener('click', function (event) {
    var collapsed = panel.classList.toggle('is-collapsed');
    event.currentTarget.textContent = collapsed ? '+' : '−';
    event.currentTarget.setAttribute('aria-label', collapsed ? '展开控制面板' : '收起控制面板');
  });

  panel.querySelector('[data-action="reset"]').addEventListener('click', function () {
    values = JSON.parse(JSON.stringify(defaults));
    sync();
    panel.querySelector('.hbcc-status').textContent = '已恢复第一版虹彩颜色';
  });

  panel.querySelector('[data-action="copy"]').addEventListener('click', function () {
    var output = JSON.stringify(values, null, 2);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(output).then(function () {
        panel.querySelector('.hbcc-status').textContent = '颜色参数已复制';
      });
    } else {
      panel.querySelector('.hbcc-status').textContent = output;
    }
  });

  sync();
})();
