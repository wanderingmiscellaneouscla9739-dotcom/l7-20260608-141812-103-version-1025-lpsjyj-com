(function () {
  var video = document.querySelector('[data-player]');
  var cover = document.querySelector('[data-player-cover]');
  var button = document.querySelector('[data-play-button]');

  if (!video) {
    return;
  }

  var stream = video.getAttribute('data-stream');
  var hls = null;

  function prepare() {
    if (!stream || video.getAttribute('data-ready') === '1') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      video.setAttribute('data-ready', '1');
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video.setAttribute('data-ready', '1');
      return;
    }

    video.src = stream;
    video.setAttribute('data-ready', '1');
  }

  function play() {
    prepare();
    if (cover) {
      cover.classList.add('hidden');
    }
    var result = video.play();
    if (result && typeof result.catch === 'function') {
      result.catch(function () {
        if (cover) {
          cover.classList.remove('hidden');
        }
      });
    }
  }

  if (button) {
    button.addEventListener('click', play);
  }

  if (cover) {
    cover.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener('play', function () {
    if (cover) {
      cover.classList.add('hidden');
    }
  });

  video.addEventListener('ended', function () {
    if (cover) {
      cover.classList.remove('hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
