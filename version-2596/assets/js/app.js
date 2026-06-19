(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var open = panel.classList.toggle("open");
      document.body.classList.toggle("nav-open", open);
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer;
    function show(nextIndex) {
      slides[index].classList.remove("active");
      index = (nextIndex + slides.length) % slides.length;
      slides[index].classList.add("active");
    }
    function move(step) {
      show(index + step);
      restart();
    }
    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    if (prev) {
      prev.addEventListener("click", function () {
        move(-1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        move(1);
      });
    }
    restart();
  }

  function normalize(text) {
    return (text || "").toString().trim().toLowerCase();
  }

  function setupSearch() {
    var url = new URL(window.location.href);
    var initial = normalize(url.searchParams.get("q"));
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var empty = document.querySelector("[data-empty-state]");
    function filter(value) {
      var query = normalize(value);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-meta") + " " + card.textContent);
        var matched = !query || haystack.indexOf(query) !== -1;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }
    inputs.forEach(function (input) {
      if (initial) {
        input.value = initial;
      }
      input.addEventListener("input", function () {
        filter(input.value);
      });
    });
    if (initial) {
      filter(initial);
    }
  }

  function setupPlayer() {
    var shells = Array.prototype.slice.call(document.querySelectorAll("[data-video-url]"));
    shells.forEach(function (shell) {
      var video = shell.querySelector("video");
      var cover = shell.querySelector(".player-cover");
      var source = shell.getAttribute("data-video-url");
      var started = false;
      function attach() {
        if (!video || !source || started) {
          return;
        }
        started = true;
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else {
          video.src = source;
        }
      }
      function start() {
        attach();
        video.controls = true;
        if (cover) {
          cover.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            video.controls = true;
          });
        }
      }
      if (cover) {
        cover.addEventListener("click", start);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            start();
          }
        });
      }
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupPlayer();
  });
})();
