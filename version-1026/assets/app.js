(function () {
  var header = document.querySelector('[data-header]');
  var navToggle = document.querySelector('[data-nav-toggle]');
  var navLinks = document.querySelector('[data-nav-links]');

  function updateHeader() {
    if (!header || header.classList.contains('is-solid')) {
      return;
    }
    if (window.scrollY > 18) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('is-open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('is-active', idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle('is-active', idx === current);
      });
    }

    dots.forEach(function (dot, idx) {
      dot.addEventListener('click', function () {
        showSlide(idx);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var empty = document.querySelector('[data-filter-empty]');

  function applyLocalFilter() {
    if (!filterInput || !cards.length) {
      return;
    }
    var term = filterInput.value.trim().toLowerCase();
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || '')).toLowerCase();
      var match = !term || haystack.indexOf(term) !== -1;
      card.hidden = !match;
      if (match) {
        visible += 1;
      }
    });
    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  if (filterInput && cards.length) {
    filterInput.addEventListener('input', applyLocalFilter);
    applyLocalFilter();
  }

  var searchForm = document.querySelector('[data-search-form]');
  var searchInput = document.querySelector('[data-search-input]');
  var searchResults = document.querySelector('[data-search-results]');
  var searchTitle = document.querySelector('[data-search-title]');

  function escapeHTML(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderSearch() {
    if (!searchInput || !searchResults || !window.SEARCH_MOVIES) {
      return;
    }
    var query = searchInput.value.trim().toLowerCase();
    var source = window.SEARCH_MOVIES;
    var list = source.filter(function (movie) {
      if (!query) {
        return movie.hot;
      }
      var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags].join(' ').toLowerCase();
      return text.indexOf(query) !== -1;
    }).slice(0, 120);

    searchResults.innerHTML = list.map(function (movie) {
      return '<article class="movie-card">'
        + '<a class="poster-link" href="' + escapeHTML(movie.url) + '">'
        + '<img src="' + escapeHTML(movie.cover) + '" alt="' + escapeHTML(movie.title) + '" loading="lazy">'
        + '<span class="play-hover">▶</span>'
        + '</a>'
        + '<div class="movie-card-body">'
        + '<a class="movie-title" href="' + escapeHTML(movie.url) + '">' + escapeHTML(movie.title) + '</a>'
        + '<div class="movie-meta"><span>' + escapeHTML(movie.year) + '</span><span>' + escapeHTML(movie.region) + '</span><span>' + escapeHTML(movie.type) + '</span></div>'
        + '<p>' + escapeHTML(movie.oneLine) + '</p>'
        + '<div class="tag-row"><span>' + escapeHTML(movie.genre) + '</span></div>'
        + '</div>'
        + '</article>';
    }).join('');

    if (searchTitle) {
      searchTitle.textContent = query ? '搜索结果' : '热门推荐';
    }
  }

  if (searchInput && searchResults) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    if (q) {
      searchInput.value = q;
    }
    renderSearch();
  }

  if (searchForm) {
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      renderSearch();
    });
  }
}());
