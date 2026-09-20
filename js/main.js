/* Mobile navigation: toggle, close on Escape / outside click / link tap / resize. */
(function () {
  "use strict";

  var toggle = document.querySelector(".nav__toggle");
  var menu = document.getElementById("nav-menu");
  if (!toggle || !menu) return;

  var mobileQuery = window.matchMedia("(max-width: 719px)");

  function setOpen(open) {
    menu.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  toggle.addEventListener("click", function () {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && menu.classList.contains("is-open")) {
      setOpen(false);
      toggle.focus();
    }
  });

  document.addEventListener("click", function (event) {
    if (!menu.classList.contains("is-open")) return;
    if (menu.contains(event.target) || toggle.contains(event.target)) return;
    setOpen(false);
  });

  menu.addEventListener("click", function (event) {
    if (event.target.closest("a")) setOpen(false);
  });

  // Leaving the mobile breakpoint resets the menu so desktop nav is never stuck closed.
  function onBreakpointChange(event) {
    if (!event.matches) setOpen(false);
  }
  if (mobileQuery.addEventListener) {
    mobileQuery.addEventListener("change", onBreakpointChange);
  } else if (mobileQuery.addListener) {
    mobileQuery.addListener(onBreakpointChange);
  }
})();
