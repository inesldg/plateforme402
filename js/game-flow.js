(function () {
  "use strict";

  // Zone principale où on injecte les jeux
  var mainApp = document.getElementById("main-app");
  var mainInner = mainApp ? mainApp.querySelector(".main-inner") : null;
  if (!mainApp || !mainInner) return;

  // Zone qui affiche soit le jeu 3 (iframe), soit un jeu "placeholder"
  var gameRoot = document.createElement("section");
  gameRoot.id = "game-host-root";
  gameRoot.className = "game-3-root";
  gameRoot.hidden = true;

  var frame = document.createElement("iframe");
  frame.id = "game-3-frame";
  frame.className = "game-3-frame";
  frame.hidden = true;
  frame.title = "Jeu 3";
  frame.loading = "eager";
  frame.setAttribute("allow", "microphone; accelerometer; gyroscope");

  var placeholder = document.createElement("div");
  placeholder.className = "game-placeholder";
  placeholder.hidden = true;
  placeholder.innerHTML =
    '<h2 id="game-placeholder-title" class="game-placeholder__title"></h2>' +
    '<p class="game-placeholder__text">Version simple : ce jeu est en mode test.</p>' +
    '<button type="button" id="game-placeholder-finish" class="main-inner__btn">Terminer ce jeu</button>';

  gameRoot.appendChild(frame);
  gameRoot.appendChild(placeholder);
  mainApp.appendChild(gameRoot);

  var titrePlaceholder = placeholder.querySelector("#game-placeholder-title");
  var boutonFinPlaceholder = placeholder.querySelector("#game-placeholder-finish");

  // jeuActif = numéro du jeu actuellement lancé
  var jeuActif = null;
  // Utilisé quand on choisit un jeu via menu + transition (2 à 5)
  var jeuDirectAttendu = null;

  // Raccourci pour envoyer un événement custom
  function envoyer(type, detail) {
    document.dispatchEvent(
      new CustomEvent(type, {
        detail: detail || {},
      })
    );
  }

  // Cache toute la zone de jeu
  function cacherZoneJeu() {
    gameRoot.hidden = true;
    mainInner.classList.remove("is-game3-hidden");
    document.body.classList.remove("game-host-active");
    frame.hidden = true;
    placeholder.hidden = true;
    frame.removeAttribute("src");
  }

  // Affiche la zone de jeu
  function afficherZoneJeu() {
    gameRoot.hidden = false;
    mainInner.classList.add("is-game3-hidden");
    document.body.classList.add("game-host-active");
  }

  // Fallback si un numéro de jeu non géré
  function lancerJeuSimple(numeroJeu) {
    afficherZoneJeu();
    frame.hidden = true;
    placeholder.hidden = false;
    if (titrePlaceholder) {
      titrePlaceholder.textContent = "Jeu " + numeroJeu;
    }
  }

  // Jeux intégrés en iframe (2 à 5)
  function lancerJeuIframe(numeroJeu, source) {
    afficherZoneJeu();
    placeholder.hidden = true;
    frame.hidden = false;
    frame.title = "Jeu " + numeroJeu;
    frame.src = source;
  }

  // Démarre un jeu selon son numéro
  function lancerJeu(numeroJeu) {
    jeuActif = numeroJeu;
    envoyer("plateforme402:game-start", { game: numeroJeu });

    if (numeroJeu === 1) lancerJeuIframe(1, "./jeux_html/jeu1/index.html");
    else if (numeroJeu === 2) lancerJeuIframe(2, "./jeux_html/jeu2/index.html");
    else if (numeroJeu === 3) lancerJeuIframe(3, "./jeux_html/jeu3/index.html");
    else if (numeroJeu === 4) lancerJeuIframe(4, "./jeux_html/jeu4/index.html");
    else if (numeroJeu === 5) lancerJeuIframe(5, "./jeux_html/jeu5/index.html");
    else lancerJeuSimple(numeroJeu);
  }

  // Après un jeu, déclenche la suite logique (transition/finale)
  function envoyerSuite(numeroJeu) {
    if (numeroJeu === 1) envoyer("plateforme402:request-transition-j1-j2", { game: 1 });
    if (numeroJeu === 2) envoyer("plateforme402:request-transition-j2-j3", { game: 2 });
    if (numeroJeu === 3) envoyer("plateforme402:request-transition-j3-j4", { game: 3 });
    if (numeroJeu === 4) envoyer("plateforme402:request-transition-j4-j5", { game: 4 });
    if (numeroJeu === 5) envoyer("plateforme402:request-finale", { game: 5 });
  }

  // Fin standard d'un jeu (UI + événements)
  function terminerJeu(numeroJeu) {
    if (!numeroJeu) return;
    jeuActif = null;
    envoyer("plateforme402:game-end", { game: numeroJeu });
    cacherZoneJeu();
    envoyerSuite(numeroJeu);
  }

  // Bouton "Terminer ce jeu" des placeholders
  if (boutonFinPlaceholder) {
    boutonFinPlaceholder.addEventListener("click", function () {
      terminerJeu(jeuActif);
    });
  }

  // Les jeux en iframe signalent leur fin via postMessage
  window.addEventListener("message", function (event) {
    var data = event.data || {};
    var sourceValide =
      data.source === "plateforme402-game1" ||
      data.source === "plateforme402-game2" ||
      data.source === "plateforme402-game3" ||
      data.source === "plateforme402-game4" ||
      data.source === "plateforme402-game5";
    if (!sourceValide) {
      return;
    }
    if (jeuActif !== 1 && jeuActif !== 2 && jeuActif !== 3 && jeuActif !== 4 && jeuActif !== 5) {
      return;
    }
    if (data.type === "plateforme402:game-end") {
      terminerJeu(jeuActif);
    }
  });

  // Si on vient du menu vers 2/3/4/5, on mémorise la cible
  document.addEventListener("plateforme402:menu-direct-game-with-transition", function (event) {
    var numeroJeu = Number(event.detail && event.detail.game);
    if (numeroJeu >= 2 && numeroJeu <= 5) {
      jeuDirectAttendu = numeroJeu;
    }
  });

  // Retour à l'intro: on ferme toute zone de jeu en cours.
  document.addEventListener("plateforme402:request-intro", function () {
    jeuActif = null;
    jeuDirectAttendu = null;
    cacherZoneJeu();
  });

  // Avant un nouveau choix dans le menu rapide : on ferme la partie en cours pour pouvoir revenir en arrière.
  document.addEventListener("plateforme402:menu-dismiss-overlays", function () {
    jeuActif = null;
    jeuDirectAttendu = null;
    cacherZoneJeu();
  });

  // Quand la transition demandée se termine, on lance le jeu ciblé
  document.addEventListener("plateforme402:transition-j1-j2-complete", function () {
    if (jeuDirectAttendu === 2) {
      jeuDirectAttendu = null;
      lancerJeu(2);
    }
  });

  document.addEventListener("plateforme402:transition-j2-j3-complete", function () {
    if (jeuDirectAttendu === 3) {
      jeuDirectAttendu = null;
      lancerJeu(3);
    }
  });

  document.addEventListener("plateforme402:transition-j3-j4-complete", function () {
    if (jeuDirectAttendu === 4) {
      jeuDirectAttendu = null;
      lancerJeu(4);
    }
  });

  document.addEventListener("plateforme402:transition-j4-j5-complete", function () {
    if (jeuDirectAttendu === 5) {
      jeuDirectAttendu = null;
      lancerJeu(5);
    }
  });

  // Événements globaux pour démarrer un jeu précis
  [1, 2, 3, 4, 5].forEach(function (gameNumber) {
    document.addEventListener("plateforme402:request-game-" + gameNumber, function () {
      lancerJeu(gameNumber);
    });
  });
})();
