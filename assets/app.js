(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var navButton = $('.menu-toggle');
  var nav = $('.main-nav');
  if (navButton && nav) {
    navButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var slides = $all('.hero-slide');
  var dots = $all('.hero-dots button');
  if (slides.length > 1) {
    var current = 0;
    var showSlide = function (index) {
      current = index % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function loadHlsScript(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var existing = document.querySelector('script[data-hls-loader="true"]');
    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
    script.async = true;
    script.dataset.hlsLoader = 'true';
    script.onload = callback;
    document.head.appendChild(script);
  }

  function startPlayer(shell) {
    var video = $('video', shell);
    var url = shell.getAttribute('data-video-url');
    if (!video || !url) {
      return;
    }
    var playNow = function () {
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {});
      }
      shell.classList.add('is-playing');
    };
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.getAttribute('src')) {
        video.src = url;
      }
      playNow();
      return;
    }
    loadHlsScript(function () {
      if (window.Hls && window.Hls.isSupported()) {
        if (!shell.hlsInstance) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(url);
          hls.attachMedia(video);
          shell.hlsInstance = hls;
        }
        playNow();
      } else {
        video.src = url;
        playNow();
      }
    });
  }

  $all('.player-shell').forEach(function (shell) {
    var overlay = $('.play-overlay', shell);
    var video = $('video', shell);
    var handler = function () {
      startPlayer(shell);
    };
    if (overlay) {
      overlay.addEventListener('click', handler);
    }
    shell.addEventListener('click', function (event) {
      if (event.target === video) {
        handler();
      }
    });
    if (video) {
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0) {
          shell.classList.remove('is-playing');
        }
      });
    }
  });

  var filterForm = $('.filters');
  var grid = $('.filter-grid');
  if (filterForm && grid) {
    var searchInput = $('[data-filter="q"]', filterForm);
    var typeInput = $('[data-filter="type"]', filterForm);
    var regionInput = $('[data-filter="region"]', filterForm);
    var genreInput = $('[data-filter="genre"]', filterForm);
    var cards = $all('.movie-card', grid);
    var empty = $('.empty-state');
    var apply = function () {
      var q = (searchInput && searchInput.value || '').trim().toLowerCase();
      var type = typeInput && typeInput.value || '';
      var region = regionInput && regionInput.value || '';
      var genre = genreInput && genreInput.value || '';
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre
        ].join(' ').toLowerCase();
        var ok = true;
        if (q && haystack.indexOf(q) === -1) {
          ok = false;
        }
        if (type && card.dataset.type.indexOf(type) === -1) {
          ok = false;
        }
        if (region && card.dataset.region.indexOf(region) === -1) {
          ok = false;
        }
        if (genre && card.dataset.genre.indexOf(genre) === -1) {
          ok = false;
        }
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    };
    [searchInput, typeInput, regionInput, genreInput].forEach(function (input) {
      if (input) {
        input.addEventListener('input', apply);
        input.addEventListener('change', apply);
      }
    });
  }
})();
