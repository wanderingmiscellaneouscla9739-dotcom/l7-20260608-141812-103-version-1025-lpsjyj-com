(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var thumbs = Array.prototype.slice.call(document.querySelectorAll('[data-hero-to]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === current);
    });
    thumbs.forEach(function (thumb, i) {
      thumb.classList.toggle('active', i === current);
    });
  }

  function startHero() {
    if (!slides.length) {
      return;
    }
    window.clearInterval(timer);
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  thumbs.forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      showSlide(Number(thumb.getAttribute('data-hero-to')) || 0);
      startHero();
    });
  });

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(current - 1);
      startHero();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
      startHero();
    });
  }

  startHero();

  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var grid = document.querySelector('[data-card-grid]');
  var empty = document.querySelector('[data-empty-state]');
  var mainSearch = document.querySelector('[data-site-search]');
  var secondarySearch = document.querySelector('[data-site-search-secondary]');
  var typeFilter = document.querySelector('[data-type-filter]');
  var categoryFilter = document.querySelector('[data-category-filter]');
  var sortFilter = document.querySelector('[data-sort-filter]');

  function paramsQuery() {
    var query = new URLSearchParams(window.location.search).get('q');
    return query ? query.trim() : '';
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function cardText(card) {
    return normalize([
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-year'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-tags')
    ].join(' '));
  }

  function valueOf(input) {
    return input ? input.value.trim() : '';
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var keyword = normalize([valueOf(mainSearch), valueOf(secondarySearch)].join(' '));
    var typeValue = normalize(valueOf(typeFilter));
    var categoryValue = valueOf(categoryFilter);
    var shown = 0;

    cards.forEach(function (card) {
      var ok = true;
      if (keyword && cardText(card).indexOf(keyword) === -1) {
        ok = false;
      }
      if (typeValue && normalize(card.getAttribute('data-type')).indexOf(typeValue) === -1) {
        ok = false;
      }
      if (categoryValue && card.getAttribute('data-category') !== categoryValue) {
        ok = false;
      }
      card.style.display = ok ? '' : 'none';
      if (ok) {
        shown += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('show', shown === 0);
    }
  }

  function sortCards() {
    if (!grid || !sortFilter) {
      return;
    }
    var value = sortFilter.value;
    var sorted = cards.slice().sort(function (a, b) {
      if (value === 'views') {
        return Number(b.getAttribute('data-views') || 0) - Number(a.getAttribute('data-views') || 0);
      }
      if (value === 'likes') {
        return Number(b.getAttribute('data-likes') || 0) - Number(a.getAttribute('data-likes') || 0);
      }
      if (value === 'year') {
        return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
      }
      return String(b.getAttribute('data-date') || '').localeCompare(String(a.getAttribute('data-date') || ''));
    });
    sorted.forEach(function (card) {
      grid.appendChild(card);
    });
  }

  var query = paramsQuery();
  if (query && mainSearch) {
    mainSearch.value = query;
  }

  [mainSearch, secondarySearch, typeFilter, categoryFilter].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });

  if (sortFilter) {
    sortFilter.addEventListener('change', function () {
      sortCards();
      applyFilters();
    });
    sortCards();
  }

  applyFilters();
})();
