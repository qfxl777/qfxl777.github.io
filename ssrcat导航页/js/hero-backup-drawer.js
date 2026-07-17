(function () {
  'use strict';

  var menu = document.querySelector('.hero-backup-menu');
  if (!menu) return;

  var trigger = menu.querySelector('.hero-backup-trigger');
  var drawer = menu.querySelector('.hero-backup-drawer');
  var scrollArea = menu.querySelector('.hero-backup-drawer-scroll');
  var scrollCue = menu.querySelector('.hero-backup-scroll-cue');
  var bookmarkAction = menu.querySelector('.hero-bookmark-action');
  var bookmarkCopy = menu.querySelector('.hero-bookmark-copy');
  var bookmarkCopyText = menu.querySelector('.hero-bookmark-copy-text');
  var latencyLinks = menu.querySelectorAll('[data-latency-url]');
  var platformPlaceholders = menu.querySelectorAll('[data-platform-placeholder]');
  var latestEmailLink = menu.querySelector('[data-copy-email]');
  var bookmarkUrl = 'https://ssrcat.com';
  var toastTimer;
  if (!trigger || !drawer || !scrollArea || !scrollCue) return;

  function syncScrollCue() {
    var hasMore = scrollArea.scrollHeight > scrollArea.clientHeight + 1;
    var atTop = scrollArea.scrollTop <= 2;
    scrollCue.classList.toggle('is-visible', menu.classList.contains('is-open') && hasMore && atTop);
  }

  function setOpen(open, restoreFocus) {
    menu.classList.toggle('is-open', open);
    trigger.setAttribute('aria-expanded', String(open));
    drawer.setAttribute('aria-hidden', String(!open));
    window.requestAnimationFrame(syncScrollCue);
    if (open) runLatencyTests();
    if (!open && restoreFocus) trigger.focus({ preventScroll: true });
  }

  function toggle() {
    setOpen(!menu.classList.contains('is-open'));
  }

  function setLatencyState(link, state, text) {
    var pill = link.querySelector('.hero-latency-pill');
    var icon = pill && pill.querySelector('i');
    var value = pill && pill.querySelector('.hero-latency-value');
    if (!pill || !icon || !value) return;
    pill.className = 'hero-latency-pill is-' + state;
    icon.className = state === 'testing' ? 'fa-solid fa-spinner' : state === 'timeout' ? 'fa-solid fa-xmark' : 'fa-solid fa-circle-check';
    value.textContent = text;
  }

  function testLatency(link) {
    var url = link.getAttribute('data-latency-url');
    var host = new URL(url).hostname;
    var controller = window.AbortController ? new AbortController() : null;
    var timeoutId = window.setTimeout(function () {
      if (controller) controller.abort();
    }, 6500);
    setLatencyState(link, 'testing', '检测');

    fetch('health-check.php?host=' + encodeURIComponent(host) + '&t=' + Date.now(), {
      cache: 'no-store',
      signal: controller ? controller.signal : undefined
    }).then(function (response) {
      if (!response.ok) throw new Error('health_check_failed');
      return response.json();
    }).then(function (result) {
      window.clearTimeout(timeoutId);
      if (!result.ok) {
        setLatencyState(link, 'timeout', result.status ? String(result.status) : '超时');
        return;
      }
      var latency = Math.max(1, Number(result.latencyMs) || 1);
      setLatencyState(link, latency <= 200 ? 'fast' : 'slow', latency + 'ms');
    }).catch(function () {
      window.clearTimeout(timeoutId);
      setLatencyState(link, 'timeout', '超时');
    });
  }

  function runLatencyTests() {
    latencyLinks.forEach(testLatency);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
    return Promise.resolve();
  }

  trigger.addEventListener('pointerup', function (event) {
    if (event.button !== undefined && event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    toggle();
  });

  trigger.addEventListener('click', function (event) {
    event.stopPropagation();
    if (event.detail === 0) toggle();
  });

  document.addEventListener('click', function (event) {
    if (menu.classList.contains('is-open') && !menu.contains(event.target)) {
      setOpen(false, false);
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && menu.classList.contains('is-open')) {
      setOpen(false, true);
    }
  });

  scrollArea.addEventListener('scroll', syncScrollCue, { passive: true });
  window.addEventListener('resize', syncScrollCue, { passive: true });

  function getBookmarkInstruction() {
    var ua = navigator.userAgent || '';
    var platform = navigator.platform || '';
    if (/iPad|iPhone|iPod/.test(ua) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
      return '已复制链接，iPhone/iPad 请点击 Safari 分享按钮，再选择“添加书签”或“添加到主屏幕”。';
    }
    if (/Mac/.test(platform)) {
      return '已复制链接，macOS 请按 ⌘D 收藏，或从浏览器“书签”菜单添加。';
    }
    if (/Android/.test(ua)) {
      return '已复制链接，Android 请打开浏览器菜单，选择“收藏”或“添加到主屏幕”。';
    }
    if (/Win/.test(platform)) {
      return '已复制链接，Windows 请按 Ctrl+D 收藏当前网站。';
    }
    return '已复制链接，请使用浏览器书签菜单收藏本页。';
  }

  function showBookmarkToast(message) {
    var toast = document.querySelector('.hero-bookmark-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'hero-bookmark-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 3200);
  }

  function copyBookmarkUrl() {
      var copyPromise = navigator.clipboard && navigator.clipboard.writeText
        ? navigator.clipboard.writeText(bookmarkUrl)
        : Promise.reject();

      copyPromise.then(function () {
        if (bookmarkCopyText) {
          bookmarkCopyText.textContent = '已复制';
          window.setTimeout(function () {
            bookmarkCopyText.textContent = '复制/收藏';
          }, 1400);
        }
        showBookmarkToast(getBookmarkInstruction());
      }).catch(function () {
        window.prompt('复制网站地址后使用浏览器书签收藏', bookmarkUrl);
      });
  }

  if (bookmarkAction) {
    bookmarkAction.addEventListener('click', copyBookmarkUrl);
  }

  if (bookmarkCopy) {
    bookmarkCopy.addEventListener('click', copyBookmarkUrl);
  }

  latencyLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      copyText(link.href).then(function () {
        showBookmarkToast('已复制链接，正在新页面打开');
      }).catch(function () {});
    });
  });

  if (latestEmailLink) {
    latestEmailLink.addEventListener('click', function () {
      copyText(latestEmailLink.getAttribute('data-copy-email')).then(function () {
        showBookmarkToast('邮箱已复制，正在打开邮件客户端');
      }).catch(function () {});
    });
  }

  platformPlaceholders.forEach(function (button) {
    button.addEventListener('click', function () {
      showBookmarkToast(button.getAttribute('data-platform-placeholder') + ' 链接待配置');
    });
  });

  syncScrollCue();
})();
