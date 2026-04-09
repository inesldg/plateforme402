// =====================================================
// TACTILE — Gestion des zones d'écran (Gauche/Droite)
// =====================================================


//  Analyse la position des doigts sur l'écran pour savoir quel côté est touché

function getSides(evt) {
    let left = false,
        right = false;
    // Position et taille du canvas à l'écran
    const rect = cv.getBoundingClientRect(); // Position du canvas dans la fenêtre

    // On boucle sur tous les doigts présents sur l'écran (multi-touch)
    for (const t of evt.touches) {
        const x = t.clientX - rect.left; // Position X relative au canvas

        // Séparation en 2 zones (moitié gauche / droite)
        if (x < rect.width / 2) {
            left = true; // Touché dans la moitié gauche
        }
        else {
            right = true; // Touché dans la moitié droite
        }

    }

    return { left, right };
}

// -- Écouteurs d'événements Tactiles --

// Début du toucher
cv.addEventListener('touchstart', e => {
    e.preventDefault(); // Empêche le scroll de la page pendant le jeu

    const s = getSides(e);

    state.touchLeft = s.left;
    state.touchRight = s.right;
},
    { passive: false });

// Déplacement du doigt
cv.addEventListener('touchmove', e => {

    e.preventDefault();

    const s = getSides(e);

    state.touchLeft = s.left;
    state.touchRight = s.right;
}, { passive: false });

// Fin du toucher
cv.addEventListener('touchend', e => {
    e.preventDefault();

    const s = getSides(e);

    state.touchLeft = s.left;
    state.touchRight = s.right;
}, { passive: false });

// Annulation (ex: appel entrant ou doigt qui sort de l'écran)
cv.addEventListener('touchcancel', e => {
    state.touchLeft = false;
    state.touchRight = false;
});


// =====================================================
// GYROSCOPE — Inclinaison de l'appareil
// =====================================================

//  Demande les permissions
function initGyroscope() {
    // Vérifie si l'API nécessite une permission explicite
    if (
        typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function'
    ) {

        DeviceOrientationEvent.requestPermission()
            .then(rep => {
                if (rep === 'granted') {
                    window.addEventListener('deviceorientation', onGyro);
                }
            })
            .catch(() => {
                // Erreur ou refus de l'utilisateur
            });
    } else {
        // Android ou anciens navigateurs : accès direct
        window.addEventListener('deviceorientation', onGyro);
    }
}

function onGyro(event) {
    // 'gamma' représente l'inclinaison gauche/droite (en degrés)
    if (event.gamma !== null) {
        // On limite la valeur entre -90 et 90 degrés
        state.tilt = Math.max(-90, Math.min(90, event.gamma));
        state.gyroActif = true; // Marqueur pour savoir si on peut utiliser le gyro
    }
}

// =====================================================
// 🖱 MODE TEST ORDI (CLICK GAUCHE / DROITE)
// =====================================================

// Analyse la position du clic (comme le tactile mais avec souris)
function getMouseSide(evt) {
    const rect = cv.getBoundingClientRect();
    const x = evt.clientX - rect.left;

    return {
        left: x < rect.width / 2,
        right: x >= rect.width / 2
    };
}

// Click souris
cv.addEventListener('mousedown', e => {
    const s = getMouseSide(e);

    state.touchLeft = s.left;
    state.touchRight = s.right;
});

// Relâchement clic
cv.addEventListener('mouseup', () => {
    state.touchLeft = false;
    state.touchRight = false;
});

// Si la souris sort du canvas → reset (évite bug)
cv.addEventListener('mouseleave', () => {
    state.touchLeft = false;
    state.touchRight = false;
});