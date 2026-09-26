/* "Along My Journey" accordion on the homepage.
   One panel is open at a time (Aviron by default, set in the HTML with .is-open).
   Clicking a date strip opens that panel; the CSS animates the change.
   Arrow keys, Home and End move between the date strips.
   On phones and tablets the panels stack vertically; while a panel opens, the page
   is nudged so the strip you tapped stays where your finger was. */
(function () {
  "use strict";

  var root = document.querySelector("[data-journey]");
  if (!root) return;

  var panels = Array.prototype.slice.call(root.querySelectorAll("[data-panel]"));
  if (!panels.length) return;

  var vertical = window.matchMedia("(max-width: 899px)");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function tabOf(panel) { return panel.querySelector(".jp__tab"); }
  function bodyOf(panel) { return panel.querySelector(".jp__body"); }

  function setOpen(target) {
    panels.forEach(function (panel) {
      var on = panel === target;
      panel.classList.toggle("is-open", on);
      tabOf(panel).setAttribute("aria-expanded", String(on));
      // Collapsed content is out of view, so keep it out of the tab order and screen readers too.
      if (on) bodyOf(panel).removeAttribute("inert");
      else bodyOf(panel).setAttribute("inert", "");
    });
  }

  // Keep the tapped strip in place while panels above it collapse (vertical layout only).
  function holdInPlace(tab, duration) {
    var startTop = tab.getBoundingClientRect().top;
    var until = performance.now() + duration;

    function step(now) {
      var drift = tab.getBoundingClientRect().top - startTop;
      if (Math.abs(drift) > 0.5) window.scrollBy(0, drift);
      if (now < until) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }

  function open(panel) {
    if (panel.classList.contains("is-open")) return;
    var tab = tabOf(panel);
    if (vertical.matches && !reduceMotion.matches) holdInPlace(tab, 750);
    setOpen(panel);
  }

  panels.forEach(function (panel, index) {
    var tab = tabOf(panel);

    tab.addEventListener("click", function () { open(panel); });

    tab.addEventListener("keydown", function (event) {
      var next = null;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") next = panels[(index + 1) % panels.length];
      else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = panels[(index - 1 + panels.length) % panels.length];
      else if (event.key === "Home") next = panels[0];
      else if (event.key === "End") next = panels[panels.length - 1];
      if (!next) return;
      event.preventDefault();
      tabOf(next).focus();
    });
  });

  setOpen(root.querySelector("[data-panel].is-open") || panels[0]);
})();
