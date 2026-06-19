(function () {
    var menuButton = document.querySelector('.js-menu-button');
    var mobileNav = document.querySelector('.js-mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var opened = mobileNav.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
            menuButton.textContent = opened ? '×' : '☰';
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        hero.addEventListener('mouseenter', stopTimer);
        hero.addEventListener('mouseleave', startTimer);
        showSlide(0);
        startTimer();
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function runFilter(root) {
        var textInput = root.querySelector('.js-filter-text');
        var categorySelect = root.querySelector('.js-filter-category');
        var typeSelect = root.querySelector('.js-filter-type');
        var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));
        var emptyState = root.querySelector('.js-empty-state');
        var keyword = normalize(textInput ? textInput.value : '');
        var category = categorySelect ? categorySelect.value : '';
        var type = typeSelect ? typeSelect.value : '';
        var shown = 0;

        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute('data-search'));
            var cardCategory = card.getAttribute('data-category') || '';
            var cardType = card.getAttribute('data-type') || '';
            var matched = true;

            if (keyword && haystack.indexOf(keyword) === -1) {
                matched = false;
            }

            if (category && category !== '全部' && cardCategory !== category) {
                matched = false;
            }

            if (type && type !== '全部' && cardType !== type) {
                matched = false;
            }

            card.classList.toggle('hidden-by-filter', !matched);

            if (matched) {
                shown += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('show', shown === 0);
        }
    }

    Array.prototype.slice.call(document.querySelectorAll('.js-filter-root')).forEach(function (root) {
        Array.prototype.slice.call(root.querySelectorAll('.js-filter-text, .js-filter-category, .js-filter-type')).forEach(function (control) {
            control.addEventListener('input', function () {
                runFilter(root);
            });
            control.addEventListener('change', function () {
                runFilter(root);
            });
        });
        runFilter(root);
    });

    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get('q');
    var searchInput = document.querySelector('.js-filter-text');

    if (queryValue && searchInput) {
        searchInput.value = queryValue;
        var searchRoot = searchInput.closest('.js-filter-root');
        if (searchRoot) {
            runFilter(searchRoot);
        }
    }
})();
