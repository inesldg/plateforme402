(function () {
  // Coordonnées géo à atteindre pour chaques jeux
  var jeux = {
    1: { nom: "Place de la réunion, devant l'église", latitude: 47.74692365564367, longitude: 7.338653147115707, rayonArrivee: 10 },
    2: { nom: "Place de la réunion", latitude: 47.746833300731275, longitude: 7.338617460239516, rayonArrivee: 10 },
    3: { nom: "Café Guillaume Tell, lampadaire pomme", latitude: 47.74647555231466, longitude: 7.339206649304488, rayonArrivee: 10 },
    4: { nom: "Taverne des Chevaliers Teutoniques", latitude: 47.74641067400847, longitude: 7.33756699848394, rayonArrivee: 10 },
    5: { nom: "Boulangerie Gebele", latitude: 47.74664132914144, longitude: 7.335819162843482, rayonArrivee: 10 },
  };

  // Éléments HTML
  var ecranCarte = document.getElementById("nav-map-screen");
  var zoneCarte = document.getElementById("nav-map");
  var texteObjectif = document.getElementById("nav-map-subtitle");
  var texteDistance = document.getElementById("nav-map-distance");

  // Sans la structure DOM de la carte, on ne peut rien faire.
  // Si Leaflet n'est pas chargé (hors ligne + CDN indisponible), on enregistre
  // quand même les écouteurs et on lance les jeux en mode dégradé (sans GPS).
  if (!ecranCarte || !zoneCarte || !texteObjectif || !texteDistance) {
    return;
  }

  // Variables gloabales
  var carte = null;
  var marqueurJoueur = null;
  var marqueurObjectif = null;
  var ligneTrajet = null;
  var idSuiviGps = null;
  var numeroJeuActif = null;
  var numeroJeuDirectAvecTransition = null;
  var arrive = false;
  var derniereLatitudeJoueur = null;
  var derniereLongitudeJoueur = null;
  var capOrientationAppareil = null;
  var capLisseJoueur = null;
  var desorientation = 0;
  var derniereMajCalibration = 0;
  var ecouteOrientationActive = false;
  var iconeJoueur = null;
  var iconeObjectifRouge = null;

  // Icônes sans images externes (hors ligne / PWA sans tuiles réseau pour les marqueurs).
  function initialiserIconesLeaflet() {
    if (iconeJoueur || typeof L === "undefined") {
      return;
    }
    iconeJoueur = L.divIcon({
      className: "icone-joueur-simple",
      html:
        '<div style="position:relative;width:28px;height:28px;">' +
        '<div style="position:absolute;left:50%;top:50%;width:16px;height:16px;border-radius:50%;background:#2b8cff;border:2px solid #ffffff;box-shadow:0 0 0 2px rgba(43,140,255,0.25);transform:translate(-50%,-50%);z-index:1;"></div>' +
        '<div class="fleche-direction-joueur" style="position:absolute;left:50%;top:-12px;width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-bottom:16px solid #2b8cff;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.35));transform:translateX(-50%) rotate(0deg);transform-origin:50% 20px;z-index:2;"></div>' +
        "</div>",
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
    iconeObjectifRouge = L.divIcon({
      className: "icone-objectif-simple",
      html:
        '<div style="width:18px;height:18px;border-radius:50%;background:#e53935;border:2px solid #fff;box-shadow:0 0 0 2px rgba(0,0,0,0.2);"></div>',
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
  }

  function envoyerEvenement(type, detail) {
    document.dispatchEvent(
      new CustomEvent(type, {
        detail: detail || {},
      })
    );
  }

  // Pas de bibliothèque carte (souvent hors ligne sans Leaflet) : on lance le jeu sans étape GPS.
  function lancerJeuSansNavigation(numeroJeu) {
    envoyerEvenement("plateforme402:request-game-" + numeroJeu, {
      source: "navigation-fallback",
      game: numeroJeu,
    });
  }

  // Afficher ou cacher la carte
  function afficherCarte() {
    ecranCarte.classList.remove("is-hidden");
  }

  function cacherCarte() {
    ecranCarte.classList.add("is-hidden");
  }

  // Arrête le GPS pour eviter de garder un suivi inutile
  function arreterSuiviGps() {
    if (idSuiviGps !== null) {
      navigator.geolocation.clearWatch(idSuiviGps);
      idSuiviGps = null;
    }
  }

  // On enlève les marqueurs etc de la carte pour préparer aux prochaines coordonnées
  function nettoyerCarte() {
    if (ligneTrajet && carte) {
      carte.removeLayer(ligneTrajet);
      ligneTrajet = null;
    }
    if (marqueurJoueur && carte) {
      carte.removeLayer(marqueurJoueur);
      marqueurJoueur = null;
    }
    if (marqueurObjectif && carte) {
      carte.removeLayer(marqueurObjectif);
      marqueurObjectif = null;
    }
  }

  // Crée la carte la premiere fois, sinon la rafraichit
  function preparerCarte(latitude, longitude) {
    initialiserIconesLeaflet();
    if (!carte) {
      carte = L.map("nav-map", { zoomControl: true }).setView([latitude, longitude], 16.5);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(carte);
      return;
    }
    carte.invalidateSize();
  }

  function afficherTrajet(latitude, longitude, objectif) {
    if (!carte) {
      return;
    }

    var positionJoueur = L.latLng(latitude, longitude);
    var positionObjectif = L.latLng(objectif.latitude, objectif.longitude);

    // Marqueur du joueur
    if (!marqueurJoueur) {
      marqueurJoueur = L.marker(positionJoueur, { icon: iconeJoueur }).addTo(carte).bindPopup("Votre position");
    } else {
      marqueurJoueur.setLatLng(positionJoueur);
    }

    // Objectif: meme style qu'avant, mais en rouge
    if (!marqueurObjectif) {
      marqueurObjectif = L.marker(positionObjectif, { icon: iconeObjectifRouge }).addTo(carte).bindPopup(objectif.nom);
    } else {
      marqueurObjectif.setLatLng(positionObjectif);
    }

    // Ligne de trajet entre le joueur et l'objectif
    if (!ligneTrajet) {
      ligneTrajet = L.polyline([positionJoueur, positionObjectif], {
        color: "#5aa7ff",
        weight: 5,
        opacity: 0.9,
      }).addTo(carte);
    } else {
      ligneTrajet.setLatLngs([positionJoueur, positionObjectif]);
    }

    carte.fitBounds(ligneTrajet.getBounds(), { padding: [35, 35], maxZoom: 18 });
  }

  // Fonction qui calcule la distance en mètres entre la position du joueur et celle de l'objectif
  function calculerDistanceEnMetres(latitude, longitude, objectif) {
    var positionJoueur = L.latLng(latitude, longitude);
    var positionObjectif = L.latLng(objectif.latitude, objectif.longitude);
    return positionJoueur.distanceTo(positionObjectif);
  }

  // Calcule un cap (en degres) entre deux positions GPS.
  function calculerCapDepuisDeuxPoints(latitudeA, longitudeA, latitudeB, longitudeB) {
    var lat1 = (latitudeA * Math.PI) / 180;
    var lat2 = (latitudeB * Math.PI) / 180;
    var deltaLongitude = ((longitudeB - longitudeA) * Math.PI) / 180;
    var y = Math.sin(deltaLongitude) * Math.cos(lat2);
    var x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLongitude);
    var angle = (Math.atan2(y, x) * 180) / Math.PI;
    return (angle + 360) % 360;
  }

// Les fonctions suivantes servent à capter l'endroit vers où le joueur va pour la flèche de direction
  function normaliserAngle(degres) {
    return ((degres % 360) + 360) % 360;
  }

  function interpolerAngle(angleActuel, angleCible, facteur) {
    var delta = ((angleCible - angleActuel + 540) % 360) - 180;
    return normaliserAngle(angleActuel + delta * facteur);
  }

  function mettreAJourCalibration(headingGps) {
    if (capOrientationAppareil === null || typeof headingGps !== "number" || isNaN(headingGps) || headingGps < 0) {
      return;
    }
    var maintenant = Date.now();
    if (maintenant - derniereMajCalibration < 1500) {
      return;
    }
    var cibleDesorientation = normaliserAngle(headingGps - capOrientationAppareil);
    desorientation = desorientation === 0 ? cibleDesorientation : interpolerAngle(desorientation, cibleDesorientation, 0.25);
    derniereMajCalibration = maintenant;
  }

  function activerEcouteOrientation() {
    if (ecouteOrientationActive || typeof window.DeviceOrientationEvent === "undefined") {
      return;
    }
    function handler(event) {
      var cap = null;
      if (typeof event.webkitCompassHeading === "number" && !isNaN(event.webkitCompassHeading)) {
        cap = event.webkitCompassHeading;
      } else if (typeof event.alpha === "number" && !isNaN(event.alpha)) {
        cap = 360 - event.alpha;
      }
      if (cap !== null) {
        capOrientationAppareil = normaliserAngle(cap);
      }
    }
    window.addEventListener("deviceorientation", handler, true);
    ecouteOrientationActive = true;
  }

  // La flèche de direction est censé pointer en direction de là où le joueur se dirige
  function orienterFlecheJoueur(angleDegres) {
    if (!marqueurJoueur || typeof angleDegres !== "number") {
      return;
    }
    var elementMarqueur = marqueurJoueur.getElement();
    if (!elementMarqueur) {
      return;
    }
    var fleche = elementMarqueur.querySelector(".fleche-direction-joueur");
    if (!fleche) {
      return;
    }
    fleche.style.transform = "translateX(-50%) rotate(" + Math.round(angleDegres) + "deg)";
  }

  // Fonction qui valide l'aruvée du joueur dans la zone de l'objectif
  function validerArrivee() {
    if (arrive || !numeroJeuActif) {
      return;
    }

    arrive = true;
    arreterSuiviGps();
    texteDistance.textContent = "Bravo, vous avez atteint le point d'arrivee.";

    window.setTimeout(function () {
      var numeroJeu = numeroJeuActif;
      numeroJeuActif = null;
      cacherCarte();
      // Une fois la validation de l'arrivée, on lance le jeu qui va avec
      envoyerEvenement("plateforme402:request-game-" + numeroJeu, {
        source: "navigation-map",
        game: numeroJeu,
      });
    }, 650);
  }

  // Quand la position du joueur est trouvée et qu'il n'est pas arrivé alors on affiche l'objectif, les mètres de la distance restante etc
  function quandPositionTrouvee(position) {
    if (!numeroJeuActif || arrive) {
      return;
    }

    var objectif = jeux[numeroJeuActif];
    if (!objectif) {
      return;
    }

    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;

    preparerCarte(latitude, longitude);
    afficherTrajet(latitude, longitude, objectif);

    // Orientation du marqueur joueur:
    // - priorite au heading GPS si disponible
    // - sinon calcul du cap depuis la position precedente
    var capJoueur = null;
    var headingGps = position && position.coords ? position.coords.heading : null;
    if (typeof headingGps === "number" && !isNaN(headingGps) && headingGps >= 0) {
      capJoueur = headingGps;
    } else if (derniereLatitudeJoueur !== null && derniereLongitudeJoueur !== null) {
      capJoueur = calculerCapDepuisDeuxPoints(
        derniereLatitudeJoueur,
        derniereLongitudeJoueur,
        latitude,
        longitude
      );
    }

    mettreAJourCalibration(headingGps);
    if (capOrientationAppareil !== null) {
      capJoueur = normaliserAngle(capOrientationAppareil + desorientation);
    }

    if (typeof capJoueur === "number" && !isNaN(capJoueur)) {
      if (capLisseJoueur === null) {
        capLisseJoueur = capJoueur;
      } else {
        capLisseJoueur = interpolerAngle(capLisseJoueur, capJoueur, 0.38);
      }
    }
    orienterFlecheJoueur(capLisseJoueur);
    derniereLatitudeJoueur = latitude;
    derniereLongitudeJoueur = longitude;

    var distance = calculerDistanceEnMetres(latitude, longitude, objectif);
    texteDistance.textContent = "Remaining distance : " + Math.round(distance) + " m";

    if (distance <= objectif.rayonArrivee) {
      validerArrivee();
    }
  }

  // Fonction qui affiche quand il y a une erreur de géolocalisation si la posuition du joueur n'est pas trouvée
  function quandPositionErreur(erreur) {
    texteDistance.textContent = "Geolocation unavailable : " + erreur.message;
  }

  // Fonction de démarrage de la navigation, on affiche l'objectif à atteindre et on charge la position du joueur
  function demarrerNavigation(numeroJeu) {
    var objectif = jeux[numeroJeu];
    if (!objectif) {
      return;
    }

    if (typeof L === "undefined") {
      lancerJeuSansNavigation(numeroJeu);
      return;
    }

    if (!navigator.geolocation) {
      texteObjectif.textContent = "Objective : " + objectif.nom;
      texteDistance.textContent = "Geolocation unavailable on this device.";
      afficherCarte();
      return;
    }

    numeroJeuActif = numeroJeu;
    arrive = false;
    texteObjectif.textContent = "Objective : " + objectif.nom;
    texteDistance.textContent = "Finding Your Position...";

    afficherCarte();
    nettoyerCarte();
    arreterSuiviGps();
    activerEcouteOrientation();
    capLisseJoueur = null;

    idSuiviGps = navigator.geolocation.watchPosition(quandPositionTrouvee, quandPositionErreur, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 1000,
    });
  }

  // Si on choisit un jeu depuis le menu, on coupe la map pour lancer le jeu direct.
  function quitterNavigation() {
    arreterSuiviGps();
    numeroJeuActif = null;
    arrive = false;
    nettoyerCarte();
    cacherCarte();
    derniereLatitudeJoueur = null;
    derniereLongitudeJoueur = null;
    capLisseJoueur = null;
  }

  // Lance un jeu sans passer par la carte (utilisé après transition depuis le menu burger).
  function lancerJeuDirect(numeroJeu) {
    quitterNavigation();
    envoyerEvenement("plateforme402:request-game-" + numeroJeu, {
      source: "menu-transition",
      game: numeroJeu,
    });
    numeroJeuDirectAvecTransition = null;
  }

  // Fonction pour les évènements, si on a fini l'intro ou les transitions entte les jeux, on lance la naviagtion pour afficher la carte etc
  function ecouterEvenementsJeu() {
    document.addEventListener("plateforme402:intro-complete", function () {
      demarrerNavigation(1);
    });

    document.addEventListener("plateforme402:transition-j1-j2-complete", function () {
      if (numeroJeuDirectAvecTransition === 2) {
        lancerJeuDirect(2);
        return;
      }
      demarrerNavigation(2);
    });

    document.addEventListener("plateforme402:transition-j2-j3-complete", function () {
      if (numeroJeuDirectAvecTransition === 3) {
        lancerJeuDirect(3);
        return;
      }
      demarrerNavigation(3);
    });

    document.addEventListener("plateforme402:transition-j3-j4-complete", function () {
      if (numeroJeuDirectAvecTransition === 4) {
        lancerJeuDirect(4);
        return;
      }
      demarrerNavigation(4);
    });

    document.addEventListener("plateforme402:transition-j4-j5-complete", function () {
      if (numeroJeuDirectAvecTransition === 5) {
        lancerJeuDirect(5);
        return;
      }
      demarrerNavigation(5);
    });

    // Si on va a un jeu via le menu, on ferme la carte (pas de navigation GPS).
    document.addEventListener("plateforme402:menu-go-to-game", function (evenement) {
      var numeroDemande = Number(evenement.detail && evenement.detail.game);
      if (jeux[numeroDemande]) {
        quitterNavigation();
      }
    });

    document.addEventListener("plateforme402:menu-direct-game-with-transition", function (evenement) {
      var numeroDemande = Number(evenement.detail && evenement.detail.game);
      if (numeroDemande >= 2 && numeroDemande <= 5) {
        numeroJeuDirectAvecTransition = numeroDemande;
        quitterNavigation();
      }
    });
  }

  // Avant le chargement on ne charge pas le suivi GPS pour éviter des bugs et chargements inutiles
  window.addEventListener("beforeunload", function () {
    arreterSuiviGps();
  });

  ecouterEvenementsJeu();
})();
