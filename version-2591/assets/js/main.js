(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var heroIndex = 0;
  var timer = null;

  function showHero(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === heroIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === heroIndex);
    });
  }

  function startHero() {
    if (timer) {
      window.clearInterval(timer);
    }

    if (slides.length > 1) {
      timer = window.setInterval(function () {
        showHero(heroIndex + 1);
      }, 5000);
    }
  }

  if (slides.length) {
    showHero(0);
    startHero();
  }

  if (prev) {
    prev.addEventListener('click', function () {
      showHero(heroIndex - 1);
      startHero();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showHero(heroIndex + 1);
      startHero();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
      startHero();
    });
  });

  var filterInput = document.querySelector('[data-card-filter]');
  var clearButton = document.querySelector('[data-clear-filter]');
  var queryInput = document.querySelector('[data-query-input]');

  function filterCards(value) {
    var keyword = String(value || '').trim().toLowerCase();
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

    cards.forEach(function (card) {
      var text = String(card.getAttribute('data-search') || '').toLowerCase();
      var title = String(card.getAttribute('data-title') || '').toLowerCase();
      var year = String(card.getAttribute('data-year') || '').toLowerCase();
      var visible = !keyword || text.indexOf(keyword) !== -1 || title.indexOf(keyword) !== -1 || year.indexOf(keyword) !== -1;
      card.classList.toggle('is-hidden', !visible);
    });
  }

  if (queryInput) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    queryInput.value = query;
    filterCards(query);
  }

  if (filterInput) {
    filterInput.addEventListener('input', function () {
      filterCards(filterInput.value);
    });
  }

  if (clearButton && filterInput) {
    clearButton.addEventListener('click', function () {
      filterInput.value = '';
      filterCards('');
      filterInput.focus();
    });
  }
})();
