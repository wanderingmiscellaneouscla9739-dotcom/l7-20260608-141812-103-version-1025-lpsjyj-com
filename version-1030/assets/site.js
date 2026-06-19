import { H as Hls } from './hls-vendor.js';

const ready = (callback) => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
};

const normalize = (value) => (value || '').toString().trim().toLowerCase();

function initNavigation() {
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-site-nav]');
  const search = document.querySelector('.top-search');

  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener('click', () => {
    nav.classList.toggle('is-open');
    if (search) {
      search.classList.toggle('is-open');
    }
  });
}

function initCarousel() {
  const carousel = document.querySelector('[data-carousel]');
  if (!carousel) {
    return;
  }

  const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
  if (slides.length <= 1) {
    return;
  }

  let activeIndex = 0;
  let timer = null;

  const show = (nextIndex) => {
    activeIndex = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, index) => {
      slide.classList.toggle('is-active', index === activeIndex);
    });
    dots.forEach((dot, index) => {
      dot.classList.toggle('is-active', index === activeIndex);
    });
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => show(activeIndex + 1), 5200);
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      show(index);
      start();
    });
  });

  carousel.addEventListener('mouseenter', stop);
  carousel.addEventListener('mouseleave', start);
  start();
}

function initFilters() {
  const forms = Array.from(document.querySelectorAll('[data-filter-form]'));
  if (!forms.length) {
    return;
  }

  const url = new URL(window.location.href);
  const initialQuery = url.searchParams.get('q') || '';

  forms.forEach((form) => {
    const cards = Array.from(document.querySelectorAll('[data-movie-list] .movie-card'));
    const status = document.querySelector('[data-filter-status]');
    const qInput = form.querySelector('input[name="q"]');
    const yearInput = form.querySelector('[name="year"]');
    const genreInput = form.querySelector('[name="genre"]');

    if (qInput && initialQuery) {
      qInput.value = initialQuery;
    }

    const apply = () => {
      const query = normalize(qInput ? qInput.value : '');
      const year = normalize(yearInput ? yearInput.value : '');
      const genre = normalize(genreInput ? genreInput.value : '');

      cards.forEach((card) => {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.region,
          card.dataset.tags,
          card.dataset.year,
        ].join(' '));
        const matchesQuery = !query || haystack.includes(query);
        const matchesYear = !year || normalize(card.dataset.year) === year;
        const matchesGenre = !genre || haystack.includes(genre);
        card.hidden = !(matchesQuery && matchesYear && matchesGenre);
      });

      if (status) {
        status.textContent = '筛选结果已更新';
      }
    };

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      apply();
    });

    ['input', 'change'].forEach((eventName) => {
      form.addEventListener(eventName, () => apply());
    });

    if (initialQuery) {
      apply();
    }
  });
}

function attachHls(video) {
  if (video.dataset.ready === 'true') {
    return;
  }

  const src = video.dataset.src;
  if (!src) {
    return;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = src;
  } else if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90,
    });
    hls.loadSource(src);
    hls.attachMedia(video);
    video._hls = hls;
  } else {
    video.src = src;
  }

  video.dataset.ready = 'true';
}

function initPlayers() {
  const videos = Array.from(document.querySelectorAll('video[data-src]'));
  if (!videos.length) {
    return;
  }

  videos.forEach((video) => {
    const overlay = document.querySelector(`[data-player="${video.id}"]`);

    const play = async () => {
      attachHls(video);
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      try {
        await video.play();
      } catch (error) {
        video.controls = true;
      }
    };

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    video.addEventListener('click', () => {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', () => {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
  });
}

ready(() => {
  initNavigation();
  initCarousel();
  initFilters();
  initPlayers();
});
