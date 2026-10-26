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

  /* ---------- 6.1 点击二维码拉起 QQ ---------- */
  var qqLaunching = false;
  var qqLaunchTimer = null;

  var buildQqScheme = function (kind, value) {
    if (kind === "channel") {
      return (
        "mqqguild://guild/share?_wv=3&_wwv=128&appChannel=share&inviteCode=" +
        encodeURIComponent(value)
      );
    }

    return (
      "mqqapi://card/show_pslcard?src_type=internal&version=1&uin=" +
      encodeURIComponent(value) +
      "&card_type=group&source=qrcode"
    );
  };

  var launchQq = function (image) {
    var kind = image.getAttribute("data-qq-kind");
    var value = image.getAttribute("data-qq-value");

    if (!kind || !value || qqLaunching) {
      return;
    }

    qqLaunching = true;
    window.clearTimeout(qqLaunchTimer);
    qqLaunchTimer = window.setTimeout(function () {
      qqLaunching = false;
    }, 1800);

    // 在用户点击的当下先复制，避免稍后浏览器取消剪贴板授权
    var copyPromise = copyText(value)
      .then(function () {
        return true;
      })
      .catch(function () {
        return false;
      });

    var scheme = buildQqScheme(kind, value);
    var pageLeft = false;
    var launchFrame = document.createElement("iframe");

    launchFrame.setAttribute("aria-hidden", "true");
    launchFrame.setAttribute("tabindex", "-1");
    launchFrame.style.cssText =
      "position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;border:0;";

    var onVisibilityChange = function () {
      if (document.visibilityState === "hidden") {
        pageLeft = true;
      }
    };

    var onWindowBlur = function () {
      pageLeft = true;
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onWindowBlur, { once: true });
    document.body.appendChild(launchFrame);

    try {
      launchFrame.src = scheme;
    } catch (error) {
      pageLeft = false;
    }

    window.setTimeout(function () {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onWindowBlur);
      launchFrame.remove();

      if (!pageLeft) {
        copyPromise.then(function (copied) {
          var label = kind === "channel" ? "QQ 频道码" : "QQ 群号";

          if (copied) {
            showToast(
              "拉取失败，已将 " +
                label +
                " " +
                value +
                " 复制到剪贴板，可前往 QQ 手动搜索加入"
            );
          } else {
            showToast(
              "拉取失败，自动复制没成功，请前往 QQ 手动搜索 " +
                label +
                " " +
                value
            );
          }
        });
      }
    }, 1500);
  };

  document.addEventListener("click", function (event) {
    var image = event.target.closest("img[data-qq-kind]");
    if (!image) {
      return;
    }

    event.preventDefault();
    launchQq(image);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    var image = event.target.closest("img[data-qq-kind]");
    if (!image) {
      return;
    }

    event.preventDefault();
    launchQq(image);
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

  /* ---------- 8. 常驻二维码提示与二维码弹层 ---------- */
  var setupQrDialog = function () {
    if (document.querySelector("[data-qr-dialog]")) {
      return;
    }

    var hint = document.createElement("button");
    hint.type = "button";
    hint.className = "qr-hint";
    hint.setAttribute("data-qr-hint", "");
    hint.setAttribute("aria-haspopup", "dialog");
    hint.setAttribute("aria-controls", "qr-dialog");
    hint.setAttribute("aria-expanded", "false");
    hint.innerHTML =
      '<span class="qr-hint__icon" aria-hidden="true"></span>' +
      '<span class="qr-hint__copy">' +
      '<strong>扫码加入</strong>' +
      "<small>QQ 群 870774459</small>" +
      "</span>";

    var dialog = document.createElement("div");
    dialog.className = "qr-dialog";
    dialog.id = "qr-dialog";
    dialog.setAttribute("data-qr-dialog", "");
    dialog.hidden = true;
    dialog.innerHTML =
      '<div class="qr-dialog__backdrop" data-qr-dialog-close aria-hidden="true"></div>' +
      '<div class="qr-dialog__panel" role="dialog" aria-modal="true" aria-labelledby="qr-dialog-title" tabindex="-1">' +
      '<button class="qr-dialog__close" type="button" data-qr-dialog-close aria-label="关闭二维码弹层">×</button>' +
      '<p class="qr-panel-kicker">JOIN THE WORLD</p>' +
      '<h2 id="qr-dialog-title">扫码加入周末愉快</h2>' +
      '<p class="qr-dialog__lead">点击二维码拉起 QQ；手机扫码也可以。拉起失败会自动复制群号或频道码。</p>' +
      '<div class="qr-dialog__grid">' +
      '<figure class="qr-figure">' +
      '<img src="/assets/img/qq-group-qr.png" alt="周末愉快 QQ 群二维码，群号 870774459" width="1000" height="1000" loading="lazy" decoding="async" data-qq-kind="group" data-qq-value="870774459" tabindex="0" role="button" aria-label="点击拉起 QQ 群 870774459；失败会复制群号" title="点击拉起 QQ 群；失败会复制群号">' +
      '<figcaption><span>QQ 群</span><strong>870774459</strong></figcaption>' +
      "</figure>" +
      '<figure class="qr-figure">' +
      '<img src="/assets/img/qq-channel-qr.png" alt="周末愉快 QQ 频道二维码，频道号 cdcvk4521a" width="1000" height="1000" loading="lazy" decoding="async" data-qq-kind="channel" data-qq-value="cdcvk4521a" tabindex="0" role="button" aria-label="点击拉起 QQ 频道 cdcvk4521a；失败会复制频道码" title="点击拉起 QQ 频道；失败会复制频道码">' +
      '<figcaption><span>QQ 频道</span><strong>cdcvk4521a</strong></figcaption>' +
      "</figure>" +
      "</div>" +
      '<p class="qr-dialog__foot"><span>QQ 群 870774459 · 频道 cdcvk4521a</span><a href="/index.html#join">查看详细加入方式 →</a></p>' +
      "</div>";

    document.body.appendChild(hint);
    document.body.appendChild(dialog);

    var panel = dialog.querySelector(".qr-dialog__panel");
    var closeButtons = dialog.querySelectorAll("[data-qr-dialog-close]");
    var lastFocused = null;
    var isOpen = false;

    var getFocusable = function () {
      return Array.prototype.slice
        .call(
          dialog.querySelectorAll(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        )
        .filter(function (element) {
          return element.offsetParent !== null;
        });
    };

    var openDialog = function () {
      if (isOpen) {
        return;
      }

      lastFocused = document.activeElement;
      if (!lastFocused || lastFocused === document.body) {
        lastFocused = hint;
      }
      dialog.hidden = false;
      isOpen = true;
      hint.setAttribute("aria-expanded", "true");
      body.classList.add("qr-dialog-open");

      var close = dialog.querySelector(".qr-dialog__close");
      if (close) {
        close.focus();
      }
    };

    var closeDialog = function () {
      if (!isOpen) {
        return;
      }

      dialog.hidden = true;
      isOpen = false;
      hint.setAttribute("aria-expanded", "false");
      body.classList.remove("qr-dialog-open");

      if (lastFocused && typeof lastFocused.focus === "function") {
        window.setTimeout(function () {
          lastFocused.focus();
        }, 0);
      }
    };

    hint.addEventListener("click", function () {
      if (dialog.hidden) {
        openDialog();
      } else {
        closeDialog();
      }
    });

    closeButtons.forEach(function (button) {
      button.addEventListener("click", closeDialog);
    });

    dialog.addEventListener("click", function (event) {
      var link = event.target.closest("a");
      if (link) {
        closeDialog();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (!isOpen) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        closeDialog();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      var focusable = getFocusable();
      if (!focusable.length) {
        event.preventDefault();
        panel.focus();
        return;
      }

      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  };

  setupQrDialog();

  // 给脚本自身一个可用标记，方便未来扩展样式，不影响无脚本访问
  root.classList.add("js-ready");
})();
