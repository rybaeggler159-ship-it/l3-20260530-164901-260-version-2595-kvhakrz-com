(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupCarousel() {
        var carousel = document.querySelector("[data-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-dot]"));
        var next = carousel.querySelector("[data-next]");
        var prev = carousel.querySelector("[data-prev]");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
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
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }
        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });
        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        if (!panel) {
            return;
        }
        var keyword = panel.querySelector("[data-filter-keyword]");
        var year = panel.querySelector("[data-filter-year]");
        var sort = panel.querySelector("[data-filter-sort]");
        var reset = panel.querySelector("[data-filter-reset]");
        var empty = panel.querySelector("[data-filter-empty]");
        var grid = document.querySelector("[data-filter-grid]");
        if (!grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-title]"));
        var original = cards.slice();

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function apply() {
            var q = normalize(keyword && keyword.value);
            var selectedYear = year ? year.value : "";
            var sorted = cards.slice();
            if (sort && sort.value === "new") {
                sorted.sort(function (a, b) {
                    return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                });
            } else if (sort && sort.value === "old") {
                sorted.sort(function (a, b) {
                    return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
                });
            } else if (sort && sort.value === "title") {
                sorted.sort(function (a, b) {
                    return String(a.dataset.title || "").localeCompare(String(b.dataset.title || ""), "zh-Hans-CN");
                });
            } else {
                sorted = original.slice();
            }
            sorted.forEach(function (card) {
                grid.appendChild(card);
            });
            var shown = 0;
            sorted.forEach(function (card) {
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.genre,
                    card.dataset.tags
                ].join(" "));
                var matchText = !q || haystack.indexOf(q) !== -1;
                var matchYear = !selectedYear || card.dataset.year === selectedYear;
                var visible = matchText && matchYear;
                card.hidden = !visible;
                if (visible) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.hidden = shown !== 0;
            }
        }

        [keyword, year, sort].forEach(function (node) {
            if (node) {
                node.addEventListener("input", apply);
                node.addEventListener("change", apply);
            }
        });
        if (reset) {
            reset.addEventListener("click", function () {
                if (keyword) {
                    keyword.value = "";
                }
                if (year) {
                    year.value = "";
                }
                if (sort) {
                    sort.value = "default";
                }
                apply();
            });
        }
        apply();
    }

    function setupSearchPage() {
        var root = document.querySelector("[data-search-results]");
        if (!root || !window.MOVIE_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        var status = document.querySelector("[data-search-status]");
        var input = document.querySelector("[data-search-input]");
        if (input) {
            input.value = query;
        }
        var lower = query.toLowerCase().trim();
        if (!lower) {
            if (status) {
                status.textContent = "请输入关键词开始搜索。";
            }
            return;
        }
        var results = window.MOVIE_INDEX.filter(function (movie) {
            var haystack = [
                movie.title,
                movie.region,
                movie.year,
                movie.genre,
                movie.tags,
                movie.oneLine
            ].join(" ").toLowerCase();
            return haystack.indexOf(lower) !== -1;
        });
        if (status) {
            status.textContent = "关键词 “" + query + "” 找到 " + results.length + " 个结果";
        }
        if (!results.length) {
            root.innerHTML = '<p class="filter-empty">没有找到相关内容</p>';
            return;
        }
        root.innerHTML = results.map(function (movie) {
            return [
                '<article class="movie-card movie-card-medium">',
                '    <a href="' + movie.url + '" class="movie-card-link">',
                '        <div class="movie-cover">',
                '            <img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '            <span class="movie-cover-play">▶</span>',
                '            <span class="movie-badge">' + escapeHtml(movie.genre) + '</span>',
                '        </div>',
                '        <div class="movie-card-body">',
                '            <h3>' + escapeHtml(movie.title) + '</h3>',
                '            <p>' + escapeHtml(movie.oneLine) + '</p>',
                '            <div class="movie-card-meta">',
                '                <span>' + escapeHtml(movie.year) + '</span>',
                '                <span>' + escapeHtml(movie.region) + '</span>',
                '            </div>',
                '        </div>',
                '    </a>',
                '</article>'
            ].join("\n");
        }).join("\n");
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function initVideoPlayer(options) {
        var video = document.getElementById(options.videoId);
        var button = document.getElementById(options.buttonId);
        var source = options.source;
        var started = false;
        var hlsInstance = null;
        if (!video || !source) {
            return;
        }

        function playVideo() {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        function start() {
            if (started) {
                playVideo();
                return;
            }
            started = true;
            if (button) {
                button.classList.add("is-hidden");
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                playVideo();
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    playVideo();
                });
            } else {
                video.src = source;
                playVideo();
            }
        }

        if (button) {
            button.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (!started) {
                start();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    }

    window.initVideoPlayer = initVideoPlayer;

    ready(function () {
        setupMenu();
        setupCarousel();
        setupFilters();
        setupSearchPage();
    });
})();
