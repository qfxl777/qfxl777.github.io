(function () {
  'use strict';

  function shieldImage(img) {
    if (!img || img.nodeType !== 1 || img.tagName !== 'IMG') {
      return;
    }

    img.setAttribute('draggable', 'false');
    img.setAttribute('data-ssrcat-image-shield', '');
    img.setAttribute('data-no-hover-preview', 'true');
    img.setAttribute('data-no-image-preview', 'true');
  }

  function shieldImages(root) {
    if (!root || root.nodeType !== 1) {
      return;
    }

    if (root.tagName === 'IMG') {
      shieldImage(root);
      return;
    }

    root.querySelectorAll('img').forEach(shieldImage);
  }

  function boot() {
    shieldImages(document.documentElement);

    document.addEventListener('dragstart', function (event) {
      if (event.target && event.target.tagName === 'IMG') {
        event.preventDefault();
      }
    }, true);

    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(shieldImages);
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
