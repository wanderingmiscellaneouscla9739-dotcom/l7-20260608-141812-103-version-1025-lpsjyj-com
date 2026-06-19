(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var navMenu = document.querySelector('[data-nav-menu]');

    if (navToggle && navMenu) {
      navToggle.addEventListener('click', function () {
        var open = navMenu.classList.toggle('is-open');
        navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
      var prev = slider.querySelector('[data-hero-prev]');
      var next = slider.querySelector('[data-hero-next]');
      var index = 0;
      var timer = null;

      function show(nextIndex) {
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
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
          start();
        });
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
          start();
        });
      });

      slider.addEventListener('mouseenter', stop);
      slider.addEventListener('mouseleave', start);
      show(0);
      start();
    });

    document.querySelectorAll('[data-filter-form]').forEach(function (panel) {
      var scope = panel.closest('section') || document;
      var list = scope.querySelector('[data-card-list]') || document.querySelector('[data-card-list]');
      var cards = list ? Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]')) : [];
      var searchInput = panel.querySelector('[data-search-input]');
      var typeSelect = panel.querySelector('[data-filter-type]');
      var categorySelect = panel.querySelector('[data-filter-category]');
      var sortSelect = panel.querySelector('[data-sort-select]');
      var countEl = panel.querySelector('[data-result-count]');
      var emptyState = scope.querySelector('[data-empty-state]') || document.querySelector('[data-empty-state]');
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');

      if (query && searchInput) {
        searchInput.value = query;
      }

      function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
      }

      function cardText(card) {
        return normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.type,
          card.dataset.category,
          card.dataset.tags
        ].join(' '));
      }

      function sortCards(visible) {
        if (!sortSelect || !list) {
          return;
        }
        var mode = sortSelect.value;
        visible.sort(function (a, b) {
          if (mode === 'year') {
            return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
          }
          if (mode === 'title') {
            return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-CN');
          }
          return Number(b.dataset.score || 0) - Number(a.dataset.score || 0);
        });
        visible.forEach(function (card) {
          list.appendChild(card);
        });
      }

      function applyFilters() {
        var keyword = normalize(searchInput ? searchInput.value : '');
        var typeValue = normalize(typeSelect ? typeSelect.value : '');
        var categoryValue = normalize(categorySelect ? categorySelect.value : '');
        var visible = [];

        cards.forEach(function (card) {
          var text = cardText(card);
          var typeMatch = !typeValue || normalize(card.dataset.type).indexOf(typeValue) !== -1;
          var categoryMatch = !categoryValue || normalize(card.dataset.category) === categoryValue;
          var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
          var show = typeMatch && categoryMatch && keywordMatch;
          card.classList.toggle('is-hidden-card', !show);
          if (show) {
            visible.push(card);
          }
        });

        sortCards(visible);

        if (countEl) {
          countEl.textContent = String(visible.length);
        }

        if (emptyState) {
          emptyState.classList.toggle('is-visible', visible.length === 0);
        }
      }

      [searchInput, typeSelect, categorySelect, sortSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilters);
          control.addEventListener('change', applyFilters);
        }
      });

      applyFilters();
    });
  });
})();
