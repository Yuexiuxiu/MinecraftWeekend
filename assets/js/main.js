/* ==========================================================================
   方块周末 · 站点交互
   包含：移动端导航、当前年份、复制按钮、轻量滚动出现动画。
   不收集用户数据，不使用 Cookie、localStorage 或第三方请求。
   ========================================================================== */

(function () {
  "use strict";

  var root = document.documentElement;
  var body = document.body;

  /* ---------- 1. 顶部导航状态 ---------- */
  var header = document.querySelector("[data-site-header]");

  if (header) {
    var updateHeader = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  /* ---------- 2. 移动端菜单 ---------- */
  var navToggle = document.querySelector("[data-nav-toggle]");
  var siteNav = document.getElementById("site-menu");
  var navLabel = navToggle ? navToggle.querySelector("[data-nav-label]") : null;

  if (navToggle && siteNav) {
    var setMenuState = function (open) {
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "关闭导航菜单" : "打开导航菜单");
      siteNav.classList.toggle("is-open", open);
      body.classList.toggle("nav-open", open);

      if (navLabel) {
        navLabel.textContent = open ? "关闭" : "菜单";
      }
    };

    navToggle.addEventListener("click", function () {
      var isOpen = navToggle.getAttribute("aria-expanded") === "true";
      setMenuState(!isOpen);
    });

    // 点击菜单中的链接后自动收起
    siteNav.addEventListener("click", function (event) {
      var link = event.target.closest("a");
      if (link) {
        setMenuState(false);
      }
    });

    // 按 Esc 关闭菜单并把焦点还给按钮
    document.addEventListener("keydown", function (event) {
      var isOpen = navToggle.getAttribute("aria-expanded") === "true";
      if (event.key === "Escape" && isOpen) {
        setMenuState(false);
        navToggle.focus();
      }
    });

    // 点击菜单外部时关闭
    document.addEventListener("click", function (event) {
      var isOpen = navToggle.getAttribute("aria-expanded") === "true";
      var clickedInsideHeader = event.target.closest(".site-header");
      if (isOpen && !clickedInsideHeader) {
        setMenuState(false);
      }
    });

    // 从移动端宽度切换到桌面端时，清理菜单状态
    var desktopQuery = window.matchMedia("(min-width: 841px)");
    var handleDesktopChange = function (event) {
      if (event.matches) {
        setMenuState(false);
      }
    };

    if (typeof desktopQuery.addEventListener === "function") {
      desktopQuery.addEventListener("change", handleDesktopChange);
    } else if (typeof desktopQuery.addListener === "function") {
      // 兼容较旧的浏览器
      desktopQuery.addListener(handleDesktopChange);
    }
  }

  /* ---------- 3. 页脚当前年份 ---------- */
  var yearTargets = document.querySelectorAll("[data-current-year]");
  var currentYear = String(new Date().getFullYear());

  yearTargets.forEach(function (target) {
    target.textContent = currentYear;
  });

  /* ---------- 4. 复制联系方式 / 服务器地址 ---------- */
  var toast = document.querySelector("[data-toast]");
  var toastTimer = null;

  var showToast = function (message) {
    if (!toast) {
      return;
    }

    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");

    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 2200);
  };

  // 兼容不支持 Clipboard API 或被浏览器拒绝的情况
  var fallbackCopy = function (text) {
    var helper = document.createElement("textarea");
    helper.value = text;
    helper.setAttribute("readonly", "");
    helper.setAttribute("aria-hidden", "true");
    helper.style.position = "fixed";
    helper.style.top = "-9999px";
    helper.style.left = "-9999px";
    helper.style.opacity = "0";
    document.body.appendChild(helper);
    helper.select();
    helper.setSelectionRange(0, helper.value.length);

    var succeeded = false;
    try {
      succeeded = document.execCommand("copy");
    } catch (error) {
      succeeded = false;
    }

    document.body.removeChild(helper);
    return succeeded;
  };

  var copyText = function (text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () {
        return fallbackCopy(text) ? undefined : Promise.reject(new Error("copy failed"));
      });
    }

    return new Promise(function (resolve, reject) {
      if (fallbackCopy(text)) {
        resolve();
      } else {
        reject(new Error("copy failed"));
      }
    });
  };

  var copyButtons = document.querySelectorAll(".copy-btn[data-copy]");
  var buttonTimers = new WeakMap();

  copyButtons.forEach(function (button) {
    var originalText = button.textContent.trim();

    button.addEventListener("click", function () {
      var value = button.getAttribute("data-copy");
      var name = button.getAttribute("data-copy-name") || "内容";

      if (!value) {
        showToast("暂无可复制的内容");
        return;
      }

      copyText(value)
        .then(function () {
          showToast(name + "已复制到剪贴板");
          button.textContent = "已复制";
          button.classList.add("is-copied");

          var previousTimer = buttonTimers.get(button);
          if (previousTimer) {
            window.clearTimeout(previousTimer);
          }

          var timer = window.setTimeout(function () {
            button.textContent = originalText;
            button.classList.remove("is-copied");
          }, 1800);

          buttonTimers.set(button, timer);
        })
        .catch(function () {
          showToast("复制失败，请手动选择文本后复制");
        });
    });
  });

  /* ---------- 5. 滚动出现动画 ---------- */
  var revealItems = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  var reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var supportsObserver = "IntersectionObserver" in window;

  if (revealItems.length > 0 && supportsObserver && !reduceMotionQuery.matches) {
    body.classList.add("reveal-enabled");

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.08,
      }
    );

    revealItems.forEach(function (item) {
      observer.observe(item);
    });
  }

  // 用户在页面打开后切换到“减少动态效果”时，立即显示全部内容
  var handleMotionPreference = function (event) {
    if (event.matches) {
      revealItems.forEach(function (item) {
        item.classList.add("is-visible");
      });
      body.classList.remove("reveal-enabled");
    }
  };

  if (typeof reduceMotionQuery.addEventListener === "function") {
    reduceMotionQuery.addEventListener("change", handleMotionPreference);
  } else if (typeof reduceMotionQuery.addListener === "function") {
    reduceMotionQuery.addListener(handleMotionPreference);
  }

  // 给脚本自身一个可用标记，方便未来扩展样式，不影响无脚本访问
  root.classList.add("js-ready");
})();
