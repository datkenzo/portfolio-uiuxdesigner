/* On-page navigation (Notion-style).
   A slim rail of bars sits at the edge of the screen, one bar per <h2>. Hovering it
   (or tapping / pressing Enter on touch and keyboard) opens a list of the sections.
   The bar for the section being read stays highlighted. Built from the page's own
   headings, so there is nothing to maintain. Pages with fewer than 3 sections skip it. */
(function () {
  "use strict";

  var main = document.getElementById("main");
  if (!main) return;

  // The closing "Still scrolling?" block is shared by every page, not part of a case study.
  var headings = Array.prototype.filter.call(main.querySelectorAll("h2"), function (h) {
    return !h.closest(".connect") && h.textContent.trim() !== "";
  });
  if (headings.length < 3) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var hoverCapable = window.matchMedia("(hover: hover) and (pointer: fine)");

  /* ---- make sure every heading has a unique id to link to ---- */
  var used = {};
  Array.prototype.forEach.call(document.querySelectorAll("[id]"), function (el) { used[el.id] = true; });

  function slug(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "section";
  }
  function label(h) { return h.textContent.replace(/\s+/g, " ").trim(); }

  headings.forEach(function (h) {
    if (h.id) return;
    var base = "toc-" + slug(label(h));
    var id = base;
    var n = 2;
    while (used[id]) { id = base + "-" + n; n += 1; }
    h.id = id;
    used[id] = true;
  });

  /* ---- build the markup ---- */
  function el(tag, className, attrs) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (attrs) Object.keys(attrs).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    return node;
  }

  var nav = el("nav", "toc", { "aria-label": "On this page" });
  var rail = el("button", "toc__rail", {
    type: "button",
    "aria-expanded": "false",
    "aria-controls": "toc-list",
    "aria-label": "Page sections"
  });
  var bars = el("span", "toc__bars", { "aria-hidden": "true" });
  var icon = el("span", "toc__icon", { "aria-hidden": "true" });
  icon.appendChild(el("i"));
  icon.appendChild(el("i"));
  icon.appendChild(el("i"));
  rail.appendChild(bars);
  rail.appendChild(icon);

  var popover = el("div", "toc__popover");
  var list = el("ul", "toc__list", { id: "toc-list" });
  var barEls = [];
  var linkEls = [];

  headings.forEach(function (h) {
    barEls.push(bars.appendChild(el("i")));
    var li = el("li");
    var a = el("a", "toc__link", { href: "#" + h.id });
    a.textContent = label(h);
    li.appendChild(a);
    list.appendChild(li);
    linkEls.push(a);
  });

  popover.appendChild(list);
  nav.appendChild(rail);
  nav.appendChild(popover);
  document.body.appendChild(nav);

  /* ---- open / close ---- */
  var closeTimer = null;

  function isOpen() { return nav.classList.contains("is-open"); }

  function open() {
    window.clearTimeout(closeTimer);
    nav.classList.add("is-open");
    rail.setAttribute("aria-expanded", "true");
    centerActiveLink();
  }

  function close() {
    window.clearTimeout(closeTimer);
    nav.classList.remove("is-open");
    rail.setAttribute("aria-expanded", "false");
  }

  rail.addEventListener("click", function (event) {
    // With a mouse the hover already opened it, so a click keeps it open instead of flicking it shut.
    if (hoverCapable.matches && event.detail > 0) { open(); return; }
    if (isOpen()) close(); else open();
  });

  nav.addEventListener("mouseenter", function () {
    if (hoverCapable.matches) open();
  });
  nav.addEventListener("mouseleave", function () {
    if (!hoverCapable.matches) return;
    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(close, 180);
  });

  nav.addEventListener("focusout", function (event) {
    if (event.relatedTarget && !nav.contains(event.relatedTarget)) close();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && isOpen()) {
      close();
      rail.focus();
    }
  });

  document.addEventListener("click", function (event) {
    if (isOpen() && !nav.contains(event.target)) close();
  });

  /* ---- jump to a section ---- */
  linkEls.forEach(function (a, i) {
    a.addEventListener("click", function (event) {
      event.preventDefault();
      headings[i].scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, "", "#" + headings[i].id);
      }
      if (!hoverCapable.matches) close();
    });
  });

  /* ---- highlight the section being read ---- */
  var current = -1;

  function centerActiveLink() {
    if (current < 0 || !isOpen()) return;
    var a = linkEls[current];
    list.scrollTop = a.offsetTop - (list.clientHeight - a.offsetHeight) / 2;
  }

  function update() {
    var line = window.innerHeight * 0.3;
    var index = 0;
    for (var i = 0; i < headings.length; i += 1) {
      if (headings[i].getBoundingClientRect().top <= line) index = i; else break;
    }
    if (index === current) return;
    current = index;
    barEls.forEach(function (b, i) { b.classList.toggle("is-active", i === index); });
    linkEls.forEach(function (a, i) {
      a.classList.toggle("is-active", i === index);
      if (i === index) a.setAttribute("aria-current", "location"); else a.removeAttribute("aria-current");
    });
    centerActiveLink();
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { ticking = false; update(); });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
})();
