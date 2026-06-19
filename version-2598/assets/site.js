(function() {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-menu]');

  if (toggle && panel) {
    toggle.addEventListener('click', function() {
      panel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    if (prev) {
      prev.addEventListener('click', function() {
        show(index - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        show(index + 1);
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    setInterval(function() {
      show(index + 1);
    }, 5200);
  }

  var searchForm = document.querySelector('[data-search-form]');
  var searchInput = document.querySelector('[data-search-input]');
  var searchCount = document.querySelector('[data-search-count]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

  function filterCards(value) {
    var q = (value || '').trim().toLowerCase();
    var visible = 0;

    cards.forEach(function(card) {
      var haystack = (card.getAttribute('data-search') || '').toLowerCase();
      var matched = !q || haystack.indexOf(q) !== -1;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    if (searchCount) {
      searchCount.textContent = String(visible);
    }
  }

  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    searchInput.value = initial;
    filterCards(initial);
    searchInput.addEventListener('input', function() {
      filterCards(searchInput.value);
    });
  }

  if (searchForm) {
    searchForm.addEventListener('submit', function(event) {
      event.preventDefault();
      filterCards(searchInput ? searchInput.value : '');
    });
  }

  var video = document.querySelector('[data-video-player]');
  var cover = document.querySelector('[data-video-cover]');
  var play = document.querySelector('[data-video-play]');

  if (video && play) {
    var loaded = false;
    var source = video.getAttribute('data-stream') || '';

    function begin() {
      if (!loaded) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls) {
          var hls = new Hls();
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
        loaded = true;
      }

      if (cover) {
        cover.classList.add('is-hidden');
      }

      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function() {});
      }
    }

    play.addEventListener('click', begin);
    if (cover) {
      cover.addEventListener('click', begin);
    }
  }
})();
