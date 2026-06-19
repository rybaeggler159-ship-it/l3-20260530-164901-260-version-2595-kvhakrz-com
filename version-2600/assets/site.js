(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-button]');
    var panel = document.querySelector('[data-menu-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dots button'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    show(0);
    window.setInterval(function () {
      show(current + 1);
    }, 5000);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupFilters() {
    var filterGroups = document.querySelectorAll('[data-filter-group]');
    filterGroups.forEach(function (group) {
      var search = group.querySelector('[data-filter-search]');
      var year = group.querySelector('[data-filter-year]');
      var region = group.querySelector('[data-filter-region]');
      var cards = Array.prototype.slice.call(group.querySelectorAll('[data-search]'));
      var empty = group.querySelector('[data-empty]');

      function apply() {
        var term = normalize(search && search.value);
        var yearValue = year ? year.value : '';
        var regionValue = region ? region.value : '';
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute('data-search'));
          var cardYear = card.getAttribute('data-year') || '';
          var cardRegion = card.getAttribute('data-region') || '';
          var matched = (!term || haystack.indexOf(term) !== -1) && (!yearValue || cardYear === yearValue) && (!regionValue || cardRegion === regionValue);
          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.style.display = visible ? 'none' : 'block';
        }
      }

      if (search) {
        search.addEventListener('input', apply);
      }
      if (year) {
        year.addEventListener('change', apply);
      }
      if (region) {
        region.addEventListener('change', apply);
      }
      apply();
    });
  }

  function setupQuerySearch() {
    var input = document.querySelector('[data-main-search]');
    if (!input) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      input.value = q;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  function setupPlayers() {
    var players = document.querySelectorAll('[data-player]');
    players.forEach(function (stage) {
      var video = stage.querySelector('video');
      var button = stage.querySelector('.play-overlay');
      var stream = stage.getAttribute('data-stream');
      var loaded = false;
      var hlsInstance = null;

      function attach() {
        if (!video || !stream || loaded) {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
        loaded = true;
      }

      function start() {
        attach();
        stage.classList.add('is-playing');
        var playResult = video.play();
        if (playResult && typeof playResult.catch === 'function') {
          playResult.catch(function () {
            stage.classList.remove('is-playing');
          });
        }
      }

      if (button) {
        button.addEventListener('click', start);
      }
      if (video) {
        video.addEventListener('play', function () {
          stage.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
          if (video.currentTime === 0 || video.ended) {
            stage.classList.remove('is-playing');
          }
        });
      }
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupQuerySearch();
    setupPlayers();
  });
})();
