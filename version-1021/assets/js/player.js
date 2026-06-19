(function () {
    var configNode = document.getElementById('video-config');
    var video = document.getElementById('mainVideo');
    var cover = document.getElementById('playerCover');

    if (!configNode || !video || !cover) {
        return;
    }

    var config = {};

    try {
        config = JSON.parse(configNode.textContent || '{}');
    } catch (error) {
        config = {};
    }

    var sourceUrl = config.source || '';
    var prepared = false;
    var hlsInstance = null;

    var prepareVideo = function () {
        if (prepared || !sourceUrl) {
            return;
        }

        prepared = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls();
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = sourceUrl;
        }
    };

    var startPlayback = function () {
        prepareVideo();
        cover.classList.add('is-hidden');

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                video.setAttribute('controls', 'controls');
            });
        }
    };

    cover.addEventListener('click', startPlayback);

    video.addEventListener('play', function () {
        cover.classList.add('is-hidden');
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}());
