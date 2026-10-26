/* ==========================================================================
   周末愉快 · 更新日志
   读取网站与游戏服务器两份 JSON，渲染首页摘要和两个日志页面。
   · 网站日志：changelog.json
   · 服务器日志：server-changelog.json
   支持：标签筛选、未读标记、空状态、加载失败提示、RSS 入口。
   不依赖任何框架或后端。
   ========================================================================== */

(function () {
  "use strict";

  var pageRoot = document.querySelector("[data-changelog-page]");
  var latestRoot = document.querySelector("[data-changelog-latest]");

  if (!pageRoot && !latestRoot) {
    return;
  }

  var PAGE_KIND = pageRoot
    ? pageRoot.getAttribute("data-changelog-kind") || "website"
    : "website";
  var PAGE_SOURCE = pageRoot
    ? pageRoot.getAttribute("data-changelog-source") ||
      (PAGE_KIND === "server" ? "server-changelog.json" : "changelog.json")
    : null;
  var STORAGE_KEY = "weekend-changelog-read-" + PAGE_KIND + "-v1";
  var CANONICAL =
    (document.querySelector('link[rel="canonical"]') || {}).href ||
    window.location.href.split("#")[0];
  var ALLOWED_TAGS = ["新增", "调整", "修复", "重要"];
  var FILTERS = {
    all: null,
    new: "新增",
    adjust: "调整",
    fix: "修复",
    important: "重要",
  };

  var state = {
    entries: [],
    site: {},
    activeFilter: "all",
    readIds: new Set(),
    storageAvailable: true,
    requestId: 0,
    loaded: false,
  };

  /* ---------- 工具函数 ---------- */

  var make = function (tag, className, text) {
    var element = document.createElement(tag);

    if (className) {
      element.className = className;
    }

    if (typeof text === "string") {
      element.textContent = text;
    }

    return element;
  };

  var formatDate = function (isoDate) {
    return String(isoDate || "").replace(/-/g, ".");
  };

  var getTagClass = function (tag) {
    if (tag === "新增") {
      return "tag-chip--new";
    }
    if (tag === "调整") {
      return "tag-chip--adjust";
    }
    if (tag === "修复") {
      return "tag-chip--fix";
    }
    if (tag === "重要") {
      return "tag-chip--important";
    }
    return "";
  };

  var createTagChip = function (tag) {
    return make("span", "tag-chip " + getTagClass(tag), tag);
  };

  var normalizeId = function (value) {
    return String(value || "")
      .trim()
      .replace(/[^A-Za-z0-9_-]/g, "-")
      .replace(/-+/g, "-");
  };

  var checkStorage = function () {
    try {
      var key = "__weekend_storage_test__";
      window.localStorage.setItem(key, "1");
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      return false;
    }
  };

  var loadReadIds = function () {
    if (!state.storageAvailable) {
      return new Set();
    }

    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return new Set();
      }

      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return new Set();
      }

      return new Set(
        parsed.filter(function (id) {
          return typeof id === "string" && id.length > 0;
        })
      );
    } catch (error) {
      return new Set();
    }
  };

  var saveReadIds = function () {
    if (!state.storageAvailable) {
      return;
    }

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(Array.from(state.readIds))
      );
    } catch (error) {
      // 隐私模式或存储配额不足时静默降级，不影响正文阅读
      state.storageAvailable = false;
    }
  };

  var normalizePayload = function (payload) {
    if (!payload || !Array.isArray(payload.entries)) {
      throw new Error("更新日志数据格式不正确");
    }

    var entries = payload.entries
      .filter(function (raw) {
        return raw && raw.version && raw.date && raw.title;
      })
      .map(function (raw) {
        var tags = Array.isArray(raw.tags)
          ? raw.tags.filter(function (tag) {
              return ALLOWED_TAGS.indexOf(tag) !== -1;
            })
          : [];

        if (raw.important && tags.indexOf("重要") === -1) {
          tags.push("重要");
        }

        var changes = Array.isArray(raw.changes)
          ? raw.changes
              .filter(function (change) {
                return change && change.type && change.text;
              })
              .map(function (change) {
                return {
                  type: ALLOWED_TAGS.indexOf(change.type) !== -1 ? change.type : "调整",
                  text: String(change.text),
                };
              })
          : [];

        return {
          id: normalizeId(raw.id || raw.version),
          version: String(raw.version),
          date: String(raw.date),
          title: String(raw.title),
          summary: String(raw.summary || ""),
          important: Boolean(raw.important),
          tags: tags,
          changes: changes,
        };
      })
      .sort(function (a, b) {
        if (a.date === b.date) {
          return b.version.localeCompare(a.version, "zh-CN", { numeric: true });
        }
        return b.date.localeCompare(a.date);
      });

    return {
      site: payload.site || {},
      entries: entries,
    };
  };

  var updateSiteMeta = function (site, entries) {
    var latestVersion = site.latestVersion || (entries[0] && entries[0].version) || "";

    document.querySelectorAll("[data-latest-version]").forEach(function (target) {
      if (!latestVersion) {
        target.hidden = true;
        return;
      }

      target.textContent = latestVersion;
      target.hidden = false;
    });

    document.querySelectorAll("[data-latest-updated]").forEach(function (target) {
      var updatedAt = site.updatedAt || (entries[0] && entries[0].date) || "";
      if (!updatedAt) {
        target.hidden = true;
        return;
      }

      target.textContent = formatDate(updatedAt);
      if (target.tagName === "TIME") {
        target.setAttribute("datetime", updatedAt);
      }
      target.hidden = false;
    });
  };

  /* ---------- 首页公告板：最近 1–2 条摘要 ---------- */

  var renderLatest = function () {
    var container = document.querySelector("[data-changelog-latest]");
    if (!container) {
      return;
    }

    container.textContent = "";

    if (!state.entries.length) {
      var empty = make("p", "latest-state", "暂时还没有更新记录。");
      container.appendChild(empty);
      return;
    }

    var latestEntries = state.entries.slice(0, 2);

    latestEntries.forEach(function (entry) {
      var article = make(
        "article",
        "latest-entry" + (entry.important ? " latest-entry--important" : "")
      );

      var top = make("div", "latest-entry__top");
      top.appendChild(make("span", "version-badge", entry.version));

      if (entry.kindLabel) {
        top.appendChild(make("span", "latest-entry__kind", entry.kindLabel));
      }

      var time = make("time", "latest-entry__date", formatDate(entry.date));
      time.setAttribute("datetime", entry.date);
      top.appendChild(time);

      if (entry.important) {
        top.appendChild(make("span", "important-flag", "重点"));
      }

      var pagePath = entry.page || "changelog.html";
      var title = make("h3", "latest-entry__title");
      var titleLink = make("a", null, entry.title);
      titleLink.href = pagePath + "#" + encodeURIComponent(entry.id);
      title.appendChild(titleLink);

      var summary = make("p", "latest-entry__summary", entry.summary);
      var tags = make("div", "latest-entry__tags");

      entry.tags.forEach(function (tag) {
        tags.appendChild(createTagChip(tag));
      });

      var more = make("a", "text-link latest-entry__more", "查看详情");
      more.href = pagePath + "#" + encodeURIComponent(entry.id);
      var arrow = make("span", null, "→");
      arrow.setAttribute("aria-hidden", "true");
      more.appendChild(arrow);

      article.appendChild(top);
      article.appendChild(title);
      article.appendChild(summary);
      article.appendChild(tags);
      article.appendChild(more);
      container.appendChild(article);
    });
  };

  var showLatestError = function (message) {
    var container = document.querySelector("[data-changelog-latest]");
    if (!container) {
      return;
    }

    container.textContent = "";
    var box = make("div", "latest-error");
    box.appendChild(make("strong", null, "更新摘要暂时加载失败。"));

    var detail = make(
      "p",
      null,
      message || "请直接前往完整更新日志，或到 QQ 群查看实时通知。"
    );
    box.appendChild(detail);

    var links = make("div", "latest-error__links");

    var siteLink = make("a", "text-link", "网站日志");
    siteLink.href = "changelog.html";
    var siteArrow = make("span", null, "→");
    siteArrow.setAttribute("aria-hidden", "true");
    siteLink.appendChild(siteArrow);
    links.appendChild(siteLink);

    var serverLink = make("a", "text-link", "服务器日志");
    serverLink.href = "server-changelog.html";
    var serverArrow = make("span", null, "→");
    serverArrow.setAttribute("aria-hidden", "true");
    serverLink.appendChild(serverArrow);
    links.appendChild(serverLink);

    box.appendChild(links);
    container.appendChild(box);
  };

  /* ---------- changelog.html ---------- */

  var page = null;

  if (pageRoot) {
    page = {
      root: pageRoot,
      loading: pageRoot.querySelector("[data-changelog-loading]"),
      list: pageRoot.querySelector("[data-changelog-list]"),
      error: pageRoot.querySelector("[data-changelog-error]"),
      empty: pageRoot.querySelector("[data-changelog-empty]"),
      count: pageRoot.querySelector("[data-changelog-count]"),
      unread: pageRoot.querySelector("[data-changelog-unread]"),
      markAll: pageRoot.querySelector("[data-changelog-mark-all]"),
      retry: pageRoot.querySelector("[data-changelog-retry]"),
      filters: Array.prototype.slice.call(
        pageRoot.querySelectorAll("[data-changelog-filter]")
      ),
    };
  }

  var setStateVisibility = function (loading, error, empty, list) {
    if (!page) {
      return;
    }

    if (page.loading) {
      page.loading.hidden = !loading;
    }
    if (page.error) {
      page.error.hidden = !error;
    }
    if (page.empty) {
      page.empty.hidden = !empty;
    }
    if (page.list) {
      page.list.hidden = !list;
    }
  };

  var setFiltersDisabled = function (disabled) {
    if (!page) {
      return;
    }

    page.filters.forEach(function (button) {
      button.disabled = disabled;
    });
  };

  var updateUnreadUi = function () {
    if (!page) {
      return;
    }

    var unreadCount = state.entries.filter(function (entry) {
      return !state.readIds.has(entry.id);
    }).length;

    if (page.unread) {
      page.unread.textContent = state.storageAvailable
        ? unreadCount > 0
          ? unreadCount + " 条未读"
          : "已全部读完"
        : "未读状态不可用";
    }

    if (page.markAll) {
      page.markAll.hidden = !state.storageAvailable || unreadCount === 0;
    }
  };

  var markEntryRead = function (entryId) {
    if (!state.storageAvailable || state.readIds.has(entryId)) {
      return;
    }

    state.readIds.add(entryId);
    saveReadIds();

    var card = document.querySelector('[data-changelog-entry="' + entryId + '"]');
    if (card) {
      card.classList.remove("is-unread");
      var badge = card.querySelector("[data-unread-badge]");
      if (badge) {
        badge.remove();
      }
    }

    updateUnreadUi();
  };

  var createUnreadBadge = function () {
    var badge = make("span", "unread-badge", "未读");
    badge.setAttribute("data-unread-badge", "");
    return badge;
  };

  var createChangelogItem = function (entry) {
    var unread = state.storageAvailable && !state.readIds.has(entry.id);
    var article = make(
      "article",
      "changelog-item" +
        (entry.important ? " is-important" : "") +
        (unread ? " is-unread" : "")
    );
    article.id = entry.id;
    article.setAttribute("data-changelog-entry", entry.id);

    var node = make("span", "changelog-node");
    node.setAttribute("aria-hidden", "true");
    article.appendChild(node);

    var card = make("div", "changelog-card");

    var meta = make("div", "changelog-meta");
    meta.appendChild(make("span", "version-badge", entry.version));

    var time = make("time", "changelog-date", formatDate(entry.date));
    time.setAttribute("datetime", entry.date);
    meta.appendChild(time);

    if (entry.important) {
      meta.appendChild(make("span", "important-flag", "重点"));
    }

    if (unread) {
      meta.appendChild(createUnreadBadge());
    }

    var tags = make("div", "changelog-tags");
    entry.tags.forEach(function (tag) {
      tags.appendChild(createTagChip(tag));
    });
    meta.appendChild(tags);

    var title = make("h2", "changelog-title", entry.title);
    var summary = make("p", "changelog-summary", entry.summary);

    var details = document.createElement("details");
    details.className = "changelog-details";

    var summaryBar = document.createElement("summary");
    var summaryText = make(
      "span",
      null,
      "展开变更明细" + (entry.changes.length ? " · " + entry.changes.length + " 项" : "")
    );
    var chevron = make("span", "details-chevron");
    chevron.setAttribute("aria-hidden", "true");
    summaryBar.appendChild(summaryText);
    summaryBar.appendChild(chevron);
    details.appendChild(summaryBar);

    if (entry.changes.length) {
      var list = make("ul", "changelog-changes");
      entry.changes.forEach(function (change) {
        var item = make("li", "changelog-change");
        item.appendChild(
          make("span", "change-type " + getTagClass(change.type), change.type)
        );
        item.appendChild(make("span", "change-text", change.text));
        list.appendChild(item);
      });
      details.appendChild(list);
    } else {
      details.appendChild(
        make("p", "change-empty", "这个版本没有填写详细变更。")
      );
    }

    details.addEventListener("toggle", function () {
      if (details.open) {
        markEntryRead(entry.id);
      }
    });

    card.appendChild(meta);
    card.appendChild(title);
    card.appendChild(summary);
    card.appendChild(details);
    article.appendChild(card);
    return article;
  };

  var getFilteredEntries = function () {
    var tag = FILTERS[state.activeFilter];

    if (!tag) {
      return state.entries;
    }

    return state.entries.filter(function (entry) {
      return entry.tags.indexOf(tag) !== -1;
    });
  };

  var updateFilterButtons = function () {
    if (!page) {
      return;
    }

    page.filters.forEach(function (button) {
      var active = button.getAttribute("data-changelog-filter") === state.activeFilter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  };

  var renderChangelogList = function () {
    if (!page) {
      return;
    }

    var entries = getFilteredEntries();
    page.list.textContent = "";
    setFiltersDisabled(false);
    setStateVisibility(false, false, false, true);
    updateUnreadUi();

    if (!entries.length) {
      setStateVisibility(false, false, true, false);

      if (page.empty) {
        var text = page.empty.querySelector("[data-empty-text]");
        if (text) {
          text.textContent = state.entries.length
            ? "这个筛选下暂时没有记录，换一个标签试试。"
            : "还没有更新记录。下一版本见。";
        }
      }

      if (page.count) {
        page.count.textContent = "共 0 个版本";
      }
      return;
    }

    var fragment = document.createDocumentFragment();
    entries.forEach(function (entry) {
      fragment.appendChild(createChangelogItem(entry));
    });
    page.list.appendChild(fragment);

    if (page.count) {
      page.count.textContent =
        "共 " + entries.length + " 个版本 · 按时间倒序";
    }
  };

  var openHashTarget = function () {
    if (!page || !window.location.hash) {
      return;
    }

    var target = document.getElementById(window.location.hash.slice(1));
    if (!target || !target.classList.contains("changelog-item")) {
      return;
    }

    var details = target.querySelector("details");
    if (details) {
      details.open = true;
    }

    var scrollToTarget = function () {
      var top = target.getBoundingClientRect().top + window.scrollY - 90;
      var root = document.documentElement;
      var previousBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      window.scrollTo(0, Math.max(0, top));
      root.style.scrollBehavior = previousBehavior;
    };

    // 等 load 事件完成后再滚动，避免浏览器对初始 #fragment 的定位把它拉回顶部
    if (document.readyState === "complete") {
      window.setTimeout(scrollToTarget, 120);
    } else {
      window.addEventListener(
        "load",
        function () {
          window.setTimeout(scrollToTarget, 120);
        },
        { once: true }
      );
    }
  };

  var injectStructuredData = function () {
    if (!page || !state.entries.length) {
      return;
    }

    var previous = document.getElementById("changelog-itemlist-jsonld");
    if (previous) {
      previous.remove();
    }

    var structuredData = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: document.title,
      url: CANONICAL,
      itemListElement: state.entries.map(function (entry, index) {
        return {
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "TechArticle",
            headline: entry.version + " · " + entry.title,
            description: entry.summary,
            datePublished: entry.date,
            url: CANONICAL + "#" + encodeURIComponent(entry.id),
          },
        };
      }),
    };

    var script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "changelog-itemlist-jsonld";
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  };

  var showPageError = function (message) {
    state.loaded = false;

    if (!page) {
      return;
    }

    setFiltersDisabled(true);
    setStateVisibility(false, true, false, false);
    if (page.count) {
      page.count.textContent = "加载失败";
    }
    if (page.unread) {
      page.unread.textContent = "";
    }

    var detail = page.error ? page.error.querySelector("[data-error-detail]") : null;
    if (detail && message) {
      detail.textContent = message;
    }
  };

  var finishPageRender = function () {
    if (!page) {
      return;
    }

    state.readIds = loadReadIds();
    renderChangelogList();
    updateFilterButtons();
    updateUnreadUi();
    injectStructuredData();
    openHashTarget();
  };

  var bindPageEvents = function () {
    if (!page) {
      return;
    }

    page.filters.forEach(function (button) {
      button.addEventListener("click", function () {
        var filter = button.getAttribute("data-changelog-filter");
        if (!state.loaded || !Object.prototype.hasOwnProperty.call(FILTERS, filter)) {
          return;
        }

        state.activeFilter = filter;
        updateFilterButtons();
        renderChangelogList();
      });
    });

    if (page.markAll) {
      page.markAll.addEventListener("click", function () {
        if (!state.loaded) {
          return;
        }

        state.entries.forEach(function (entry) {
          state.readIds.add(entry.id);
        });
        saveReadIds();
        renderChangelogList();
      });
    }

    if (page.retry) {
      page.retry.addEventListener("click", function () {
        loadPageData();
      });
    }
  };

  /* ---------- 数据加载 ---------- */

  var setLoading = function () {
    state.loaded = false;

    if (page) {
      setFiltersDisabled(true);
      setStateVisibility(true, false, false, false);
      if (page.count) {
        page.count.textContent = "正在读取更新记录…";
      }
      if (page.unread) {
        page.unread.textContent = "";
      }
      if (page.markAll) {
        page.markAll.hidden = true;
      }
    }

    if (latestRoot) {
      latestRoot.textContent = "";
      latestRoot.appendChild(
        make("p", "latest-state", "正在读取最新更新…")
      );
    }
  };

  var fetchJson = function (url, controller) {
    return fetch(url, {
      cache: "no-cache",
      credentials: "same-origin",
      signal: controller ? controller.signal : undefined,
    }).then(function (response) {
      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }
      return response.json();
    });
  };

  var getErrorMessage = function (error) {
    return error && error.name === "AbortError"
      ? "请求超时，请检查网络后重试。"
      : "无法读取更新日志数据，请稍后重试或前往 QQ 群查看通知。";
  };

  var loadPageData = function () {
    if (!page || !PAGE_SOURCE) {
      return;
    }

    state.requestId += 1;
    var requestId = state.requestId;
    var controller = "AbortController" in window ? new AbortController() : null;
    var timeout = null;

    setLoading();

    if (controller) {
      timeout = window.setTimeout(function () {
        controller.abort();
      }, 8000);
    }

    fetchJson(PAGE_SOURCE, controller)
      .then(function (payload) {
        if (requestId !== state.requestId) {
          return;
        }

        var normalized = normalizePayload(payload);
        state.site = normalized.site;
        state.entries = normalized.entries;
        state.loaded = true;

        updateSiteMeta(state.site, state.entries);
        finishPageRender();
      })
      .catch(function (error) {
        if (requestId !== state.requestId) {
          return;
        }

        showPageError(getErrorMessage(error));
      })
      .finally(function () {
        if (timeout) {
          window.clearTimeout(timeout);
        }
      });
  };

  var latestSources = [
    {
      source: "changelog.json",
      page: "changelog.html",
      label: "网站",
    },
    {
      source: "server-changelog.json",
      page: "server-changelog.html",
      label: "游戏服务器",
    },
  ];

  var loadLatestData = function () {
    if (!latestRoot) {
      return;
    }

    state.requestId += 1;
    var requestId = state.requestId;
    var controller = "AbortController" in window ? new AbortController() : null;
    var timeout = null;

    setLoading();

    if (controller) {
      timeout = window.setTimeout(function () {
        controller.abort();
      }, 8000);
    }

    Promise.all(
      latestSources.map(function (source) {
        return fetchJson(source.source, controller)
          .then(function (payload) {
            return {
              source: source,
              normalized: normalizePayload(payload),
            };
          })
          .catch(function (error) {
            return {
              source: source,
              error: error,
            };
          });
      })
    )
      .then(function (results) {
        if (requestId !== state.requestId) {
          return;
        }

        var successful = results.filter(function (result) {
          return result.normalized;
        });

        if (!successful.length) {
          var firstError = results[0] ? results[0].error : null;
          showLatestError(getErrorMessage(firstError));
          return;
        }

        var websiteResult = successful.filter(function (result) {
          return result.source.source === "changelog.json";
        })[0];

        if (websiteResult) {
          updateSiteMeta(
            websiteResult.normalized.site,
            websiteResult.normalized.entries
          );
        }

        var combined = [];

        successful.forEach(function (result) {
          var firstEntry = result.normalized.entries[0];
          if (!firstEntry) {
            return;
          }

          var entry = Object.assign({}, firstEntry, {
            page: result.source.page,
            kindLabel: result.source.label,
          });
          combined.push(entry);
        });

        combined.sort(function (a, b) {
          return b.date.localeCompare(a.date);
        });

        state.entries = combined;
        renderLatest();
      })
      .catch(function (error) {
        if (requestId !== state.requestId) {
          return;
        }

        showLatestError(getErrorMessage(error));
      })
      .finally(function () {
        if (timeout) {
          window.clearTimeout(timeout);
        }
      });
  };

  state.storageAvailable = checkStorage();

  if (page) {
    state.readIds = loadReadIds();
    bindPageEvents();
    loadPageData();
  } else {
    loadLatestData();
  }
})();
