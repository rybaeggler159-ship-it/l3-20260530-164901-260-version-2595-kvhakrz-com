(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector(".js-menu-toggle");
    var nav = document.querySelector(".js-site-nav");

    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(
        hero.querySelectorAll(".hero-slide"),
      );
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var prev = hero.querySelector(".hero-prev");
      var next = hero.querySelector(".hero-next");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, current) {
          slide.classList.toggle("is-active", current === index);
        });

        dots.forEach(function (dot, current) {
          dot.classList.toggle("is-active", current === index);
        });
      }

      function restart() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5000);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          restart();
        });
      }

      dots.forEach(function (dot, current) {
        dot.addEventListener("click", function () {
          show(current);
          restart();
        });
      });

      show(0);
      restart();
    });

    document.querySelectorAll("[data-search-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-search-input]");
      var region = scope.querySelector("[data-filter-region]");
      var year = scope.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(
        scope.querySelectorAll("[data-card]"),
      );

      function normalize(value) {
        return String(value || "")
          .trim()
          .toLowerCase();
      }

      function run() {
        var keyword = normalize(input ? input.value : "");
        var regionValue = normalize(region ? region.value : "");
        var yearValue = normalize(year ? year.value : "");

        cards.forEach(function (card) {
          var haystack = normalize(
            [
              card.getAttribute("data-title"),
              card.getAttribute("data-region"),
              card.getAttribute("data-year"),
              card.getAttribute("data-genre"),
              card.getAttribute("data-tags"),
            ].join(" "),
          );
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchRegion =
            !regionValue ||
            normalize(card.getAttribute("data-region")).indexOf(regionValue) !==
              -1;
          var matchYear =
            !yearValue ||
            normalize(card.getAttribute("data-year")) === yearValue;

          card.hidden = !(matchKeyword && matchRegion && matchYear);
        });
      }

      [input, region, year].forEach(function (element) {
        if (element) {
          element.addEventListener("input", run);
          element.addEventListener("change", run);
        }
      });
    });

    document.querySelectorAll("[data-share]").forEach(function (button) {
      var original = button.textContent;

      button.addEventListener("click", function () {
        var href = window.location.href;
        var done = function () {
          button.textContent = "已复制";
          window.setTimeout(function () {
            button.textContent = original;
          }, 1800);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(href).then(done).catch(done);
        } else {
          done();
        }
      });
    });
  });
})();
