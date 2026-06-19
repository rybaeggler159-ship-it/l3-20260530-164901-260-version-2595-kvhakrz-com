function initMoviePlayer(videoId, coverId, videoUrl) {
  var video = document.getElementById(videoId);
  var cover = document.getElementById(coverId);
  var ready = false;
  var hls = null;

  if (!video) {
    return;
  }

  function setCoverHidden(hidden) {
    if (cover) {
      cover.classList.toggle('is-hidden', hidden);
    }
  }

  function prepare() {
    if (ready) {
      return;
    }

    ready = true;

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true });
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
        hls.loadSource(videoUrl);
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
      video.load();
    } else {
      video.src = videoUrl;
      video.load();
    }
  }

  function play() {
    prepare();
    setCoverHidden(true);

    var action = video.play();

    if (action && typeof action.catch === 'function') {
      action.catch(function () {
        setCoverHidden(false);
      });
    }
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
    setCoverHidden(true);
  });

  video.addEventListener('ended', function () {
    setCoverHidden(false);
  });
}
