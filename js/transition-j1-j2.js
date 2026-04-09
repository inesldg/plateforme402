/* TRANSITION entre le jeu 1 et le jeu 2 */
(function () {
  "use strict";

  var sprites = [
    "images/transitions/guillaume2.png",
    "images/transitions/guillaume3.png",
    "images/transitions/guillaume_peur.png",
  ];

  var lignes = [
    "Well done, brave ally! You have stolen the hat of that tyrant Gessler. I knew your courage would not fail.",
    "You may now turn back. Turn around, and walk straight ahead for a few steps, until...",
    "By Saint William’s beard! The guards are here, those rogues! Flee at once, or you shall be caught like a hare at the fair!",
  ];

  var screenEl = document.getElementById("trans-j1j2-screen");
  var textEl = document.getElementById("trans-j1j2-line");
  var hintEl = document.getElementById("trans-j1j2-hint");
  var btnEl = document.getElementById("trans-j1j2-primary");
  var dialogueEl = document.getElementById("trans-j1j2-dialogue");
  var spriteEl = document.getElementById("trans-j1j2-sprite-img");
  if (!screenEl || !textEl || !btnEl || !dialogueEl) return;

  var index = 0;
  var isOpen = false;

  function render() {
    var derniereLigne = index >= lignes.length - 1;
    textEl.textContent = lignes[index];
    btnEl.hidden = !derniereLigne;
    btnEl.textContent = "Continue to game 2";
    if (hintEl) hintEl.textContent = derniereLigne ? "" : "Press to continue";
    if (spriteEl) {
      spriteEl.classList.remove("is-placeholder");
      spriteEl.src = sprites[index % sprites.length];
    }
  }

  function closeTransition() {
    isOpen = false;
    index = 0;
    screenEl.classList.add("is-hidden");
    document.body.classList.remove("vn-transition-active");
    document.dispatchEvent(new CustomEvent("plateforme402:transition-j1-j2-complete"));
  }

  function openTransition() {
    isOpen = true;
    index = 0;
    screenEl.classList.remove("intro-ready");
    screenEl.classList.remove("is-hidden");
    document.body.classList.add("vn-transition-active");
    render();
    requestAnimationFrame(function () {
      screenEl.classList.add("intro-ready");
    });
  }

  dialogueEl.addEventListener("click", function (e) {
    if (e.target.closest(".intro-btn")) return;
    if (index < lignes.length - 1) {
      index += 1;
      render();
    }
  });

  btnEl.addEventListener("click", function (e) {
    e.stopPropagation();
    closeTransition();
  });

  if (spriteEl) {
    spriteEl.addEventListener("error", function () {
      spriteEl.classList.add("is-placeholder");
      spriteEl.removeAttribute("src");
      spriteEl.alt = "";
    });
  }

  window.plateforme402 = window.plateforme402 || {};
  window.plateforme402.showTransitionJ1J2 = openTransition;

  document.addEventListener("plateforme402:request-transition-j1-j2", function () {
    openTransition();
  });

  document.addEventListener("plateforme402:menu-dismiss-overlays", function () {
    if (screenEl.classList.contains("is-hidden")) return;
    isOpen = false;
    index = 0;
    screenEl.classList.add("is-hidden");
  });
})();
