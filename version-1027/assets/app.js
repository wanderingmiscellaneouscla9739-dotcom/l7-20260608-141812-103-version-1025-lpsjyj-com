(function () {
  function initHeader() {
    var header = document.querySelector(".js-header");
    if (!header) {
      return;
    }

    function syncHeader() {
      if (window.scrollY > 20) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    }

    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });

    var button = document.querySelector(".js-menu-toggle");
    var menu = document.querySelector(".js-mobile-nav");
    if (!button || !menu) {
      return;
    }

    button.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var hero = document.querySelector(".js-hero");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }

    var current = 0;
    var timer = null;

    function activate(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("active", position === current);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("active", position === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        activate(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initFilters() {
    var panel = document.querySelector(".js-filter-page");
    var grid = document.querySelector(".js-filter-grid");
    if (!panel || !grid) {
      return;
    }

    var input = panel.querySelector(".js-filter-input");
    var selects = Array.prototype.slice.call(panel.querySelectorAll(".js-filter-select"));
    var sorter = panel.querySelector(".js-sort-select");
    var status = panel.querySelector(".js-filter-status");
    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));

    cards.forEach(function (card, index) {
      card.setAttribute("data-order", String(index));
    });

    function matches(card) {
      var query = normalize(input ? input.value : "");
      var text = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-type"),
        card.getAttribute("data-region"),
        card.getAttribute("data-genre"),
        card.textContent
      ].join(" "));

      if (query && text.indexOf(query) === -1) {
        return false;
      }

      for (var i = 0; i < selects.length; i += 1) {
        var select = selects[i];
        var value = select.value;
        var field = select.getAttribute("data-filter-field");
        if (value !== "all") {
          if (field === "category" && normalize(card.getAttribute("data-category")) !== normalize(value)) {
            return false;
          }
          if (field !== "category" && normalize(card.getAttribute("data-" + field)) !== normalize(value)) {
            return false;
          }
        }
      }

      return true;
    }

    function sortCards() {
      var mode = sorter ? sorter.value : "default";
      var sorted = cards.slice();

      sorted.sort(function (a, b) {
        if (mode === "year-desc") {
          return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
        }
        if (mode === "year-asc") {
          return Number(a.getAttribute("data-year")) - Number(b.getAttribute("data-year"));
        }
        if (mode === "title-asc") {
          return String(a.getAttribute("data-title")).localeCompare(String(b.getAttribute("data-title")), "zh-Hans-CN");
        }
        return Number(a.getAttribute("data-order")) - Number(b.getAttribute("data-order"));
      });

      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    function applyFilters() {
      var visible = 0;
      cards.forEach(function (card) {
        var show = matches(card);
        card.classList.toggle("is-hidden", !show);
        if (show) {
          visible += 1;
        }
      });
      sortCards();
      if (status) {
        status.textContent = visible > 0 ? "筛选结果已更新" : "没有找到匹配影片";
      }
    }

    if (input) {
      input.addEventListener("input", applyFilters);
    }
    selects.forEach(function (select) {
      select.addEventListener("change", applyFilters);
    });
    if (sorter) {
      sorter.addEventListener("change", applyFilters);
    }
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".js-player"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".player-cover");
      var source = player.getAttribute("data-video");
      var ready = false;
      var hls = null;

      if (!video || !button || !source) {
        return;
      }

      function attach() {
        if (ready) {
          return Promise.resolve();
        }
        ready = true;
        player.classList.add("is-ready");

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }

        return Promise.resolve();
      }

      function play() {
        attach().then(function () {
          var promise = video.play();
          if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
              player.classList.remove("is-playing");
            });
          }
        });
      }

      button.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        player.classList.remove("is-playing");
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initHeader();
    initHero();
    initFilters();
    initPlayers();
  });
}());
