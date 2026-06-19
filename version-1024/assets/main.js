(function () {
    const body = document.body;
    const toggle = document.querySelector("[data-menu-toggle]");

    if (toggle) {
        toggle.addEventListener("click", function () {
            body.classList.toggle("nav-open");
        });
    }

    document.querySelectorAll(".mobile-nav a").forEach(function (link) {
        link.addEventListener("click", function () {
            body.classList.remove("nav-open");
        });
    });

    document.querySelectorAll("img").forEach(function (image) {
        image.addEventListener("error", function () {
            image.classList.add("is-missing");
        }, { once: true });
    });

    document.querySelectorAll("[data-redirect-search]").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            const input = form.querySelector("input[name='q']");
            const value = input ? input.value.trim() : "";
            const url = value ? "./movies.html?q=" + encodeURIComponent(value) : "./movies.html";
            window.location.href = url;
        });
    });

    const params = new URLSearchParams(window.location.search);
    const queryFromUrl = params.get("q") || "";

    document.querySelectorAll("[data-filter-root]").forEach(function (root) {
        const input = root.querySelector(".js-search-input");
        const chips = Array.from(root.querySelectorAll("[data-filter-value]"));
        const grid = root.parentElement.querySelector("[data-card-grid]");
        const empty = root.querySelector("[data-empty-state]");
        const cards = grid ? Array.from(grid.querySelectorAll(".movie-card")) : [];
        let activeFilter = "all";

        const preset = chips.find(function (chip) {
            return chip.classList.contains("is-active") && chip.dataset.filterValue !== "all";
        });

        if (preset) {
            activeFilter = preset.dataset.filterValue;
        }

        if (input && queryFromUrl) {
            input.value = queryFromUrl;
        }

        function applyFilters() {
            const query = input ? input.value.trim().toLowerCase() : "";
            let visible = 0;

            cards.forEach(function (card) {
                const haystack = (card.dataset.search || "").toLowerCase();
                const matchesQuery = !query || haystack.indexOf(query) !== -1;
                const matchesFilter = activeFilter === "all" || card.dataset.category === activeFilter;
                const show = matchesQuery && matchesFilter;

                card.classList.toggle("is-hidden", !show);
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        if (input) {
            input.addEventListener("input", applyFilters);
        }

        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                activeFilter = chip.dataset.filterValue || "all";
                chips.forEach(function (item) {
                    item.classList.toggle("is-active", item === chip);
                });
                applyFilters();
            });
        });

        applyFilters();
    });

    document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
        const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
        const prev = carousel.querySelector("[data-hero-prev]");
        const next = carousel.querySelector("[data-hero-next]");
        let index = 0;
        let timer;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
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
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });

        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        show(0);
        start();
    });

    function preparePlayer(shell) {
        const video = shell.querySelector("video");
        const button = shell.querySelector(".player-overlay");
        const message = shell.querySelector(".player-message");
        const source = shell.dataset.videoUrl;
        let hlsInstance = null;
        let ready = false;

        function setMessage(value) {
            if (message) {
                message.textContent = value || "";
            }
        }

        function playVideo() {
            const attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {
                    shell.classList.remove("is-playing");
                });
            }
        }

        function load() {
            if (!video || !source) {
                return;
            }

            shell.classList.add("is-ready");
            video.controls = true;

            if (ready) {
                playVideo();
                return;
            }

            ready = true;
            setMessage("正在连接播放源");

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.addEventListener("loadedmetadata", playVideo, { once: true });
                setMessage("");
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 60
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setMessage("");
                    playVideo();
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    } else {
                        setMessage("播放暂时无法启动，请稍后重试");
                        hlsInstance.destroy();
                    }
                });
                return;
            }

            video.src = source;
            video.addEventListener("loadedmetadata", playVideo, { once: true });
            setMessage("");
        }

        if (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                load();
            });
        }

        shell.addEventListener("click", function (event) {
            if (event.target === video && !ready) {
                load();
            }
        });

        video.addEventListener("playing", function () {
            shell.classList.add("is-playing");
            shell.classList.add("is-ready");
            setMessage("");
        });

        video.addEventListener("pause", function () {
            if (!video.ended) {
                shell.classList.remove("is-playing");
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.querySelectorAll(".video-shell").forEach(preparePlayer);
})();
