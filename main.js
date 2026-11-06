/* Kimball Hansen, site behaviour.
   Everything on the site works with this file absent: the tab bar is a set
   of in page anchor links, every panel shows stacked, accordions are native
   <details>, and filter chips stay hidden. The "js" class is set inline in <head>.
   Helpers: tabs · accordions · filter chips · reveal · copy · embeds · print. */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ── Tabs (WAI-ARIA tabs pattern with hash routing) ───────────────── */

  function initTabs() {
    var list = document.querySelector("[data-tablist]");
    if (!list) return;

    var tabs = Array.prototype.slice.call(list.querySelectorAll("a[href^='#']"));
    var panels = tabs.map(function (t) { return document.getElementById(t.hash.slice(1)); });
    var baseTitle = document.title.split(" | ").pop();
    var aliases = { work: "projects" };   // old links from the previous site
    var current = -1;

    list.setAttribute("role", "tablist");
    list.setAttribute("aria-label", "Sections");
    tabs.forEach(function (tab, i) {
      tab.parentNode.setAttribute("role", "presentation");
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", panels[i].id);
      panels[i].setAttribute("role", "tabpanel");
      panels[i].setAttribute("aria-labelledby", tab.id);
    });

    // Map any hash (a panel, or an element inside one) to a tab index.
    function indexFor(hash) {
      var id = (hash || "").replace(/^#/, "");
      id = aliases[id] || id;
      var el = id && document.getElementById(id);
      for (var i = 0; i < panels.length; i++) {
        if (el && (el === panels[i] || panels[i].contains(el))) return i;
      }
      return -1;
    }

    function select(i, opts) {
      opts = opts || {};
      if (i < 0) i = 0;
      tabs.forEach(function (tab, j) {
        var on = j === i;
        tab.setAttribute("aria-selected", on ? "true" : "false");
        tab.setAttribute("tabindex", on ? "0" : "-1");
        panels[j].hidden = !on;
      });
      if (i !== current && current !== -1 && !reduceMotion.matches) {
        panels[i].classList.remove("is-entering");
        void panels[i].offsetWidth;          // restart the cross fade
        panels[i].classList.add("is-entering");
      }
      current = i;
      document.title = tabs[i].getAttribute("data-title") + " | " + baseTitle;

      // If the reader had scrolled down into the old panel, bring them back
      // to the top of the new one (scroll-padding keeps it below the bars).
      if (opts.scroll) {
        var anchor = document.querySelector("[data-panels-top]");
        if (anchor && (opts.scroll === "always" || anchor.getBoundingClientRect().top < 0)) {
          anchor.scrollIntoView({ block: "start", behavior: reduceMotion.matches ? "auto" : "smooth" });
        }
      }
      if (opts.focusHeading) {
        var h = panels[i].querySelector("[data-panel-heading]") || panels[i];
        h.focus({ preventScroll: true });
      }
    }

    function go(i, opts) {
      var hash = "#" + panels[i].id;
      if (location.hash !== hash) history.pushState(null, "", hash);
      select(i, opts);
    }

    list.addEventListener("click", function (e) {
      var tab = e.target.closest("[role='tab']");
      if (!tab) return;
      e.preventDefault();
      go(tabs.indexOf(tab), { scroll: true, focusHeading: true });
    });

    list.addEventListener("keydown", function (e) {
      var i = tabs.indexOf(document.activeElement);
      if (i === -1) return;
      var next = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1,
                   Home: 0, End: tabs.length - 1 }[e.key];
      if (next === undefined) return;
      e.preventDefault();
      next = (next + tabs.length) % tabs.length;
      tabs[next].focus();
      go(next, { scroll: true });
    });

    // Back and forward buttons, and links elsewhere on the page to #panel.
    window.addEventListener("popstate", function () { select(indexFor(location.hash)); });
    window.addEventListener("hashchange", function () {
      var i = indexFor(location.hash);
      if (i !== -1) select(i, { scroll: "always", focusHeading: true });
    });

    var start = indexFor(location.hash);
    select(start);
    // A link to a panel opens at the top; a link inside one scrolls to it. Re-run
    // at load (the browser's own hash jump can land late) unless the reader scrolled.
    var target = start !== -1 && document.getElementById(location.hash.slice(1));
    var toTop = !target || target === panels[start];
    var moved = false;
    ["wheel", "touchstart", "keydown"].forEach(function (ev) {
      window.addEventListener(ev, function () { moved = true; }, { once: true, passive: true });
    });
    function settle() {
      if (!moved) { if (toTop) window.scrollTo(0, 0); else target.scrollIntoView(); }
    }
    settle();
    window.addEventListener("load", settle, { once: true });
  }

  /* ── Accordions: expand or collapse every <details> in a group ────── */

  function initAccordions() {
    document.querySelectorAll("[data-acc-toggle]").forEach(function (btn) {
      var group = document.getElementById(btn.getAttribute("data-acc-toggle"));
      if (!group) return;
      btn.hidden = false;
      btn.addEventListener("click", function () {
        var items = group.querySelectorAll("details");
        var open = btn.getAttribute("aria-expanded") !== "true";
        items.forEach(function (d) { d.open = open; });
        btn.setAttribute("aria-expanded", String(open));
        btn.textContent = open ? "Collapse all" : "Expand all";
      });
    });
  }

  /* ── Filter chips: buttons with data-filter over items with data-tags ── */

  function initFilters() {
    document.querySelectorAll("[data-filter-group]").forEach(function (group) {
      var target = document.getElementById(group.getAttribute("data-filter-group"));
      var status = document.getElementById(group.getAttribute("data-filter-status"));
      if (!target) return;
      var items = target.querySelectorAll("[data-filter-item]");
      var chips = group.querySelectorAll("[data-filter]");

      group.addEventListener("click", function (e) {
        var chip = e.target.closest("[data-filter]");
        if (!chip) return;
        var tag = chip.getAttribute("data-filter");
        var shown = 0;
        chips.forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
        items.forEach(function (item) {
          var tags = " " + item.getAttribute("data-tags") + " ";
          var match = tag === "all" || tags.indexOf(" " + tag + " ") !== -1;
          item.hidden = !match;
          if (match) shown++;
        });
        // Hide a group heading when the filter leaves its group empty.
        target.querySelectorAll("[data-filter-section]").forEach(function (sec) {
          sec.hidden = !sec.querySelector("[data-filter-item]:not([hidden])");
        });
        if (status) status.textContent = "Showing " + shown + " of " + items.length;
      });
    });
  }

  /* ── Click to reveal contact details ──────────────────────────────── */
  /* Values ship reversed in data-r so plain text scrapers miss them. */

  function initReveal() {
    document.querySelectorAll("[data-reveal]").forEach(function (btn) {
      btn.hidden = false;
      btn.addEventListener("click", function () {
        var value = btn.getAttribute("data-r").split("").reverse().join("");
        var kind = btn.getAttribute("data-reveal");
        var link = document.createElement("a");
        link.textContent = value;
        link.href = kind === "tel" ? "tel:+1" + value.replace(/\D/g, "") : "mailto:" + value;
        var slot = document.getElementById(btn.getAttribute("aria-controls"));
        slot.textContent = "";
        slot.appendChild(link);
        var copy = document.querySelector("[data-copy-for='" + slot.id + "']");
        if (copy) { copy.setAttribute("data-copy", value); copy.hidden = false; }
        btn.remove();
        link.focus();
      });
    });
  }

  /* ── Copy to clipboard ────────────────────────────────────────────── */

  function initCopy() {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-copy]");
      if (!btn || !navigator.clipboard) return;
      var status = document.getElementById(btn.getAttribute("data-copy-status"));
      navigator.clipboard.writeText(btn.getAttribute("data-copy")).then(function () {
        if (status) status.textContent = "Copied to clipboard.";
      }, function () {
        if (status) status.textContent = "Copy failed. Select the text instead.";
      });
    });
  }

  /* ── Click to load embeds (live tool iframe, inline PDF) ──────────── */
  /* Nothing loads until asked; without JS the plain links stay. */

  function initEmbeds() {
    document.querySelectorAll("[data-embed]").forEach(function (btn) {
      btn.hidden = false;
      btn.addEventListener("click", function () {
        var slot = document.getElementById(btn.getAttribute("aria-controls"));
        var pdf = btn.getAttribute("data-embed") === "pdf";
        var el = document.createElement(pdf ? "object" : "iframe");
        if (pdf) { el.type = "application/pdf"; el.data = btn.getAttribute("data-src"); }
        else {
          el.src = btn.getAttribute("data-src");
          el.setAttribute("sandbox", "allow-scripts allow-forms allow-same-origin allow-popups allow-downloads");
          el.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
        }
        el.title = btn.getAttribute("data-title");
        el.className = "embed__frame";
        slot.textContent = "";
        slot.appendChild(el); el.focus();
      });
    });
  }

  /* ── Print: open every accordion so nothing is cut off ────────────── */

  function initPrint() {
    var closed = [];
    window.addEventListener("beforeprint", function () {
      closed = Array.prototype.filter.call(document.querySelectorAll("details"), function (d) { return !d.open; });
      closed.forEach(function (d) { d.open = true; });
    });
    window.addEventListener("afterprint", function () {
      closed.forEach(function (d) { d.open = false; });
    });
  }

  [initTabs, initAccordions, initFilters, initReveal, initCopy, initEmbeds, initPrint].forEach(function (f) { f(); });
})();
