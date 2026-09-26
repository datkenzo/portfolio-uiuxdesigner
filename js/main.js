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

/* "Work" dropdown in the header.
   Mouse: opens on hover, closes shortly after the pointer leaves.
   Touch and keyboard: the Work button toggles it; a tap or click anywhere outside
   the dropdown closes it, and so does Escape. */
(function () {
  "use strict";

  var hoverDevice = window.matchMedia("(hover: hover) and (pointer: fine)");
  var compactMenu = window.matchMedia("(max-width: 719px)");

  Array.prototype.forEach.call(document.querySelectorAll("[data-dropdown]"), function (item) {
    var trigger = item.querySelector(".nav__trigger");
    if (!trigger) return;
    var closeTimer = null;

    function isOpen() { return item.classList.contains("is-open"); }
    function setOpen(open) {
      window.clearTimeout(closeTimer);
      item.classList.toggle("is-open", open);
      trigger.setAttribute("aria-expanded", String(open));
    }
    // Hover only drives the floating dropdown; inside the phone menu it is tap-only.
    function hoverMode() { return hoverDevice.matches && !compactMenu.matches; }

    trigger.addEventListener("click", function (event) {
      // A mouse click after hovering keeps it open instead of flicking it shut.
      if (hoverMode() && event.detail > 0) { setOpen(true); return; }
      setOpen(!isOpen());
    });

    item.addEventListener("mouseenter", function () { if (hoverMode()) setOpen(true); });
    item.addEventListener("mouseleave", function () {
      if (!hoverMode()) return;
      window.clearTimeout(closeTimer);
      closeTimer = window.setTimeout(function () { setOpen(false); }, 150);
    });

    document.addEventListener("click", function (event) {
      if (isOpen() && !item.contains(event.target)) setOpen(false);
    });

    item.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && isOpen()) {
        event.stopPropagation();          // close just the dropdown, not the whole phone menu
        setOpen(false);
        trigger.focus();
      }
    });

    item.addEventListener("focusout", function (event) {
      if (event.relatedTarget && !item.contains(event.relatedTarget)) setOpen(false);
    });
  });
})();
