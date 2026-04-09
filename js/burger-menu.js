(function () {
  "use strict";

  // Références des éléments du menu burger
  var CODE = "mmi"; // code à entrer pour passr les jeux
  var menu = document.getElementById("dev-menu");
  var boutonMenu = document.getElementById("dev-menu-toggle");
  var panel = document.getElementById("dev-menu-panel");

  if (!menu || !boutonMenu || !panel) return;

  // Le menu doit toujours rester visible
  menu.classList.remove("is-hidden");

  // Petite fonction utilitaire: envoie un événement au reste de l'application.
  function envoyer(type, detail) {
    document.dispatchEvent(new CustomEvent(type, { detail: detail || {} }));
  }

  // Ferme le menu
  function fermerMenu() {
    panel.hidden = true;
  }

  // Demande le code de sécurité avant d'autoriser une action
  function demanderCode() {
    var reponse = window.prompt("Enter the code to use this menu:");
    if (typeof reponse !== "string") return false;
    return reponse.trim().toLowerCase() === CODE;
  }

  // Lance le jeu demandé.
  // - Jeu 1: lancement direct (on saute la géoloc).
  // - Jeux 2 à 5: on passe d'abord par la transition.
  function lancerJeu(numeroJeu) {
    // Ferme finale / transitions / jeu en cours pour qu'un nouvel écran ne soit pas masqué
    // (ex. la finale est après les transitions dans le DOM → même z-index mais au-dessus).
    envoyer("plateforme402:menu-dismiss-overlays");
    document.body.classList.remove("vn-transition-active");

    envoyer("plateforme402:menu-go-to-game", { game: numeroJeu });

    if (numeroJeu === 1) {
      envoyer("plateforme402:request-game-1", { source: "dev-menu", game: 1 });
      return;
    }

    envoyer("plateforme402:menu-direct-game-with-transition", { game: numeroJeu });
    if (numeroJeu === 2) envoyer("plateforme402:request-transition-j1-j2", { source: "dev-menu", game: 2 });
    if (numeroJeu === 3) envoyer("plateforme402:request-transition-j2-j3", { source: "dev-menu", game: 3 });
    if (numeroJeu === 4) envoyer("plateforme402:request-transition-j3-j4", { source: "dev-menu", game: 4 });
    if (numeroJeu === 5) envoyer("plateforme402:request-transition-j4-j5", { source: "dev-menu", game: 5 });
  }

  boutonMenu.addEventListener("click", function () {
    // Ouvre ou ferme le menu à chaque clic sur l'icône burger
    panel.hidden = !panel.hidden;
  });

  // Ferme le menu si on clique ailleurs
  document.addEventListener("click", function (e) {
    if (panel.hidden || menu.contains(e.target)) return;
    fermerMenu();
  });

  panel.addEventListener("click", function (e) {
    // On récupère le bouton cliqué dans le menu
    var boutonAction = e.target.closest("[data-action]");
    if (!boutonAction) return;

    if (!demanderCode()) {
      window.alert("Incorrect code.");
      return;
    }

    var action = boutonAction.getAttribute("data-action");
    var numeroJeu = Number(boutonAction.getAttribute("data-game"));

    if (action === "finale") {
      envoyer("plateforme402:menu-dismiss-overlays");
      document.body.classList.remove("vn-transition-active");
      envoyer("plateforme402:request-finale", { source: "dev-menu" });
      fermerMenu();
      return;
    }

    // Action "game" --> va au jeu demandé
    if (action === "game" && numeroJeu) {
      lancerJeu(numeroJeu);
      fermerMenu();
    }
  });
})();