/* TRANSITION entre le jeu 2 et le jeu 3 */
(function () {
  "use strict";

  var etapes = [
    {
      name: "William Tell",
      sprite: "images/transitions/guillaume3.png",
      text: "At last, I had escaped the guards, those heavy fools in armor. My breath returned, and my heart still beat free.",
    },
    {
      name: "William Tell",
      sprite: "images/transitions/gessler.png",
      text: "Yet, at the turn of a street, the bailiff Gessler seized me without warning. The villain lay in wait for me.",
    },
    {
      name: "Bailiff Gessler",
      sprite: "images/transitions/gessler.png",
      text: "Ah! So there you are, crossbowman. Thou canst strike an apple upon thy son’s head… but canst thou make a pie worthy of its name?",
    },
    {
      name: "Bailiff Gessler",
      sprite: "images/transitions/gessler.png",
      text: "Here is thy trial: bring me a most divine apple pie for this evening’s feast. Make haste, for dessert draweth near. If it pleaseth me, thy freedom shall be granted.",
    },
    {
      name: "William Tell",
      sprite: "images/transitions/guillaume2.png",
      text: "So be it… I must gather apples without delay. I know where to find them. Go to the place I shall show thee, and stand beneath the fruits hanging from the lamp.",
    },
  ];

  var screenEl = document.getElementById("trans-j2j3-screen");
  var textEl = document.getElementById("trans-j2j3-line");
  var nameEl = document.getElementById("trans-j2j3-name");
  var hintEl = document.getElementById("trans-j2j3-hint");
  var btnEl = document.getElementById("trans-j2j3-primary");
  var dialogueEl = document.getElementById("trans-j2j3-dialogue");
  var spriteEl = document.getElementById("trans-j2j3-sprite-img");

  if (!screenEl || !textEl || !nameEl || !btnEl || !dialogueEl) return;

  var index = 0;
  var isOpen = false;

  function render() {
    var derniereLigne = index >= etapes.length - 1;
    var etape = etapes[index];
    textEl.textContent = etape.text || etape.texte || "";
    nameEl.textContent = etape.name || etape.nom || "";
    btnEl.hidden = !derniereLigne;
    btnEl.textContent = "Continue to game 3";
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
    document.dispatchEvent(new CustomEvent("plateforme402:transition-j2-j3-complete"));
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
  window.plateforme402.showTransitionJ2J3 = openTransition;

  document.addEventListener("plateforme402:request-transition-j2-j3", function () {
    openTransition();
  });

  document.addEventListener("plateforme402:menu-dismiss-overlays", function () {
    if (screenEl.classList.contains("is-hidden")) return;
    isOpen = false;
    index = 0;
    screenEl.classList.add("is-hidden");
  });
})();
