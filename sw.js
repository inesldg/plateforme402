 /******************
	Pour mieux comprendre ce script, voir : https://css-tricks.com/serviceworker-for-offline/
*******************/

var version = 'v1:10:0';

// Correspondance cache : les navigateurs envoient souvent des requêtes « Range » pour
// audio/vidéo ; elles ne matchent pas toujours la réponse complète stockée par addAll.
function matchPrecache(request) {
  return caches.match(request, { ignoreSearch: true }).then(function (hit) {
    if (hit) return hit;
    if (request.headers.has("range")) {
      return caches.match(new Request(request.url, { method: "GET" }), {
        ignoreSearch: true,
      });
    }
    try {
      var u = new URL(request.url);
      if (u.origin === self.location.origin) {
        return caches.match(u.origin + u.pathname, { ignoreSearch: true });
      }
    } catch (e) {}
    return null;
  });
}

self.addEventListener("install", function(event) {
	event.waitUntil(
	caches.open(version + 'fundamentals')
      .then(function(cache) {
        var assets = [
          './',
          './index.html',
          './manifest.json',
          './sw.js',
          './styles/style.css',
          './styles/intro.css',
          './styles/transitions.css',
          './styles/finale.css',
          './styles/main-app.css',
          './styles/burger-menu.css',
          './styles/navigation-map.css',
          './js/intro.js',
          './js/transition-j1-j2.js',
          './js/transition-j2-j3.js',
          './js/transition-j3-j4.js',
          './js/transition-j4-j5.js',
          './js/finale.js',
          './js/burger-menu.js',
          './js/navigation-map.js',
          './js/game-flow.js',
          './styles/jeu1/style.css',
          './jeux_html/jeu1/index.html',
          './js/jeu1/script.js',
          './images/jeu1/perso.png',
          './images/jeu1/mechant.png',
          './images/jeu1/decor.jpg',
          './images/jeu1/chapeau.png',
          './audio/jeu1/musique.mp3',
          './styles/jeu2/style.css',
          './jeux_html/jeu2/index.html',
          './js/jeu2/main.js',
          './images/jeu2/hitboxBackground.png',
          './images/jeu2/platforms.png',
          './images/jeu2/backgroundImg.png',
          './images/jeu2/GTSpritesheet.png',
          './images/jeu2/GTSpritesheetRev.png',
          './images/jeu2/box.png',
          './audio/jeu2/jump.mp3',
          './js/jeu3/elements.js',
          './js/jeu3/audio.js',
          './js/jeu3/input.js',
          './js/jeu3/UI.js',
          './js/jeu3/jeu.js',
          './js/jeu4/script.js',
          './js/jeu4/timer.js',
          './js/jeu4/pommes.js',
          './styles/jeu3/style.css',
          './styles/jeu4/style.css',
          './styles/jeu5/style.css',
          './jeux_html/jeu3/index.html',
          './jeux_html/jeu4/index.html',
          './jeux_html/jeu5/index.html',
          './js/jeu5/script.js',
          './js/jeu5/dessinerFour.js',
          './js/jeu5/findujeu.js',
          './js/jeu5/dessinerTarte.js',
          './js/jeu5/sons.js',
          './js/jeu5/tactile.js',
          './images/transitions/boulangerie.png',
          './images/transitions/cathedrale.png',
          './images/transitions/coin_rue.png',
          './images/transitions/gessler.png',
          './images/transitions/gessler_heureux.png',
          './images/transitions/guillaume2.png',
          './images/transitions/guillaume3.png',
          './images/transitions/guillaume_arc.png',
          './images/transitions/guillaume_heureux.png',
          './images/transitions/guillaume_peur.png',
          './images/transitions/guillaume_tarte.png',
          './images/transitions/lampadaire.png',
          './images/transitions/reunion.png',
          './images/transitions/taverne.png',
          './images/jeu3/cinematique.png',
          './images/jeu3/coeur_plein.png',
          './images/jeu3/coeur_vide.png',
          './images/jeu3/panier.png',
          './images/jeu3/panier_fin.png',
          './images/jeu3/pigeon.png',
          './images/jeu3/pommeDoree.png',
          './images/jeu3/pommePourrie.png',
          './images/jeu3/pommeRouge.png',
          './images/jeu3/pommier.png',
          './images/jeu3/prairie.png',
          './images/jeu4/apple_golden_60x60px.webp',
          './images/jeu4/apple_regular_60x60px.webp',
          './images/jeu4/apple_rotten_60x60px.webp',
          './images/jeu4/bouclier-eppee.png',
          './images/jeu4/Fond-canva-fruit-ninja-pommes.webp',
          './images/jeu4/pancarte-canva-chrono.webp',
          './images/jeu4/Splash-fruit.svg',
          './images/jeu5/auFeu.png',
          './images/jeu5/cuisinepixel.png',
          './images/jeu5/cuisinepixel2.png',
          './images/jeu5/cuisinepixel3.png',
          './images/jeu5/cuisinier.png',
          './images/jeu5/cuisinierTarteBrule.png',
          './images/jeu5/fondCuisine.png',
          './images/jeu5/logo.png',
          './audio/jeu3/fin_ecran.mp3',
          './audio/jeu3/game_over_ecran.mp3',
          './audio/jeu3/musique.mp3',
          './audio/jeu3/pigeon_sans_pomme.mp3',
          './audio/jeu3/pigeon_vole_pomme.mp3',
          './audio/jeu3/pomme.mp3',
          './audio/jeu3/pomme_doree.mp3',
          './audio/jeu3/pomme_pourrie.mp3',
          './audio/jeu3/secousse_pommier.mp3',
          './audio/jeu3/timer.mp3',
          './audio/jeu4/combo-1.wav',
          './audio/jeu4/freesound_community-small-explosion-106769.mp3',
          './audio/jeu4/freesound_community-videogame-death-sound-43894.mp3',
          './audio/jeu4/Impact-Plum.wav',
          './audio/jeu4/Impact.wav',
          './audio/jeu4/soundreality-explosion-8-bit-8-314694.mp3',
          './audio/jeu4/Throw-fruit.wav',
          './audio/jeu4/time-beep.wav',
          './audio/jeu4/Time-tick.wav',
          './audio/jeu4/Time-tock.wav',
          './audio/jeu4/time-up.wav',
          './audio/jeu4/winning.mp3'
        ];

        var coreAssets = [
          './',
          './index.html',
          './manifest.json',
          './sw.js',
          './styles/style.css',
          './styles/main-app.css',
          './js/navigation-map.js',
          './js/game-flow.js'
        ];

        // On precache d'abord le "noyau" de l'app. Ensuite, on tente le reste en best-effort
        // pour éviter qu'un seul fichier manquant/corrompu empêche toute installation offline.
        return cache.addAll(coreAssets).then(function () {
          var extraAssets = assets.filter(function (url) {
            return coreAssets.indexOf(url) === -1;
          });
          return Promise.allSettled(
            extraAssets.map(function (url) {
              return cache.add(url);
            })
          );
        });
      })
      .then(function() {
        return self.skipWaiting();
      })
	);
});

