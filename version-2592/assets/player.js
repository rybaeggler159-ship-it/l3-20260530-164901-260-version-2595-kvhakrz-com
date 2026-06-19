import { H as Hls } from './hls.js';

export function setupPlayer(streamUrl) {
  var video = document.querySelector('[data-player]');
  var overlay = document.querySelector('[data-play-overlay]');
  var ready = false;

  if (!video || !overlay || !streamUrl) {
    return;
  }

  function attachStream() {
    if (ready) {
      return Promise.resolve();
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return Promise.resolve();
    }

    if (Hls && Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      video.hlsPlayer = hls;

      return new Promise(function (resolve) {
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
        window.setTimeout(resolve, 1400);
      });
    }

    video.src = streamUrl;
    return Promise.resolve();
  }

  function playVideo() {
    overlay.classList.add('is-hidden');
    video.controls = true;

    attachStream().then(function () {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          overlay.classList.remove('is-hidden');
        });
      }
    });
  }

  overlay.addEventListener('click', playVideo);
  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });
}
