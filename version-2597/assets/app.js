(function () {
  var mobileToggle = document.querySelector('.mobile-toggle');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', function () {
      document.body.classList.toggle('nav-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var prev = document.querySelector('.hero-prev');
  var next = document.querySelector('.hero-next');
  var index = 0;
  var timer = null;

  function showSlide(nextIndex) {
    if (!slides.length) {
      return;
    }
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === index);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === index);
    });
  }

  function autoPlay() {
    if (!slides.length) {
      return;
    }
    window.clearInterval(timer);
    timer = window.setInterval(function () {
      showSlide(index + 1);
    }, 5000);
  }

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(index - 1);
      autoPlay();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(index + 1);
      autoPlay();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-slide')) || 0);
      autoPlay();
    });
  });

  autoPlay();

  function getQueryValue(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupFilters(scope) {
    var input = scope.querySelector('.filter-input');
    var category = scope.querySelector('.filter-category');
    var year = scope.querySelector('.filter-year');
    var type = scope.querySelector('.filter-type');
    var resultRoot = document.querySelector('.filter-results');
    if (!resultRoot) {
      return;
    }
    var cards = Array.prototype.slice.call(resultRoot.querySelectorAll('.movie-card, .compact-card'));

    if (input && getQueryValue('q')) {
      input.value = getQueryValue('q');
    }

    function apply() {
      var keyword = normalize(input ? input.value : '');
      var categoryValue = normalize(category ? category.value : '');
      var yearValue = normalize(year ? year.value : '');
      var typeValue = normalize(type ? type.value : '');

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-category'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' '));
        var cardCategory = normalize(card.getAttribute('data-category'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardText = normalize(card.textContent);
        var ok = true;

        if (keyword && text.indexOf(keyword) === -1) {
          ok = false;
        }
        if (categoryValue && cardCategory !== categoryValue) {
          ok = false;
        }
        if (yearValue && cardYear !== yearValue) {
          ok = false;
        }
        if (typeValue && cardText.indexOf(typeValue) === -1) {
          ok = false;
        }
        card.classList.toggle('is-hidden', !ok);
      });
    }

    [input, category, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(setupFilters);
}());