self.addEventListener("fetch", function(event) {
  if (event.request.url.indexOf('http') === 0 && event.request.method == 'GET') {
	  event.respondWith(
		matchPrecache(event.request)
		  .then(function(cached) {
			var networked = fetch(event.request)
			  .then(fetchedFromNetwork, unableToResolve)
			  .catch(unableToResolve);
			return cached || networked;

			function fetchedFromNetwork(response) {
			  var cacheCopy = response.clone();
			  caches.open(version + 'pages')
					.then(function add(cache) {
						cache.put(event.request, cacheCopy);
					});
			  return response;
			}

			function unableToResolve () {
        // Si c'est une navigation HTML et qu'on est offline, on renvoie l'index cache.
        var accepteHtml = event.request.mode === "navigate" ||
          (event.request.headers.get("accept") || "").indexOf("text/html") !== -1;
        if (accepteHtml) {
          return caches.match('./index.html', { ignoreSearch: true }).then(function (offlinePage) {
            if (offlinePage) return offlinePage;
            return new Response("<h1>Offline page unavailable</h1>", {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/html'
              })
            });
          });
        }

			  return new Response("Offline resource unavailable", {
				  status: 503,
				  statusText: 'Service Unavailable',
				  headers: new Headers({
				    'Content-Type': 'text/plain'
				  })
			  });
			}
		  })
	  );
  }
});

self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys
            .filter(function (key) {
              return !key.startsWith(version);
            })
            .map(function (key) {
              return caches.delete(key);
            })
        );
      })
      .then(function() {
        return self.clients.claim();
      })
  );
});
