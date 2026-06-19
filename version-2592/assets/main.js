document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.mobile-toggle');
  var nav = document.querySelector('.main-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  function restartHero() {
    if (timer) {
      window.clearInterval(timer);
    }
    startHero();
  }

  var prev = document.querySelector('.hero-control.prev');
  var next = document.querySelector('.hero-control.next');

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(current - 1);
      restartHero();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
      restartHero();
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
      restartHero();
    });
  });

  showSlide(0);
  startHero();

  var input = document.querySelector('.filter-input');
  var selects = Array.prototype.slice.call(document.querySelectorAll('.filter-select'));
  var items = Array.prototype.slice.call(document.querySelectorAll('.searchable-item'));

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function itemText(item) {
    return normalize([
      item.dataset.title,
      item.dataset.year,
      item.dataset.type,
      item.dataset.region,
      item.dataset.category,
      item.dataset.genre,
      item.textContent
    ].join(' '));
  }

  function applyFilters() {
    var query = input ? normalize(input.value) : '';
    var activeFilters = {};

    selects.forEach(function (select) {
      if (select.value) {
        activeFilters[select.dataset.filter] = normalize(select.value);
      }
    });

    items.forEach(function (item) {
      var visible = true;

      if (query && itemText(item).indexOf(query) === -1) {
        visible = false;
      }

      Object.keys(activeFilters).forEach(function (key) {
        if (normalize(item.dataset[key]) !== activeFilters[key]) {
          visible = false;
        }
      });

      item.classList.toggle('hidden-by-filter', !visible);
    });
  }

  if (input) {
    input.addEventListener('input', applyFilters);
  }

  selects.forEach(function (select) {
    select.addEventListener('change', applyFilters);
  });
});
