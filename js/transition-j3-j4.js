/* TRANSITION eentre le jeu 3 et le jeu 4 */
(function () {
  "use strict";

 var etapes = [
  {
    name: "William Tell",
    sprite: "images/transitions/guillaume2.png",
    text: "I must yet cut these apples… and swiftly, if I would save my life. Time presseth, and I am given no rest.",
  },
  {
    name: "William Tell",
    sprite: "images/transitions/guillaume3.png",
    text: "I shall seek the aid of the Teutonic knights. These men can cut true and fast, as none other in this world.",
  },
  {
    name: "William Tell",
    sprite: "images/transitions/guillaume3.png",
    text: "Go to their tavern. There shall thy next trial begin.",
  },
];

  var screenEl = document.getElementById("trans-j3j4-screen");
  var textEl = document.getElementById("trans-j3j4-line");
  var nameEl = document.getElementById("trans-j3j4-name");
  var hintEl = document.getElementById("trans-j3j4-hint");
  var btnEl = document.getElementById("trans-j3j4-primary");
  var dialogueEl = document.getElementById("trans-j3j4-dialogue");
  var spriteEl = document.getElementById("trans-j3j4-sprite-img");

  if (!screenEl || !textEl || !nameEl || !btnEl || !dialogueEl) return;

  var index = 0;
  var isOpen = false;

  function render() {
    var derniereLigne = index >= etapes.length - 1;
    var etape = etapes[index];
    textEl.textContent = etape.text || etape.texte || "";
    nameEl.textContent = etape.name || etape.nom || "";
    btnEl.hidden = !derniereLigne;
    btnEl.textContent = "Continue to game 4";
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
    document.dispatchEvent(new CustomEvent("plateforme402:transition-j3-j4-complete"));
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
  window.plateforme402.showTransitionJ3J4 = openTransition;

  document.addEventListener("plateforme402:request-transition-j3-j4", function () {
    openTransition();
  });

  document.addEventListener("plateforme402:menu-dismiss-overlays", function () {
    if (screenEl.classList.contains("is-hidden")) return;
    isOpen = false;
    index = 0;
    screenEl.classList.add("is-hidden");
  });
})();
