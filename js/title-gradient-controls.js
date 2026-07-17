(function () {
  'use strict';

  var home = document.getElementById('home');
  if (!home) return;

  var defaults = {
    colors: ['#e0fffd', '#9effa0', '#ebffd6', '#57ffa0', '#2effcb'],
    positions: [9, 28, 48, 72, 100],
    angle: 150,
    speed: 2.5
  };
  var values = JSON.parse(JSON.stringify(defaults));

  var panel = document.createElement('aside');
  panel.className = 'title-gradient-controls';
  panel.setAttribute('aria-label', '大标题渐变临时调节面板');
  panel.innerHTML =
    '<div class="tg-control-header">' +
      '<strong>大标题渐变调节</strong>' +
      '<button type="button" class="tg-control-collapse" aria-label="收起控制面板">−</button>' +
    '</div>' +
    '<div class="tg-control-body">' +
      '<div class="tg-color-list"></div>' +
      '<label class="tg-control-row"><span>渐变角度</span><input type="range" data-key="angle" min="0" max="360" step="1"><input type="number" data-number-key="angle" min="0" max="360" step="1"></label>' +
      '<label class="tg-control-row"><span>流动速度</span><input type="range" data-key="speed" min="1" max="30" step=".5"><input type="number" data-number-key="speed" min="1" max="30" step=".5"></label>' +
      '<div class="tg-control-actions"><button type="button" data-action="copy">复制参数</button><button type="button" data-action="reset">恢复默认</button></div>' +
      '<output class="tg-control-status" aria-live="polite"></output>' +
    '</div>';

  var list = panel.querySelector('.tg-color-list');
  defaults.colors.forEach(function (_, index) {
    var row = document.createElement('label');
    row.className = 'tg-color-row';
    row.innerHTML =
      '<span>颜色 ' + (index + 1) + '</span>' +
      '<input type="color" data-color-index="' + index + '">' +
      '<input type="range" data-position-index="' + index + '" min="0" max="100" step="1">' +
      '<output data-position-output="' + index + '"></output>';
    list.appendChild(row);
  });
  document.body.appendChild(panel);

  function apply() {
    values.colors.forEach(function (color, index) {
      home.style.setProperty('--title-gradient-color-' + (index + 1), color);
      home.style.setProperty('--title-gradient-position-' + (index + 1), values.positions[index] + '%');
    });
    home.style.setProperty('--title-gradient-angle', values.angle + 'deg');
    home.style.setProperty('--title-gradient-speed', values.speed + 's');
  }

  function sync() {
    values.colors.forEach(function (color, index) {
      panel.querySelector('[data-color-index="' + index + '"]').value = color;
      panel.querySelector('[data-position-index="' + index + '"]').value = values.positions[index];
      panel.querySelector('[data-position-output="' + index + '"]').textContent = values.positions[index] + '%';
    });
    panel.querySelector('[data-key="angle"]').value = values.angle;
    panel.querySelector('[data-number-key="angle"]').value = values.angle;
    panel.querySelector('[data-key="speed"]').value = values.speed;
    panel.querySelector('[data-number-key="speed"]').value = values.speed;
    apply();
  }

  panel.addEventListener('input', function (event) {
    var target = event.target;
    if (target.hasAttribute('data-color-index')) {
      values.colors[Number(target.getAttribute('data-color-index'))] = target.value;
    } else if (target.hasAttribute('data-position-index')) {
      var positionIndex = Number(target.getAttribute('data-position-index'));
      values.positions[positionIndex] = Number(target.value);
      panel.querySelector('[data-position-output="' + positionIndex + '"]').textContent = target.value + '%';
    } else {
      var key = target.getAttribute('data-key') || target.getAttribute('data-number-key');
      if (!key) return;
      values[key] = Number(target.value);
      panel.querySelector('[data-key="' + key + '"]').value = values[key];
      panel.querySelector('[data-number-key="' + key + '"]').value = values[key];
    }
    apply();
  });

  panel.querySelector('.tg-control-collapse').addEventListener('click', function (event) {
    var collapsed = panel.classList.toggle('is-collapsed');
    event.currentTarget.textContent = collapsed ? '+' : '−';
    event.currentTarget.setAttribute('aria-label', collapsed ? '展开控制面板' : '收起控制面板');
  });

  panel.querySelector('[data-action="reset"]').addEventListener('click', function () {
    values = JSON.parse(JSON.stringify(defaults));
    sync();
    panel.querySelector('.tg-control-status').textContent = '已恢复默认参数';
  });

  panel.querySelector('[data-action="copy"]').addEventListener('click', function () {
    var output = JSON.stringify(values, null, 2);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(output).then(function () {
        panel.querySelector('.tg-control-status').textContent = '参数已复制';
      });
    } else {
      panel.querySelector('.tg-control-status').textContent = output;
    }
  });

  sync();
}());
