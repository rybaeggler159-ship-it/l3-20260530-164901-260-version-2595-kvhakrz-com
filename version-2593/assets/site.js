/* 亚洲高清视频 - 全站交互脚本 */
(function () {
  "use strict";

  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $all(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initMobileMenu() {
    var toggle = $("[data-menu-toggle]");
    var nav = $("[data-mobile-nav]");

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHeroCarousel() {
    var carousel = $("[data-hero-carousel]");

    if (!carousel) {
      return;
    }

    var slides = $all("[data-hero-slide]", carousel);
    var dots = $all("[data-hero-dot]", carousel);
    var prev = $("[data-hero-prev]", carousel);
    var next = $("[data-hero-next]", carousel);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 6000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    start();
  }

  function initCardFilters() {
    $all("[data-filter-panel]").forEach(function (panel) {
      var targetId = panel.getAttribute("data-target");
      var grid = targetId ? document.getElementById(targetId) : null;

      if (!grid) {
        return;
      }

      var cards = $all("[data-filter-card]", grid);
      var search = $("[data-filter-search]", panel);
      var type = $("[data-filter-type]", panel);
      var year = $("[data-filter-year]", panel);
      var count = $("[data-filter-count]", panel);

      function apply() {
        var keyword = search ? search.value.trim().toLowerCase() : "";
        var selectedType = type ? type.value : "";
        var selectedYear = year ? year.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year")
          ].join(" ").toLowerCase();
          var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchesType = !selectedType || card.getAttribute("data-type") === selectedType;
          var matchesYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
          var shouldShow = matchesKeyword && matchesType && matchesYear;

          card.style.display = shouldShow ? "" : "none";

          if (shouldShow) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = String(visible);
        }
      }

      [search, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  function initHlsPlayers() {
    $all("[data-hls-player]").forEach(function (wrapper) {
      var video = $("video", wrapper);
      var button = $("[data-play-button]", wrapper);
      var status = $("[data-player-status]", wrapper);
      var source = wrapper.getAttribute("data-src");
      var fallback = wrapper.getAttribute("data-fallback-src");
      var hls = null;
      var initialized = false;
      var usingFallback = false;

      if (!video || !button || !source) {
        return;
      }

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function destroyHls() {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
        hls = null;
      }

      function attachSource(url) {
        destroyHls();

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
          video.load();
          return;
        }

        if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });

          hls.loadSource(url);
          hls.attachMedia(video);

          if (window.Hls.Events && window.Hls.Events.ERROR) {
            hls.on(window.Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal && fallback && !usingFallback) {
                usingFallback = true;
                setStatus("主播放源异常，正在切换备用源");
                attachSource(fallback);
                video.play().catch(function () {});
              }
            });
          }

          return;
        }

        video.src = url;
        video.load();
      }

      function play() {
        if (!initialized) {
          initialized = true;
          setStatus("播放源加载中");
          attachSource(source);
        }

        wrapper.classList.add("is-playing");

        video.play()
          .then(function () {
            setStatus(usingFallback ? "备用源播放中" : "播放中");
          })
          .catch(function () {
            setStatus("浏览器阻止自动播放，请再次点击视频控件");
            wrapper.classList.remove("is-playing");
          });
      }

      button.addEventListener("click", play);
      video.addEventListener("play", function () {
        wrapper.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        setStatus("已暂停");
      });
    });
  }

  function renderSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span class="tag">' + escapeHtml(tag) + '</span>';
    }).join("");

    return '' +
      '<article class="movie-card video-card-hover">' +
        '<a class="movie-card__poster" href="' + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + ' 在线观看">' +
          '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + ' 封面" loading="lazy" onerror="this.classList.add(&quot;is-missing&quot;);">' +
          '<span class="poster-fallback">' + escapeHtml((movie.title || "影").slice(0, 1)) + '</span>' +
          '<span class="movie-badge">' + escapeHtml(movie.type) + '</span>' +
          '<span class="movie-year">' + escapeHtml(movie.year) + '</span>' +
        '</a>' +
        '<div class="movie-card__body">' +
          '<div class="movie-card__meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>' +
          '<h3 class="movie-card__title"><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
          '<p class="movie-card__desc">' + escapeHtml(movie.one_line) + '</p>' +
          '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
      '</article>';
  }

  function initSearchPage() {
    var results = $("[data-search-results]");
    var summary = $("[data-search-summary]");
    var input = $("[data-search-input]");
    var fallback = $(".search-fallback");

    if (!results || !summary || !input || !window.MOVIE_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    input.value = query;

    function performSearch(value) {
      var normalized = value.trim().toLowerCase();

      if (!normalized) {
        results.innerHTML = "";
        summary.textContent = "输入关键词后即可查看匹配影片。";
        if (fallback) {
          fallback.classList.remove("is-hidden");
        }
        return;
      }

      var matched = window.MOVIE_INDEX.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          (movie.tags || []).join(" "),
          movie.one_line
        ].join(" ").toLowerCase();
        return haystack.indexOf(normalized) !== -1;
      });

      summary.innerHTML = '关键词 <strong>“' + escapeHtml(value) + '”</strong> 共匹配 <strong>' + matched.length + '</strong> 部影片。';
      results.innerHTML = matched.slice(0, 240).map(renderSearchCard).join("");

      if (fallback) {
        fallback.classList.toggle("is-hidden", matched.length > 0);
      }
    }

    performSearch(query);

    input.addEventListener("input", function () {
      performSearch(input.value);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initHeroCarousel();
    initCardFilters();
    initHlsPlayers();
    initSearchPage();
  });
})();
