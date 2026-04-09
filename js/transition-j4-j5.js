/* TRANSITION entre le jeu 4 et le jeu 5 */
(function () {
  "use strict";

  var etapes = [
    {
      name: "William Tell",
      sprite: "images/transitions/guillaume2.png",
      text: "I have to seek the baker’s aid, a loyal friend. He knoweth the finest ingredients, and shall bake it to perfection.",
    },
    {
      name: "William Tell",
      sprite: "images/transitions/guillaume3.png",
      text: "Go now to the bakery Gebele. There shall we finish the final pie.",
    },
  ];

  var screenEl = document.getElementById("trans-j4j5-screen");
  var textEl = document.getElementById("trans-j4j5-line");
  var nameEl = document.getElementById("trans-j4j5-name");
  var hintEl = document.getElementById("trans-j4j5-hint");
  var btnEl = document.getElementById("trans-j4j5-primary");
  var dialogueEl = document.getElementById("trans-j4j5-dialogue");
  var spriteEl = document.getElementById("trans-j4j5-sprite-img");

  if (!screenEl || !textEl || !nameEl || !btnEl || !dialogueEl) return;

  var index = 0;
  var isOpen = false;

  function render() {
    var derniereLigne = index >= etapes.length - 1;
    var etape = etapes[index];
    textEl.textContent = etape.text || etape.texte || "";
    nameEl.textContent = etape.name || etape.nom || "";
    btnEl.hidden = !derniereLigne;
    btnEl.textContent = "Continue to game 5";
    if (hintEl) hintEl.textContent = derniereLigne ? "" : "Press to continue";
    if (spriteEl) {
      spriteEl.classList.remove("is-placeholder");
      spriteEl.src = etape.sprite;
    }
  }

  function closeTransition() {
    isOpen = false;
    index = 0;
    screenEl.classList.add("is-hidden");
    document.body.classList.remove("vn-transition-active");
    document.dispatchEvent(new CustomEvent("plateforme402:transition-j4-j5-complete"));
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
    if (index < etapes.length - 1) {
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
  window.plateforme402.showTransitionJ4J5 = openTransition;

  document.addEventListener("plateforme402:request-transition-j4-j5", function () {
    openTransition();
  });

  document.addEventListener("plateforme402:menu-dismiss-overlays", function () {
    if (screenEl.classList.contains("is-hidden")) return;
    isOpen = false;
    index = 0;
    screenEl.classList.add("is-hidden");
  });
})();
