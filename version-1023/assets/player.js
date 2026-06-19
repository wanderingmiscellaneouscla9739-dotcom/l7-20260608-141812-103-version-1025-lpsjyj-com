(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var video = document.querySelector('[data-player]');
    var button = document.querySelector('[data-play-button]');

    if (!video || !button) {
      return;
    }

    var stream = video.getAttribute('data-stream');
    var hls = null;
    var attached = false;

    function attachStream() {
      if (attached || !stream) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }

      attached = true;
    }

    function playVideo() {
      attachStream();
      button.classList.add('is-hidden');
      var action = video.play();

      if (action && typeof action.catch === 'function') {
        action.catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    }

    button.addEventListener('click', playVideo);

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });

    video.addEventListener('ended', function () {
      button.classList.remove('is-hidden');
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  });
})();
