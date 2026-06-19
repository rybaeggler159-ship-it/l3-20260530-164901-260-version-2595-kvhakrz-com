(function () {
  function startWhenReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  startWhenReady(function () {
    document.querySelectorAll(".js-player").forEach(function (shell) {
      var video = shell.querySelector("video");
      var overlay = shell.querySelector(".player-start");
      var message = shell.querySelector(".player-message");
      var source = shell.getAttribute("data-src");
      var loaded = false;
      var hls = null;

      function showMessage(text) {
        if (message) {
          message.textContent = text;
          message.hidden = false;
        }
      }

      function load() {
        if (!video || !source || loaded) {
          return;
        }

        loaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal && hls) {
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
              } else {
                showMessage("视频暂时无法播放");
                hls.destroy();
              }
            }
          });
        } else {
          showMessage("视频暂时无法播放");
        }
      }

      function play() {
        load();
        shell.classList.add("is-playing");

        if (video) {
          var promise = video.play();

          if (promise && promise.catch) {
            promise.catch(function () {});
          }
        }
      }

      if (overlay) {
        overlay.addEventListener("click", function (event) {
          event.preventDefault();
          play();
        });
      }

      if (video) {
        video.addEventListener("play", function () {
          shell.classList.add("is-playing");
        });

        video.addEventListener("error", function () {
          showMessage("视频暂时无法播放");
        });
      }

      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  });
})();
