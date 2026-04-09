/* CINEMATIQUE FINALE */
(function () {
  "use strict";

  var etapes = [
    {
      name: "William Tell",
      sprite: "images/transitions/guillaume_tarte.png",
      text: "There… this should suffice. May this pie please that tyrant Gessler, and calm his wrath.",
      phase: "finale-screen--guillaume-tarte",
    },
    {
      name: "Bailiff Gessler",
      sprite: "images/transitions/gessler.png",
      text: "...",
      transitionNoire: true,
    },
    {
      name: "Bailiff Gessler",
      sprite: "images/transitions/gessler_heureux.png",
      text: "By all the saints in heaven! This dish is most divine! ’Tis so sweet that mine eyes fill with tears!",
      phase: "finale-screen--gessler-joy",
    },
    {
      name: "William Tell",
      sprite: "images/transitions/guillaume_heureux.png",
      text: "You have triumphed, brave companion! By thy aid, I have saved my life. Take my thanks, O bravest of the brave!",
      phase: "finale-screen--guillaume-joy",
    },
  ];

  var screenEl = document.getElementById("finale-screen");
  var textEl = document.getElementById("finale-line");
  var nameEl = document.getElementById("finale-name");
  var hintEl = document.getElementById("finale-hint");
  var btnEl = document.getElementById("finale-primary");
  var dialogueEl = document.getElementById("finale-dialogue");
  var spriteEl = document.getElementById("finale-sprite-img");
  var fadeEl = document.getElementById("finale-fade");

  if (!screenEl || !textEl || !nameEl || !btnEl || !dialogueEl) return;

  var index = 0;
  var isOpen = false;
  var isTransitioning = false;

  function clearPhaseClasses() {
    screenEl.classList.remove("finale-screen--gessler-joy");
    screenEl.classList.remove("finale-screen--guillaume-joy");
    screenEl.classList.remove("finale-screen--guillaume-tarte");
  }

  function render() {
    var derniereLigne = index >= etapes.length - 1;
    var etape = etapes[index];
    clearPhaseClasses();
    if (etape.phase) screenEl.classList.add(etape.phase);
    nameEl.textContent = etape.name || etape.nom || "";
    textEl.textContent = etape.text || etape.texte || "";
    /* Fin sur la dernière réplique : pas de bouton qui ferme la scène */
    btnEl.hidden = true;
    if (hintEl) hintEl.textContent = derniereLigne ? "" : "Press to continue";
    if (spriteEl) {
      spriteEl.classList.remove("is-placeholder");
      spriteEl.src = etape.sprite;
    }
  }

  function transitionNoire(done) {
    if (!fadeEl) {
      done();
      return;
    }

    isTransitioning = true;
    fadeEl.classList.add("is-active");

    setTimeout(function () {
      done();
      requestAnimationFrame(function () {
        fadeEl.classList.remove("is-active");
        setTimeout(function () {
          isTransitioning = false;
        }, 420);
      });
    }, 520);
  }

  function advance() {
    if (isTransitioning || index >= etapes.length - 1) return;
    var etape = etapes[index];
    var next = index + 1;
    if (etape.transitionNoire) {
      transitionNoire(function () {
        index = next;
        render();
      });
      return;
    }
    index = next;
    render();
  }

  function closeFinale() {
    isOpen = false;
    index = 0;
    isTransitioning = false;
    clearPhaseClasses();
    if (fadeEl) {
      fadeEl.classList.remove("is-active");
    }
    screenEl.classList.add("is-hidden");
    document.body.classList.remove("vn-transition-active");
    document.dispatchEvent(new CustomEvent("plateforme402:finale-complete"));
  }

  function openFinale() {
    isOpen = true;
    index = 0;
    isTransitioning = false;
    clearPhaseClasses();
    if (fadeEl) {
      fadeEl.classList.remove("is-active");
    }
    screenEl.classList.remove("intro-ready");
    screenEl.classList.remove("is-hidden");
    document.body.classList.add("vn-transition-active");
    render();
    requestAnimationFrame(function () {
      screenEl.classList.add("intro-ready");
    });
  }

  dialogueEl.addEventListener("click", function (e) {
    if (e.target.closest(".intro-btn")) {
      return;
    }
    advance();
  });

  btnEl.addEventListener("click", function (e) {
    e.stopPropagation();
    closeFinale();
  });

  if (spriteEl) {
    spriteEl.addEventListener("error", function () {
      spriteEl.classList.add("is-placeholder");
      spriteEl.removeAttribute("src");
      spriteEl.alt = "";
    });
  }

  window.plateforme402 = window.plateforme402 || {};
  window.plateforme402.showFinale = openFinale;

  document.addEventListener("plateforme402:request-finale", function () {
    openFinale();
  });

  document.addEventListener("plateforme402:menu-dismiss-overlays", function () {
    if (screenEl.classList.contains("is-hidden")) return;
    isOpen = false;
    index = 0;
    isTransitioning = false;
    clearPhaseClasses();
    if (fadeEl) {
      fadeEl.classList.remove("is-active");
    }
    screenEl.classList.add("is-hidden");
  });
})();
