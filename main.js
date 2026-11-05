/* Kimball Hansen — site behaviour.
   Three jobs only: the sticky-nav hairline, the mobile menu, and the
   scroll reveal. Everything on the page works with this file absent. */

(function () {
  "use strict";

  /* ── Sticky nav hairline ──────────────────────────────────────────── */

  var nav = document.querySelector(".nav");

  if (nav) {
    var setStuck = function () {
      nav.classList.toggle("is-stuck", window.scrollY > 8);
    };
    setStuck();
    window.addEventListener("scroll", setStuck, { passive: true });
  }

  /* ── Mobile menu ──────────────────────────────────────────────────── */

  var toggle = document.querySelector(".nav__toggle");
  var menu = document.getElementById("nav-menu");
  var closeBtn = document.querySelector(".nav__close");
  var lastFocused = null;

  var FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function menuIsOpen() {
    return menu && menu.getAttribute("data-open") === "true";
  }

  function openMenu() {
    if (!menu || !toggle) return;
    lastFocused = document.activeElement;
    menu.setAttribute("data-open", "true");
    toggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    var first = menu.querySelector(FOCUSABLE);
    if (first) first.focus();
  }

  function closeMenu(returnFocus) {
    if (!menu || !toggle) return;
    menu.setAttribute("data-open", "false");
    toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    if (returnFocus !== false) {
      (lastFocused && document.contains(lastFocused) ? lastFocused : toggle).focus();
    }
  }

  if (toggle && menu) {
    menu.setAttribute("data-open", "false");
    toggle.setAttribute("aria-expanded", "false");

    toggle.addEventListener("click", function () {
      menuIsOpen() ? closeMenu() : openMenu();
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", function () { closeMenu(); });
    }

    /* Close when a menu link is followed. */
    menu.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeMenu(false);
    });

    document.addEventListener("keydown", function (event) {
      if (!menuIsOpen()) return;

      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }

      if (event.key !== "Tab") return;

      /* Focus trap: the close button plus everything inside the overlay. */
      var items = [].slice.call(menu.querySelectorAll(FOCUSABLE));
      if (closeBtn) items.unshift(closeBtn);
      items = items.filter(function (el) { return el.offsetParent !== null; });
      if (!items.length) return;

      var first = items[0];
      var last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    /* A resize past the breakpoint leaves the overlay stranded otherwise. */
    window.addEventListener("resize", function () {
      if (menuIsOpen() && window.innerWidth > 860) closeMenu(false);
    });
  }

  /* ── Scroll reveal ────────────────────────────────────────────────── */

  var reducedMotion = window.matchMedia
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reducedMotion && "IntersectionObserver" in window) {
    var targets = [].slice.call(document.querySelectorAll("[data-reveal]"));

    /* Stagger siblings by 60ms, capped so long lists never crawl. */
    var counts = new WeakMap();
    targets.forEach(function (el) {
      var parent = el.parentNode;
      var index = counts.get(parent) || 0;
      counts.set(parent, index + 1);
      el.style.transitionDelay = Math.min(index, 5) * 60 + "ms";
      el.classList.add("js-reveal");
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });

    targets.forEach(function (el) { observer.observe(el); });
  }
})();
