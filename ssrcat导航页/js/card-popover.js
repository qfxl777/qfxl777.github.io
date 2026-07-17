(function () {
  'use strict';

  var selectors = '.pricing-table .card-deck > hover-tilt';
  var activeOverlay = null;

  function closeOverlay() {
    if (!activeOverlay || activeOverlay.classList.contains('is-closing')) return;
    var overlay = activeOverlay;
    overlay.classList.add('is-closing');
    document.body.classList.remove('card-popover-open');
    window.setTimeout(function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      if (activeOverlay === overlay) activeOverlay = null;
    }, 420);
  }

  function getPlanBackData(source) {
    var title = (source.querySelector('.card-title.pt-3')?.textContent || '').trim();
    var link = source.querySelector('.plan-card-bottom a, .card-body a')?.getAttribute('href') || '#';

    if (title.indexOf('高级') !== -1) {
      return {
        theme: 'premium',
        label: '高级订阅',
        traffic: '500GB',
        tag: '精选方案',
        annualLabel: '年度订阅',
        annualNote: '年费优惠',
        annualPrice: '￥216',
        annualAvg: '月均 ￥18',
        halfLabel: '半年订阅',
        halfNote: '半年优惠',
        halfPrice: '￥126',
        halfAvg: '月均 ￥21',
        quarterLabel: '季度订阅',
        quarterPrice: '￥69',
        quarterAvg: '月均 ￥23',
        monthlyLabel: '月度订阅',
        monthlyNote: '灵活月付',
        monthlyPrice: '￥29.9',
        monthlyAvg: '月均 ￥29.9',
        cta: '选择高级订阅',
        href: link
      };
    }

    if (title.indexOf('普通') !== -1) {
      return {
        theme: 'basic',
        label: '普通订阅',
        traffic: '100GB',
        tag: '基础方案',
        annualLabel: '年度订阅',
        annualNote: '年费优惠',
        annualPrice: '￥168',
        annualAvg: '月均 ￥14',
        halfLabel: '半年订阅',
        halfNote: '半年优惠',
        halfPrice: '￥96',
        halfAvg: '月均 ￥16',
        quarterLabel: '季度订阅',
        quarterPrice: '￥54',
        quarterAvg: '月均 ￥18',
        monthlyLabel: '月度订阅',
        monthlyNote: '灵活月付',
        monthlyPrice: '￥21.9',
        monthlyAvg: '月均 ￥21.9',
        cta: '选择普通订阅',
        href: link
      };
    }

    if (title.indexOf('按量') !== -1) {
      return {
        theme: 'usage',
        label: '按量订阅',
        traffic: '1000GB',
        tag: '按量方案',
        annualLabel: '一次性订阅',
        annualNote: '不限时间',
        annualPrice: '￥299',
        annualAvg: '1000GB 总流量',
        quarterLabel: '',
        monthlyLabel: '',
        cta: '选择按量订阅',
        href: link
      };
    }

    return {
      theme: 'soon',
      label: 'SsrCat',
      traffic: '订阅计划',
      tag: 'SsrCat 推荐',
      annualLabel: '更多订阅',
      annualNote: '灵活选择',
      annualPrice: 'NEW',
      annualAvg: '更多内容即将推出',
      quarterLabel: '稳定线路',
      quarterPrice: '高速',
      quarterAvg: '多设备同时使用',
      monthlyLabel: '月度订阅',
      monthlyNote: '即将开放',
      monthlyPrice: 'NEW',
      monthlyAvg: '更多选择',
      cta: '返回正面查看',
      href: '#'
    };
  }

  function buildBackMarkup(source) {
    var data = getPlanBackData(source);
    return '' +
      '<div class="sub-back-card sub-back-theme-' + data.theme + '">' +
        '<div class="sub-back-hero">' +
          '<div class="sub-back-pill"><i class="fa-solid fa-gem sub-back-diamond" aria-hidden="true"></i>' + data.tag + '</div>' +
          '<img src="img/pricing-card-logo.png" alt="" class="sub-back-watermark">' +
        '</div>' +
        '<div class="sub-back-body">' +
          '<div class="sub-back-heading">' +
            '<strong>【' + data.label + '】' + data.traffic + '</strong>' +
            '<span>SsrCat 稳定高速网络服务</span>' +
          '</div>' +
          '<div class="sub-back-offer sub-back-offer-primary">' +
            '<div class="sub-back-plan-label"><strong>' + data.annualLabel + '</strong></div>' +
            '<div class="sub-back-price"><strong>' + data.annualPrice + '</strong><span>' + data.annualAvg + '</span></div>' +
          '</div>' +
          (data.halfLabel ? '<div class="sub-back-offer">' +
            '<div class="sub-back-plan-label"><strong>' + data.halfLabel + '</strong></div>' +
            '<div class="sub-back-price"><strong>' + data.halfPrice + '</strong><span>' + data.halfAvg + '</span></div>' +
          '</div>' : '') +
          (data.quarterLabel ? '<div class="sub-back-offer">' +
            '<div class="sub-back-plan-label"><strong>' + data.quarterLabel + '</strong></div>' +
            '<div class="sub-back-price"><strong>' + data.quarterPrice + '</strong><span>' + data.quarterAvg + '</span></div>' +
          '</div>' : '') +
          (data.monthlyLabel ? '<div class="sub-back-offer">' +
            '<div class="sub-back-plan-label"><strong>' + data.monthlyLabel + '</strong></div>' +
            '<div class="sub-back-price"><strong>' + data.monthlyPrice + '</strong><span>' + data.monthlyAvg + '</span></div>' +
          '</div>' : '') +
          '<div class="sub-back-hint">再次点击卡片返回正面</div>' +
        '</div>' +
      '</div>';
  }

  function openOverlay(source) {
    if (activeOverlay) return;

    var rect = source.getBoundingClientRect();
    var isMobileViewport = window.innerWidth <= 767.98;
    var widthLimit = isMobileViewport ? 350 : 380;
    var widthRatio = isMobileViewport ? .82 : .78;
    /* The card keeps its 5:7 ratio, so its width must also respect the
       available viewport height. This prevents short devices from cropping
       the back while preserving identical proportions everywhere. */
    var verticalReserve = isMobileViewport ? 132 : 112;
    var heightLimitedWidth = Math.max(210, (window.innerHeight - verticalReserve) * 5 / 7);
    var expandedWidth = Math.min(window.innerWidth * widthRatio, widthLimit, heightLimitedWidth);
    var fromX = rect.left + rect.width / 2 - window.innerWidth / 2;
    var fromY = rect.top + rect.height / 2 - window.innerHeight / 2;
    var fromScale = Math.max(.2, rect.width / expandedWidth);
    var detailScale = Math.max(1, expandedWidth / rect.width);

    var overlay = document.createElement('div');
    overlay.className = 'card-popover pricing-table';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', '套餐卡片详情');

    var stage = document.createElement('div');
    stage.className = 'card-popover-stage';
    stage.style.width = expandedWidth.toFixed(2) + 'px';
    stage.style.setProperty('--from-x', fromX.toFixed(2) + 'px');
    stage.style.setProperty('--from-y', fromY.toFixed(2) + 'px');
    stage.style.setProperty('--from-scale', fromScale.toFixed(4));
    stage.style.setProperty('--source-w', rect.width.toFixed(2) + 'px');
    stage.style.setProperty('--source-h', rect.height.toFixed(2) + 'px');
    stage.style.setProperty('--expanded-scale', (expandedWidth / rect.width).toFixed(4));
    stage.style.setProperty('--detail-scale', detailScale.toFixed(4));

    function getPx(element, property) {
      if (!element) return 0;
      var value = window.getComputedStyle(element).getPropertyValue(property);
      var number = parseFloat(value);
      return Number.isFinite(number) ? number : 0;
    }

    function setScaledVar(name, element, property) {
      var value = getPx(element, property);
      if (!value) return;
      stage.style.setProperty(name, (value * detailScale).toFixed(2) + 'px');
    }

    var sourceBody = source.querySelector('.card-body');
    var sourceTop = source.querySelector('.plan-card-top');
    var sourceLogo = source.querySelector('.plan-card-logo');
    var sourceTitle = source.querySelector('.card-title.pt-3');
    var sourcePrice = source.querySelector('.plan-price');
    var sourcePriceValue = source.querySelector('.plan-price-value');
    var sourcePriceCycle = source.querySelector('.plan-price-cycle');
    var sourceList = source.querySelector('.pricing-list');
    var sourceListItem = source.querySelector('.pricing-list li');
    var sourceBottom = source.querySelector('.plan-card-bottom');
    var sourceCode = source.querySelector('.plan-code');
    var sourceButton = source.querySelector('.btn');
    var sourceBadge = source.querySelector('.holo-badge');

    [
      ['--detail-body-pad-top', sourceBody, 'padding-top'],
      ['--detail-body-pad-right', sourceBody, 'padding-right'],
      ['--detail-body-pad-bottom', sourceBody, 'padding-bottom'],
      ['--detail-body-pad-left', sourceBody, 'padding-left'],
      ['--detail-top-min-height', sourceTop, 'min-height'],
      ['--detail-top-font-size', sourceTop, 'font-size'],
      ['--detail-logo-width', sourceLogo, 'width'],
      ['--detail-logo-height', sourceLogo, 'height'],
      ['--detail-title-font-size', sourceTitle, 'font-size'],
      ['--detail-title-margin-bottom', sourceTitle, 'margin-bottom'],
      ['--detail-price-gap', sourcePrice, 'column-gap'],
      ['--detail-price-margin-bottom', sourcePrice, 'margin-bottom'],
      ['--detail-price-font-size', sourcePriceValue, 'font-size'],
      ['--detail-cycle-font-size', sourcePriceCycle, 'font-size'],
      ['--detail-cycle-pad-bottom', sourcePriceCycle, 'padding-bottom'],
      ['--detail-list-min-height', sourceList, 'min-height'],
      ['--detail-list-margin-top', sourceList, 'margin-top'],
      ['--detail-list-margin-bottom', sourceList, 'margin-bottom'],
      ['--detail-list-item-font-size', sourceListItem, 'font-size'],
      ['--detail-list-item-margin-bottom', sourceListItem, 'margin-bottom'],
      ['--detail-bottom-min-height', sourceBottom, 'min-height'],
      ['--detail-bottom-gap', sourceBottom, 'column-gap'],
      ['--detail-bottom-pad-top', sourceBottom, 'padding-top'],
      ['--detail-bottom-pad-right', sourceBottom, 'padding-right'],
      ['--detail-bottom-pad-bottom', sourceBottom, 'padding-bottom'],
      ['--detail-bottom-pad-left', sourceBottom, 'padding-left'],
      ['--detail-bottom-margin-top', sourceBottom, 'margin-top'],
      ['--detail-bottom-margin-right', sourceBottom, 'margin-right'],
      ['--detail-bottom-margin-bottom', sourceBottom, 'margin-bottom'],
      ['--detail-bottom-margin-left', sourceBottom, 'margin-left'],
      ['--detail-code-font-size', sourceCode, 'font-size'],
      ['--detail-btn-min-width', sourceButton, 'min-width'],
      ['--detail-btn-pad-top', sourceButton, 'padding-top'],
      ['--detail-btn-pad-right', sourceButton, 'padding-right'],
      ['--detail-btn-pad-bottom', sourceButton, 'padding-bottom'],
      ['--detail-btn-pad-left', sourceButton, 'padding-left'],
      ['--detail-btn-font-size', sourceButton, 'font-size'],
      ['--detail-badge-top', sourceBadge, 'top'],
      ['--detail-badge-right', sourceBadge, 'right'],
      ['--detail-badge-font-size', sourceBadge, 'font-size']
    ].forEach(function (item) {
      setScaledVar(item[0], item[1], item[2]);
    });

    var flipper = document.createElement('div');
    flipper.className = 'card-popover-flipper is-flip-settled';

    var front = document.createElement('div');
    front.className = 'card-popover-face card-popover-front';
    var clonedTilt = source.cloneNode(true);
    clonedTilt.classList.add('pricing-tilt-expanded');
    clonedTilt.removeAttribute('tabindex');
    clonedTilt.removeAttribute('role');
    clonedTilt.querySelectorAll('.holo-card').forEach(function (card) {
      card.removeAttribute('data-ssrcat-holo-bound');
      card.classList.remove('is-holo-active', 'is-holo-tap');
    });
    front.appendChild(clonedTilt);

    var back = document.createElement('div');
    back.className = 'card-popover-face card-popover-back';
    back.innerHTML = buildBackMarkup(source);

    var close = document.createElement('button');
    close.className = 'card-popover-close';
    close.type = 'button';
    close.setAttribute('aria-label', '关闭卡片');
    close.innerHTML = '&times;';

    var flip = document.createElement('button');
    flip.className = 'card-popover-flip';
    flip.type = 'button';
    flip.setAttribute('aria-label', '翻转卡片查看套餐详情');
    flip.setAttribute('aria-pressed', 'false');
    flip.innerHTML = '<span aria-hidden="true">↻</span>';

    flipper.appendChild(front);
    flipper.appendChild(back);
    stage.appendChild(flipper);
    overlay.appendChild(stage);
    overlay.appendChild(flip);
    overlay.appendChild(close);
    document.body.appendChild(overlay);

    window.setTimeout(function () {
      var expandedCard = clonedTilt.querySelector('.holo-card');
      var holoApi = window.SsrCatHoloCards || document.ssrcatHoloCards;
      if (expandedCard && holoApi) {
        holoApi.initCard(expandedCard);
      }
      if (expandedCard) {
        document.dispatchEvent(new CustomEvent('ssrcat:init-holo-card', {
          detail: { card: expandedCard }
        }));
      }
    }, 0);

    activeOverlay = overlay;
    document.body.classList.add('card-popover-open');

    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        overlay.classList.add('is-open');
      });
    });

    var flipSettleTimer = null;

    function settleFlip() {
      window.clearTimeout(flipSettleTimer);
      flipper.classList.remove('is-flipping');
      flipper.classList.add('is-flip-settled');
      flip.disabled = false;
    }

    flipper.addEventListener('transitionend', function (event) {
      if (event.target !== flipper || event.propertyName.indexOf('transform') === -1) return;
      settleFlip();
    });

    function toggleFlip() {
      if (flipper.classList.contains('is-flipping')) return;

      var isFlipped = !flipper.classList.contains('is-flipped');
      /* Reveal both backface-hidden planes before rotation begins. They stay
         continuous for the full transform and are cleaned up only at rest. */
      flipper.classList.remove('is-flip-settled');
      flipper.classList.add('is-flipping');
      flip.disabled = true;

      /* Flush the revealed planes once, then start the transform immediately.
         This avoids Safari/background-tab rAF throttling delaying the flip. */
      void flipper.offsetWidth;
      flipper.classList.toggle('is-flipped', isFlipped);
      flip.setAttribute('aria-pressed', String(isFlipped));
      flip.setAttribute('aria-label', isFlipped ? '翻转卡片返回正面' : '翻转卡片查看套餐详情');
      flipSettleTimer = window.setTimeout(settleFlip, 900);
    }

    stage.addEventListener('click', function (event) {
      if (event.target.closest('a, button, .btn')) return;
      toggleFlip();
    });

    flip.addEventListener('click', function () {
      toggleFlip();
    });

    close.addEventListener('click', closeOverlay);
    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) closeOverlay();
    });
    window.setTimeout(function () { close.focus(); }, 360);
  }

  document.querySelectorAll(selectors).forEach(function (card) {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', '放大并翻转此套餐卡片');

    card.addEventListener('click', function (event) {
      if (event.target.closest('a, button, .btn')) return;
      openOverlay(card);
    });

    card.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      openOverlay(card);
    });
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeOverlay();
  });
})();
