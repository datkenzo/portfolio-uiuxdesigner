/* Design gallery carousel: previous / next buttons and arrow keys, wraps around at the ends. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll("[data-carousel]").forEach(function (root) {
    var track = root.querySelector(".carousel__track");
    var prev = root.querySelector("[data-prev]");
    var next = root.querySelector("[data-next]");
    if (!track || !prev || !next) return;

    function go(direction) {
      var atStart = track.scrollLeft <= 2;
      var atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
      var behavior = reduceMotion ? "auto" : "smooth";

      if (direction > 0 && atEnd) {
        track.scrollTo({ left: 0, behavior: behavior });
      } else if (direction < 0 && atStart) {
        track.scrollTo({ left: track.scrollWidth, behavior: behavior });
      } else {
        track.scrollBy({ left: direction * track.clientWidth, behavior: behavior });
      }
    }

    prev.addEventListener("click", function () { go(-1); });
    next.addEventListener("click", function () { go(1); });

    track.addEventListener("keydown", function (event) {
      if (event.key === "ArrowRight") { event.preventDefault(); go(1); }
      if (event.key === "ArrowLeft") { event.preventDefault(); go(-1); }
    });
  });
})();
