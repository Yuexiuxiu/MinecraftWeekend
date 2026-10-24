/* ==========================================================================
   周末愉快 · 站点交互
   包含：顶部导航、二维码悬浮/点按面板、滚动高亮、复制按钮、当前年份。
   不收集用户数据，不使用 Cookie、localStorage 或第三方请求。
   ========================================================================== */

(function () {
  "use strict";

  var root = document.documentElement;
  var body = document.body;

  /* ---------- 1. 顶部导航滚动状态 ---------- */
  var header = document.querySelector("[data-site-header]");

  if (header) {
    var updateHeader = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  /* ---------- 2. 二维码面板：桌面悬停，移动端点按 ---------- */
  var closeAllQrPanels = function () {};

  var setupQrPanels = function () {
    var qrRoots = Array.prototype.slice.call(document.querySelectorAll("[data-qr-root]"));
    var closeFunctions = [];
    var canHover = window.matchMedia("(hover: hover) and (pointer: fine)");

    qrRoots.forEach(function (qrRoot) {
      var trigger = qrRoot.querySelector("[data-qr-trigger]");
      var panel = qrRoot.querySelector("[data-qr-panel]");
      var closeButton = panel ? panel.querySelector("[data-qr-close]") : null;

      if (!trigger || !panel) {
        return;
      }

      var hoverTimer = null;
      var isOpen = false;

      var clearHoverTimer = function () {
        if (hoverTimer) {
          window.clearTimeout(hoverTimer);
          hoverTimer = null;
        }
      };

      var openPanel = function () {
        clearHoverTimer();
        panel.hidden = false;
        isOpen = true;
        trigger.setAttribute("aria-expanded", "true");
        qrRoot.classList.add("is-qr-open");
      };

      var closePanel = function (returnFocus) {
        clearHoverTimer();
        panel.hidden = true;
        isOpen = false;
        trigger.setAttribute("aria-expanded", "false");
        qrRoot.classList.remove("is-qr-open");

        if (returnFocus) {
          trigger.focus();
        }
      };

      closeFunctions.push(function () {
        closePanel(false);
      });

      // 点按：安卓/iPhone 与桌面点击都使用这个分支
      trigger.addEventListener("click", function () {
        if (isOpen) {
          closePanel(false);
        } else {
          openPanel();
        }
      });

      // 桌面端悬停打开；触屏设备不会被 mouseenter 干扰
      trigger.addEventListener("mouseenter", function () {
        if (canHover.matches) {
          openPanel();
        }
      });

      qrRoot.addEventListener("mouseenter", clearHoverTimer);

      qrRoot.addEventListener("mouseleave", function () {
        if (!canHover.matches) {
          return;
        }

        // 留一点时间给鼠标从按钮移动到面板，同时避免打断键盘焦点
        hoverTimer = window.setTimeout(function () {
          if (!qrRoot.contains(document.activeElement)) {
            closePanel(false);
          }
        }, 180);
      });

      if (closeButton) {
        closeButton.addEventListener("click", function () {
          closePanel(true);
        });
      }

      // 点击面板内的链接后关闭面板
      panel.addEventListener("click", function (event) {
        if (event.target.closest("a")) {
          closePanel(false);
        }
      });

      // 键盘焦点离开整个二维码区域时关闭
      qrRoot.addEventListener("focusout", function (event) {
        if (!qrRoot.contains(event.relatedTarget)) {
          closePanel(false);
        }
      });

      // 点击面板外部关闭
      document.addEventListener("click", function (event) {
        if (isOpen && !qrRoot.contains(event.target)) {
          closePanel(false);
        }
      });

      // Esc 关闭并回到触发按钮
      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && isOpen) {
          closePanel(true);
        }
      });
    });

    return function () {
      closeFunctions.forEach(function (close) {
        close();
      });
    };
  };

  closeAllQrPanels = setupQrPanels();

  /* ---------- 3. 移动端菜单 ---------- */
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

      // 菜单收起时，二维码面板也不应保持展开状态
      if (!open) {
        closeAllQrPanels();
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

  /* ---------- 4. 滚动时高亮当前章节 ---------- */
  var initScrollSpy = function () {
    var spyLinks = Array.prototype.slice.call(document.querySelectorAll("[data-spy-target]"));
    var pairs = [];

    spyLinks.forEach(function (link) {
      var selector = link.getAttribute("data-spy-target");
      var section = selector ? document.querySelector(selector) : null;

      if (section) {
        pairs.push({
          link: link,
          section: section,
        });
      }
    });

    if (!pairs.length) {
      return;
    }

    // 按章节在文档中的实际位置排序，避免「加入」在 DOM 中位于 FAQ 之前造成误判
    pairs.sort(function (a, b) {
      return a.section.offsetTop - b.section.offsetTop;
    });

    var ticking = false;

    var updateActive = function () {
      ticking = false;

      var headerHeight = header ? header.offsetHeight : 0;
      var probe = window.scrollY + headerHeight + 90;
      var activePair = pairs[0];
      var documentHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );

      pairs.forEach(function (pair) {
        if (pair.section.offsetTop <= probe) {
          activePair = pair;
        }
      });

      // 到达页面底部时，高亮最后一个章节
      if (window.scrollY + window.innerHeight >= documentHeight - 6) {
        activePair = pairs[pairs.length - 1];
      }

      pairs.forEach(function (pair) {
        var isActive = pair === activePair;
        pair.link.classList.toggle("is-active", isActive);

        if (pair.link.tagName === "A") {
          if (isActive) {
            pair.link.setAttribute(
              "aria-current",
              pair.link.getAttribute("data-spy-target") === "#top" ? "page" : "location"
            );
          } else {
            pair.link.removeAttribute("aria-current");
          }
        }
      });
    };

    var requestUpdate = function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateActive);
      }
    };

    updateActive();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    window.addEventListener("load", requestUpdate);
  };

  initScrollSpy();

  /* ---------- 5. 页脚当前年份 ---------- */
  var yearTargets = document.querySelectorAll("[data-current-year]");
  var currentYear = String(new Date().getFullYear());

  yearTargets.forEach(function (target) {
    target.textContent = currentYear;
  });

  /* ---------- 6. 复制联系方式 / QQ 群号 ---------- */
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

  // 所有带 data-copy 的按钮都可用（包括小型复制按钮和主按钮样式）
  var copyButtons = document.querySelectorAll("[data-copy]");
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

  /* ---------- 7. 滚动出现动画 ---------- */
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
