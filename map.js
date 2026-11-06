/* Kimball Hansen, interactive US map on the About tab.
   Without this file the map still renders, each state keeps its native
   <title> tooltip, and the SVG description carries the same information.
   With it: hover, tap, or focus a state for its name and status; arrow keys
   move between states (one tab stop for the whole map); markers show the
   place name. */

(function () {
  "use strict";

  var map = document.querySelector("[data-usmap]");
  if (!map) return;

  var svg = map.querySelector("svg");
  var tip = map.querySelector(".tip");
  var states = Array.prototype.slice.call(map.querySelectorAll(".usmap__state"));
  var markers = Array.prototype.slice.call(map.querySelectorAll(".usmap__marker"));
  var active = null;

  // A copy of the active state's outline drawn on top of every other state,
  // so the hover and focus highlight is never hidden under a neighbor.
  var NS = "http://www.w3.org/2000/svg";
  var outline = document.createElementNS(NS, "path");
  outline.setAttribute("class", "usmap__outline");
  outline.setAttribute("aria-hidden", "true");
  svg.appendChild(outline);

  // Each state becomes its own labelled image inside a group, so a screen
  // reader announces it on focus. The native <title> is removed so it does
  // not show a second tooltip on hover.
  svg.setAttribute("role", "group");
  states.forEach(function (s, i) {
    var t = s.querySelector("title");
    if (t) s.removeChild(t);
    s.setAttribute("role", "img");
    s.setAttribute("aria-label", s.getAttribute("data-name") + ", " + s.getAttribute("data-status").toLowerCase());
    s.setAttribute("tabindex", i === 0 ? "0" : "-1");
  });

  function place(x, y) {
    var box = map.getBoundingClientRect();
    tip.hidden = false;
    var w = tip.offsetWidth, h = tip.offsetHeight;
    var left = Math.max(0, Math.min(x - box.left - w / 2, box.width - w));
    var top = y - box.top - h - 14;
    if (top < 0) top = y - box.top + 18;          // no room above: show below
    tip.style.left = left + "px";
    tip.style.top = top + "px";
  }

  function show(el, html, x, y) {
    if (active && active !== el) hide();
    active = el;
    el.classList.add("is-active");
    if (el.tagName === "BUTTON") el.setAttribute("aria-expanded", "true");
    else outline.setAttribute("d", el.getAttribute("d"));
    tip.innerHTML = html;
    if (x === undefined) {
      var r = el.getBoundingClientRect();
      x = r.left + r.width / 2;
      y = r.top + r.height / 2;
    }
    place(x, y);
  }

  function hide() {
    if (active) {
      active.classList.remove("is-active");
      if (active.tagName === "BUTTON") active.setAttribute("aria-expanded", "false");
    }
    active = null;
    tip.hidden = true;
    outline.removeAttribute("d");
  }

  function stateHtml(s) {
    return "<strong>" + s.getAttribute("data-name") + "</strong>" + s.getAttribute("data-status");
  }

  // Markers show the place name only.
  function cardHtml(m) {
    return "<strong>" + m.getAttribute("data-name") + "</strong>" +
      (m.classList.contains("usmap__marker--home") ? "Hometown" : "Lived here");
  }

  /* States: pointer (mouse and touch) */
  states.forEach(function (s) {
    s.addEventListener("pointermove", function (e) { show(s, stateHtml(s), e.clientX, e.clientY); });
    s.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") hide(); });
    s.addEventListener("focus", function () { show(s, stateHtml(s)); });
    s.addEventListener("blur", hide);
  });

  /* States: keyboard, with a roving tabindex in alphabetical order */
  svg.addEventListener("keydown", function (e) {
    var i = states.indexOf(document.activeElement);
    if (i === -1) return;
    var next = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1,
                 Home: 0, End: states.length - 1 }[e.key];
    if (e.key === "Escape") { hide(); return; }
    if (next === undefined) return;
    e.preventDefault();
    next = (next + states.length) % states.length;
    states[i].setAttribute("tabindex", "-1");
    states[next].setAttribute("tabindex", "0");
    states[next].focus();
  });

  /* Markers: hover or focus shows the card; click or tap toggles it */
  markers.forEach(function (m) {
    m.setAttribute("aria-expanded", "false");
    m.addEventListener("mouseenter", function () { show(m, cardHtml(m)); });
    m.addEventListener("mouseleave", function () { if (document.activeElement !== m) hide(); });
    m.addEventListener("focus", function () { show(m, cardHtml(m)); });
    m.addEventListener("blur", hide);
    m.addEventListener("click", function () {
      if (active === m && !tip.hidden && document.activeElement !== m) hide();
      else show(m, cardHtml(m));
    });
  });

  // Tap anywhere off the map, or press Escape, to close the tooltip.
  document.addEventListener("pointerdown", function (e) { if (!map.contains(e.target)) hide(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") hide(); });
  window.addEventListener("resize", hide);
})();
