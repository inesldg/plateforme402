/* INTRODUCTION avec Guillaume Tell */
(function () {
  "use strict";

  var lignes = [
    "I am William Tell, a crossbowman of the mountains, and a man who loveth freedom. Long ago, I stood against tyrants. I would not bend the knee. My name yet liveth through the ages.",
    "By strange fate, I am drawn from mine own time. I come to tell thee my tale, full of trials and courage. Yet I also have a task for thee.",
    "Hear this: the bailiff Gessler, in his pride, setteth his hat on display when he is away. All folk must bow to it, as if he stood there. But I refuse such shame, and I would steal it from him.",
    "Take heed: go without delay to the steps of the church in the Place de la Réunion. There thy trial shall begin.",
  ];
  
  var sprites = [
    "images/transitions/guillaume2.png",
    "images/transitions/guillaume3.png",
  ];

  var screenEl = document.getElementById("intro-screen");
  var textEl = document.getElementById("intro-line");
  var hintEl = document.getElementById("intro-hint");
  var btnEl = document.getElementById("intro-primary");
  var dialogueEl = document.getElementById("intro-dialogue");
  var spriteEl = document.getElementById("intro-sprite-img");
  if (!screenEl || !textEl || !btnEl || !dialogueEl) return;

  var index = 0;

  function render() {
    var derniereLigne = index >= lignes.length - 1;
    textEl.textContent = lignes[index];
    btnEl.hidden = !derniereLigne;
    btnEl.textContent = "Start";
    if (hintEl) hintEl.textContent = derniereLigne ? "" : "Press to continue";
    if (spriteEl) {
      spriteEl.classList.remove("is-placeholder");
      spriteEl.src = sprites[index % sprites.length];
    }
  }

  function terminerIntro() {
    screenEl.classList.add("is-hidden");
    document.body.classList.remove("intro-active");
    document.dispatchEvent(new CustomEvent("plateforme402:intro-complete"));
  }

  function demarrerIntro() {
    index = 0;
    render();
    screenEl.classList.remove("is-hidden");
    document.body.classList.add("intro-active");
    screenEl.classList.add("intro-ready");
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
    terminerIntro();
  });

  if (spriteEl) {
    spriteEl.addEventListener("error", function () {
      spriteEl.classList.add("is-placeholder");
      spriteEl.removeAttribute("src");
      spriteEl.alt = "";
    });
  }

  document.addEventListener("plateforme402:request-intro", function () {
    demarrerIntro();
  });

  demarrerIntro();
})();
