(function () {
  var video = document.getElementById('movie-player');
  var trigger = document.getElementById('play-trigger');
  if (!video || !trigger) {
    return;
  }

  var streamUrl = video.getAttribute('src');
  var ready = false;
  var hls = null;

  function setupPlayer() {
    if (ready || !streamUrl) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      video.removeAttribute('src');
      hls = new window.Hls({ enableWorker: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
    video.controls = true;
    ready = true;
  }

  function startPlayer() {
    setupPlayer();
    trigger.classList.add('is-hidden');
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  trigger.addEventListener('click', startPlayer);
  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayer();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}());
