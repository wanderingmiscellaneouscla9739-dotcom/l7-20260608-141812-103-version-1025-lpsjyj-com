(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
        var index = 0;

        var showSlide = function (nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });

            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        };

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                showSlide(i);
            });
        });

        showSlide(0);

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-chip]'));
    var emptyState = document.querySelector('[data-empty-state]');

    var applyFilter = function (term) {
        var keyword = (term || '').trim().toLowerCase();
        var visibleCount = 0;

        cards.forEach(function (card) {
            var haystack = (card.getAttribute('data-filter') || '').toLowerCase();
            var matched = !keyword || haystack.indexOf(keyword) !== -1;
            card.style.display = matched ? '' : 'none';
            if (matched) {
                visibleCount += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('is-visible', visibleCount === 0);
        }
    };

    if (filterInput && cards.length) {
        filterInput.addEventListener('input', function () {
            applyFilter(filterInput.value);
        });
    }

    chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            var value = chip.getAttribute('data-chip') || '';
            if (filterInput) {
                filterInput.value = value;
            }
            applyFilter(value);
        });
    });
}());
