/* Plays the scribble behind the statement text only while the band is on screen. */
(function () {
  "use strict";

  var scribble = document.querySelector(".scribble");
  if (!scribble) return;

  if (!("IntersectionObserver" in window)) {
    scribble.classList.add("is-playing");
    return;
  }

  new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      scribble.classList.toggle("is-playing", entry.isIntersecting);
    });
  }, { threshold: 0.25 }).observe(scribble.parentElement);
})();
