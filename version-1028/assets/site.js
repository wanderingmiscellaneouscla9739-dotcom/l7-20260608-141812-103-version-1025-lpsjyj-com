import { H as Hls } from "./hls-vendor-dru42stk.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function initHeader() {
    const header = $(".site-header");
    if (!header) {
        return;
    }

    const update = () => {
        if (header.dataset.transparent === "true") {
            header.classList.toggle("is-solid", window.scrollY > 18);
        }
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
}

function initMobileMenu() {
    const button = $("[data-mobile-menu-button]");
    const panel = $("[data-mobile-panel]");

    if (!button || !panel) {
        return;
    }

    button.addEventListener("click", () => {
        panel.classList.toggle("open");
    });

    $$("a", panel).forEach((link) => {
        link.addEventListener("click", () => panel.classList.remove("open"));
    });
}

function initHero() {
    const hero = $("[data-hero]");
    if (!hero) {
        return;
    }

    const slides = $$("[data-hero-slide]", hero);
    const dots = $$("[data-hero-dot]", hero);
    let current = 0;
    let timer = null;

    const activate = (index) => {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, idx) => slide.classList.toggle("active", idx === current));
        dots.forEach((dot, idx) => dot.classList.toggle("active", idx === current));
    };

    const start = () => {
        if (timer || slides.length <= 1) {
            return;
        }
        timer = window.setInterval(() => activate(current + 1), 5600);
    };

    const stop = () => {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    };

    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            stop();
            activate(Number(dot.dataset.heroDot || 0));
            start();
        });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    activate(0);
    start();
}

function normalize(value) {
    return String(value || "").trim().toLowerCase();
}

function matchYear(cardYear, filterYear) {
    if (!filterYear) {
        return true;
    }

    const year = Number(cardYear || 0);

    if (filterYear === "2020s") {
        return year >= 2020 && year <= 2029;
    }

    if (filterYear === "older") {
        return year < 2020;
    }

    return String(year) === filterYear;
}

