(function () {
  'use strict';

  var root = document.querySelector('.slick-about');
  if (!root) return;

  var slides = Array.prototype.slice.call(root.querySelectorAll(':scope > img'));
  if (slides.length < 2) return;

  var current = 0;
  var timer = 0;
  var autoplayDelay = 3000;
  var isPaused = false;
  var isVisible = true;
  var isLoopingToStart = false;

  root.classList.add('activity-carousel');
  root.setAttribute('role', 'region');
  root.setAttribute('aria-roledescription', '轮播图');
  root.setAttribute('aria-label', 'SsrCat 活动轮播');

  var track = document.createElement('div');
  track.className = 'activity-carousel-track is-jumping';
  root.insertBefore(track, root.firstChild);

  slides.forEach(function (slide, index) {
    slide.classList.add('activity-carousel-slide');
    slide.setAttribute('role', 'tabpanel');
    slide.setAttribute('aria-label', (index + 1) + ' / ' + slides.length);
    track.appendChild(slide);
  });

  var firstClone = slides[0].cloneNode(true);
  firstClone.classList.add('activity-carousel-clone');
  firstClone.removeAttribute('role');
  firstClone.removeAttribute('aria-label');
  firstClone.setAttribute('aria-hidden', 'true');
  track.appendChild(firstClone);

  var dots = document.createElement('div');
  dots.className = 'activity-carousel-dots';
  dots.setAttribute('role', 'tablist');
  dots.setAttribute('aria-label', '选择活动图片');

  slides.forEach(function (slide, index) {
    var dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'activity-carousel-dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', '显示第 ' + (index + 1) + ' 张活动图片');
    dot.addEventListener('click', function () {
      if (current === slides.length - 1 && index === 0) {
        moveTo(slides.length, true);
      } else {
        moveTo(index, true);
      }
      restart();
    });
    dots.appendChild(dot);
  });

  root.appendChild(dots);

  function updateAccessibility(activeIndex) {
    slides.forEach(function (slide, index) {
      slide.setAttribute('aria-hidden', String(index !== activeIndex));
    });
    Array.prototype.forEach.call(dots.children, function (dot, index) {
      var active = index === activeIndex;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-selected', String(active));
      dot.tabIndex = active ? 0 : -1;
    });
  }

  function moveTo(index, animated) {
    current = index;
    isLoopingToStart = index === slides.length;
    track.classList.toggle('is-jumping', !animated);
    track.style.transform = 'translate3d(' + (-index * 100) + '%, 0, 0)';
    updateAccessibility(index === slides.length ? 0 : index);
  }

  track.addEventListener('transitionend', function (event) {
    if (event.propertyName !== 'transform' || !isLoopingToStart) return;
    isLoopingToStart = false;
    moveTo(0, false);
    track.getBoundingClientRect();
    window.requestAnimationFrame(function () {
      track.classList.remove('is-jumping');
    });
  });

  function advance() {
    if (!isPaused && isVisible && !document.hidden) {
      moveTo(current + 1 >= slides.length ? slides.length : current + 1, true);
    }
    schedule();
  }

  function schedule() {
    window.clearTimeout(timer);
    timer = window.setTimeout(advance, autoplayDelay);
  }

  function restart() {
    window.clearTimeout(timer);
    schedule();
  }

  root.addEventListener('mouseenter', function () { isPaused = true; });
  root.addEventListener('mouseleave', function () { isPaused = false; restart(); });
  root.addEventListener('focusin', function () { isPaused = true; });
  root.addEventListener('focusout', function () { isPaused = false; restart(); });

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) restart();
  });

  window.addEventListener('pageshow', restart);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      isVisible = entries[0].isIntersecting;
      if (isVisible) restart();
    }, { threshold: 0.08 }).observe(root);
  }

  moveTo(0, false);
  window.requestAnimationFrame(function () {
    track.classList.remove('is-jumping');
  });
  schedule();
})();
