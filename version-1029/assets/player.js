(function () {
    var stage = document.querySelector('.player-stage');
    var video = document.querySelector('#movie-video');
    var cover = document.querySelector('.player-cover');
    var trigger = document.querySelector('.detail-play-trigger');
    var message = document.querySelector('.player-message');
    var hlsInstance = null;
    var prepared = false;

    if (!stage || !video) {
        return;
    }

    function showMessage(text) {
        if (!message) {
            return;
        }
        message.textContent = text;
        message.classList.add('show');
    }

    function prepare() {
        if (prepared) {
            return;
        }

        var stream = stage.getAttribute('data-stream-url');
        prepared = true;

        if (!stream) {
            showMessage('暂时无法播放，请稍后再试');
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hlsInstance.startLoad();
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hlsInstance.recoverMediaError();
                    return;
                }
                showMessage('暂时无法播放，请稍后再试');
            });
            return;
        }

        video.src = stream;
    }

    function startPlay(event) {
        if (event) {
            event.preventDefault();
        }
        prepare();
        stage.classList.add('is-loading');
        var result = video.play();
        if (result && typeof result.then === 'function') {
            result.then(function () {
                stage.classList.add('is-playing');
                stage.classList.remove('is-loading');
            }).catch(function () {
                stage.classList.remove('is-loading');
                showMessage('点击播放按钮开始观看');
            });
        }
    }

    if (cover) {
        cover.addEventListener('click', startPlay);
    }

    if (trigger) {
        trigger.addEventListener('click', function (event) {
            startPlay(event);
            stage.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        });
    }

    video.addEventListener('play', function () {
        stage.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
        if (!video.ended) {
            return;
        }
        stage.classList.remove('is-playing');
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
})();
