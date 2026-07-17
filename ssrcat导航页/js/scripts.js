$(function () {

    // init feather icons
    feather.replace();

    // init tooltip & popovers
    $('[data-toggle="tooltip"]').tooltip();
    $('[data-toggle="popover"]').popover();

    //page scroll
    $('a.page-scroll').bind('click', function (event) {
        var $anchor = $(this);
        var target = $($anchor.attr('href'));
        if (window.SsrCatLenis && target.length) {
            window.SsrCatLenis.scrollTo(target.get(0), {
                offset: -20,
                duration: 1.05
            });
        } else {
            $('html, body').stop().animate({
                scrollTop: target.offset().top - 20
            }, 1000);
        }
        event.preventDefault();
    });

    //toggle scroll menu
    var scrollTop = 0;
    $(window).scroll(function () {
        var scroll = $(window).scrollTop();
        //adjust menu background
        if (scroll > 80) {
            if (scroll > scrollTop) {
                $('.smart-scroll').addClass('scrolling').removeClass('up');
            } else {
                $('.smart-scroll').addClass('up');
            }
        } else {
            // remove if scroll = scrollTop
            $('.smart-scroll').removeClass('scrolling').removeClass('up');
        }

        scrollTop = scroll;

        // adjust scroll to top
        if (scroll >= 600) {
            $('.scroll-top').addClass('active');
        } else {
            $('.scroll-top').removeClass('active');
        }
        return false;
    });

    // scroll top top
    $('.scroll-top').click(function () {
        if (window.SsrCatLenis) {
            window.SsrCatLenis.scrollTo(0, { duration: 1.05 });
        } else {
            $('html, body').stop().animate({
                scrollTop: 0
            }, 1000);
        }
    });

    /**Theme switcher - DEMO PURPOSE ONLY */
    $('.switcher-trigger').click(function () {
        $('.switcher-wrap').toggleClass('active');
    });
    $('.color-switcher ul li').click(function () {
        var color = $(this).attr('data-color');
        $('#theme-color').attr("href", "css/" + color + ".css");
        $('.color-switcher ul li').removeClass('active');
        $(this).addClass('active');
    });
});

// Smooth delayed inverted cursor dot (desktop pointer devices only).
(function () {
    var canUseCustomCursor = window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!canUseCustomCursor) return;

    var dot = document.createElement('div');
    dot.className = 'cursor-invert-dot';
    dot.setAttribute('aria-hidden', 'true');
    document.body.appendChild(dot);
    document.documentElement.classList.add('cursor-dot-enabled');

    var targetX = -100;
    var targetY = -100;
    var currentX = -100;
    var currentY = -100;
    var hasMoved = false;
    var followSpeed = 0.16;

    document.addEventListener('mousemove', function (event) {
        targetX = event.clientX;
        targetY = event.clientY;
        if (!hasMoved) {
            currentX = targetX;
            currentY = targetY;
            hasMoved = true;
            dot.classList.add('is-visible');
        }
    }, { passive: true });

    document.addEventListener('mouseleave', function () {
        dot.classList.remove('is-visible');
    });

    document.addEventListener('mouseenter', function () {
        if (hasMoved) dot.classList.add('is-visible');
    });

    function animateCursor() {
        currentX += (targetX - currentX) * followSpeed;
        currentY += (targetY - currentY) * followSpeed;
        dot.style.transform = 'translate3d(' + (currentX - 13) + 'px,' + (currentY - 13) + 'px,0)';
        window.requestAnimationFrame(animateCursor);
    }

    window.requestAnimationFrame(animateCursor);
})();

// FAQ: plain text layout with an animated expand button.
(function () {
    document.querySelectorAll('#faq .faq-toggle').forEach(function (button) {
        button.addEventListener('click', function () {
            var item = button.closest('.faq-item');
            var isOpen = item.classList.toggle('is-open');
            button.setAttribute('aria-expanded', String(isOpen));
        });
    });
})();
