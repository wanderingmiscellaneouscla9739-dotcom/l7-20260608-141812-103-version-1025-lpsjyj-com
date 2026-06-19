(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var nav = document.querySelector('.site-nav');
        var toggle = document.querySelector('.mobile-toggle');
        if (nav && toggle) {
            toggle.addEventListener('click', function () {
                nav.classList.toggle('open');
            });
        }

        initHeroCarousel();
        initFilters();
        initPlayers();
    });

    function initHeroCarousel() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
        if (slides.length <= 1) {
            return;
        }

        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });

        var hero = document.querySelector('.hero');
        if (hero) {
            hero.addEventListener('mouseenter', stop);
            hero.addEventListener('mouseleave', start);
        }
        show(0);
        start();
    }

    function initFilters() {
        var forms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
        forms.forEach(function (scope) {
            var keywordInput = scope.querySelector('[data-filter-keyword]');
            var typeSelect = scope.querySelector('[data-filter-type]');
            var yearSelect = scope.querySelector('[data-filter-year]');
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
            var noResults = scope.querySelector('[data-no-results]');

            function apply() {
                var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
                var type = typeSelect ? typeSelect.value : 'all';
                var year = yearSelect ? yearSelect.value : 'all';
                var shown = 0;

                cards.forEach(function (card) {
                    var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                    var cardType = card.getAttribute('data-type') || '';
                    var cardYear = card.getAttribute('data-year') || '';
                    var ok = true;

                    if (keyword && haystack.indexOf(keyword) === -1) {
                        ok = false;
                    }
                    if (type !== 'all' && cardType !== type) {
                        ok = false;
                    }
                    if (year !== 'all' && cardYear !== year) {
                        ok = false;
                    }

                    card.classList.toggle('hidden-by-filter', !ok);
                    if (ok) {
                        shown += 1;
                    }
                });

                if (noResults) {
                    noResults.style.display = shown ? 'none' : 'block';
                }
            }

            [keywordInput, typeSelect, yearSelect].forEach(function (el) {
                if (el) {
                    el.addEventListener('input', apply);
                    el.addEventListener('change', apply);
                }
            });
            apply();
        });
    }

    function initPlayers() {
        var shells = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        shells.forEach(function (shell) {
            var video = shell.querySelector('video');
            var poster = shell.querySelector('.player-poster');
            var tip = shell.querySelector('.player-tip');
            var source = shell.getAttribute('data-video-src');
            var hlsInstance = null;

            function updateTip(message) {
                if (tip) {
                    tip.textContent = message;
                }
            }

            function play() {
                if (!video || !source) {
                    updateTip('播放源暂不可用');
                    return;
                }

                if (poster) {
                    poster.style.display = 'none';
                }
                video.controls = true;

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.play().catch(function () {
                        updateTip('请再次点击播放');
                    });
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    if (!hlsInstance) {
                        hlsInstance = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true,
                            backBufferLength: 90
                        });
                        hlsInstance.loadSource(source);
                        hlsInstance.attachMedia(video);
                        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            video.play().catch(function () {
                                updateTip('请再次点击播放');
                            });
                        });
                        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                            if (data && data.fatal) {
                                updateTip('播放源加载失败，请刷新后重试');
                            }
                        });
                    } else {
                        video.play().catch(function () {
                            updateTip('请再次点击播放');
                        });
                    }
                } else {
                    video.src = source;
                    video.play().catch(function () {
                        updateTip('当前浏览器需要支持 HLS 播放');
                    });
                }
            }

            if (poster) {
                poster.addEventListener('click', play);
            }
        });
    }
})();