function initLocalFilters() {
    $$(".local-filter").forEach((panel) => {
        const section = panel.closest("section") || document;
        const cards = $$("[data-searchable]", section);
        const input = $(".local-search-input", panel);
        const year = $(".filter-year", panel);
        const type = $(".filter-type", panel);
        const region = $(".filter-region", panel);
        const count = $("[data-filter-count]", panel);

        const apply = () => {
            const keyword = normalize(input ? input.value : "");
            const yearValue = year ? year.value : "";
            const typeValue = normalize(type ? type.value : "");
            const regionValue = normalize(region ? region.value : "");
            let visible = 0;

            cards.forEach((card) => {
                const haystack = normalize([
                    card.dataset.title,
                    card.dataset.genre,
                    card.dataset.tags,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year
                ].join(" "));
                const typeText = normalize(card.dataset.type);
                const regionText = normalize(card.dataset.region);
                const okKeyword = !keyword || haystack.includes(keyword);
                const okYear = matchYear(card.dataset.year, yearValue);
                const okType = !typeValue || typeText.includes(typeValue);
                const okRegion = !regionValue || regionText.includes(regionValue);
                const show = okKeyword && okYear && okType && okRegion;

                card.classList.toggle("is-hidden-by-filter", !show);
                if (show) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = `当前显示 ${visible} 部影片 / 本页共 ${cards.length} 部`;
            }
        };

        [input, year, type, region].filter(Boolean).forEach((control) => {
            control.addEventListener("input", apply);
            control.addEventListener("change", apply);
        });

        apply();
    });
}

function createSearchCard(item) {
    const tags = (item.tags || []).slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");

    return `
        <article class="movie-card searchable-card">
            <a href="${escapeAttribute(item.url)}" class="movie-card-link" aria-label="观看${escapeAttribute(item.title)}">
                <div class="poster-wrap">
                    <div class="poster-fallback">
                        <span>国产老电影</span>
                    </div>
                    <img src="${escapeAttribute(item.cover)}" alt="${escapeAttribute(item.title)}海报" loading="lazy" decoding="async" onerror="this.style.display='none';">
                    <span class="poster-year">${escapeHtml(item.year)}</span>
                    <span class="poster-region">${escapeHtml(item.region)}</span>
                </div>
                <div class="movie-card-body">
                    <h3>${escapeHtml(item.title)}</h3>
                    <p>${escapeHtml(item.oneLine)}</p>
                    <div class="movie-meta-line">
                        <span>${escapeHtml(item.type)}</span>
                        <span>${escapeHtml(String(item.genre).split(/[\/，,]/)[0])}</span>
                        <span>热度 ${escapeHtml(item.heat)}</span>
                    </div>
                    <div class="tag-row">${tags}</div>
                </div>
            </a>
        </article>`;
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
    return escapeHtml(value);
}

function initSearchPage() {
    const results = $("#search-results");
    const count = $("#search-count");
    const sort = $("#search-sort");
    const form = $("[data-search-form]");

    if (!results || !count || !form || !window.MOVIE_SEARCH_INDEX) {
        return;
    }

    const input = form.querySelector("input[name='q']");
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q") || "";

    if (input) {
        input.value = initialQuery;
    }

    const scoreItem = (item, query) => {
        if (!query) {
            return 0;
        }
        const title = normalize(item.title);
        const genre = normalize(item.genre);
        const tags = normalize((item.tags || []).join(" "));
        let score = 0;
        if (title.includes(query)) {
            score += 100;
        }
        if (genre.includes(query)) {
            score += 40;
        }
        if (tags.includes(query)) {
            score += 30;
        }
        if (String(item.year).includes(query)) {
            score += 20;
        }
        return score;
    };

    const render = () => {
        const query = normalize(input ? input.value : "");
        let items = window.MOVIE_SEARCH_INDEX.map((item) => ({
            ...item,
            relevance: scoreItem(item, query)
        }));

        if (query) {
            items = items.filter((item) => {
                const haystack = normalize([
                    item.title,
                    item.year,
                    item.region,
                    item.type,
                    item.genre,
                    (item.tags || []).join(" "),
                    item.oneLine
                ].join(" "));
                return haystack.includes(query);
            });
        } else {
            items = items.slice(0, 48);
        }

        const sortValue = sort ? sort.value : "relevance";
        if (sortValue === "year") {
            items.sort((a, b) => b.year - a.year || b.heat - a.heat);
        } else if (sortValue === "heat") {
            items.sort((a, b) => b.heat - a.heat || b.year - a.year);
        } else {
            items.sort((a, b) => b.relevance - a.relevance || b.heat - a.heat || b.year - a.year);
        }

        const limited = items.slice(0, query ? 120 : 48);
        results.innerHTML = limited.map(createSearchCard).join("\n");
        count.textContent = query
            ? `关键词“${input.value.trim()}”找到 ${items.length} 部影片，当前显示 ${limited.length} 部。`
            : "未输入关键词，当前展示热度较高的部分影片。";
    };

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const next = input ? input.value.trim() : "";
        const url = new URL(window.location.href);
        if (next) {
            url.searchParams.set("q", next);
        } else {
            url.searchParams.delete("q");
        }
        window.history.replaceState(null, "", url.toString());
        render();
    });

    if (input) {
        input.addEventListener("input", render);
    }

    if (sort) {
        sort.addEventListener("change", render);
    }

    render();
}

function initPlayers() {
    $$("[data-player]").forEach((player) => {
        const video = $("video[data-hls-src]", player);
        const button = $("[data-play]", player);
        const status = $("[data-player-status]", player);
        let hls = null;
        let initialized = false;

        if (!video || !button) {
            return;
        }

        const setStatus = (message) => {
            if (status) {
                status.textContent = message || "";
            }
        };

        const start = async () => {
            const source = video.dataset.hlsSrc;

            if (!source) {
                setStatus("当前影片暂无可用播放源。");
                return;
            }

            try {
                if (!initialized) {
                    if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = source;
                    } else if (Hls && Hls.isSupported()) {
                        hls = new Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hls.loadSource(source);
                        hls.attachMedia(video);
                        hls.on(Hls.Events.ERROR, function (_event, data) {
                            if (data && data.fatal) {
                                setStatus("播放源加载遇到问题，请刷新页面后重试。");
                            }
                        });
                    } else {
                        setStatus("当前浏览器不支持 HLS 播放，请更换浏览器访问。");
                        return;
                    }
                    initialized = true;
                }

                button.classList.add("is-hidden");
                video.controls = true;
                await video.play();
                setStatus("");
            } catch (error) {
                button.classList.remove("is-hidden");
                setStatus("浏览器阻止了自动播放，请再次点击播放按钮。");
            }
        };

        button.addEventListener("click", start);
        video.addEventListener("play", () => button.classList.add("is-hidden"));
        video.addEventListener("pause", () => {
            if (video.currentTime === 0 || video.ended) {
                button.classList.remove("is-hidden");
            }
        });

        window.addEventListener("beforeunload", () => {
            if (hls) {
                hls.destroy();
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initHeader();
    initMobileMenu();
    initHero();
    initLocalFilters();
    initSearchPage();
    initPlayers();
});
