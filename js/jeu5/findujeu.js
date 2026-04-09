// =====================================================
// FIN DE JEU
// =====================================================
function verifierFin() {
    if (state.perteEnCours) return;

    // Compte les segments brûlés (>110) et bien cuits (entre 65 et 105)
    const nbBrules = state.segments.filter(s => s > 110).length;
    const nbCuits = state.segments.filter(s => s >= 65 && s <= 105).length;

    // 🔥 Si au moins un segment est brûlé alors défaite avec un tout petit peu de délai
    if (nbBrules >= 1) {
        state.perteEnCours = true;
        setTimeout(() => finJeu(false, 'brulee'), 2000);
        return;
    }

    // Si tous les segments sont bien cuits alors victoire
    if (nbCuits === NB_SEGMENTS) return finJeu(true, 'parfaite');

    // Si le temps est écoulé → calcul du score moyen
    if (state.timeLeft <= 0) {
        const score = Math.round(
            state.segments.reduce((a, b) => a + b, 0) / NB_SEGMENTS
        );

        // victoire si score >= 55 sinon défaite
        return finJeu(score >= 55, 'timeout', score);
    }
}


// =====================================================
// 🎉 CONFETTIS (victoire)
// =====================================================
function lancerConfettis() {
    const nb = 80; // nombre de confettis

    for (let i = 0; i < nb; i++) {
        const conf = document.createElement("div");

        conf.classList.add("confetti");

        // position horizontale aléatoire
        conf.style.left = Math.random() * 100 + "vw";

        // taille aléatoire
        const size = 6 + Math.random() * 8;
        conf.style.width = size + "px";
        conf.style.height = size + "px";

        // couleur aléatoire
        const colors = ["#ff4466", "#ffcc00", "#44dd44", "#66aaff", "#ffffff"];
        conf.style.background = colors[Math.floor(Math.random() * colors.length)];

        // durée animation différente
        conf.style.animationDuration = (2 + Math.random() * 2) + "s";

        document.body.appendChild(conf);

        // suppression après animation
        setTimeout(() => conf.remove(), 4000);
    }
}

function finJeu(victoire, raison, score) {
    if (!state.running && !state.perteEnCours) return;

    const btnRejouer = document.getElementById('btnRejouer');
    const screenEnd = document.getElementById('screenEnd');
    const btnContinuer = document.getElementById('btnContinuerHistoire');

    if (screenEnd) {
        screenEnd.classList.remove('parfaitFond', 'bruleeFond');
    }
    if (btnContinuer) {
        btnContinuer.hidden = true;
    }

    btnRejouer.style.display = 'none'; // reset à chaque fin

    state.running = false; state.perteEnCours = false;

    // stop le jeu
    document.getElementById('sosOverlay').classList.remove('show');

    // Changement d'écran : jeu → écran de fin
    document.getElementById('screenGame').style.display = 'none';
    document.getElementById('screenEnd').style.display = 'flex';


    if (victoire) {
        document.getElementById('endTitle').textContent = 'PERFECT!';
        document.getElementById('endSub').textContent = 'The pie is baked.\nThe fragment comes back to life!';

        // son et vibration en cas de victoire
        sonVictoire();
        lancerConfettis();
        if (navigator.vibrate) navigator.vibrate([80, 40, 80, 40, 160]);
        // Ajout d'une classe pour le fond coloré
        screenEnd.classList.add('parfaitFond');

        if (btnContinuer) {
            btnContinuer.hidden = false;
        }

    }

    // ================== CAS BRÛLÉ ==================
    else if (raison === 'brulee') {

        // texte si la tarte est brulée
        document.getElementById('endTitle').textContent = 'BURNT...';
        document.getElementById('endSub').textContent = 'The oven got the better of your pie.\nControl your voice!';

        // vibration
        if (navigator.vibrate) navigator.vibrate([300, 100, 300]);

        // Ajout d'une classe pour le fond coloré
        screenEnd.classList.add('bruleeFond');

        // ✅ afficher bouton
        btnRejouer.style.display = 'block';

    }

    // ================== CAS TEMPS ÉCOULÉ ==================
    else {
        var endEmojiEl = document.getElementById('endEmoji');
        if (endEmojiEl) endEmojiEl.textContent = '⏱';
        document.getElementById('endTitle').textContent = 'TIME UP';
        // score avec message dynamique
        document.getElementById('endSub').textContent = `Score: ${score}%\n${score >= 55 ? 'So close!' : 'Try again!'}`;

        // ✅ afficher bouton
        btnRejouer.style.display = 'block';
    }
}

// Retour vers la plateforme (iframe) après une victoire
(function () {
    var btn = document.getElementById('btnContinuerHistoire');
    if (!btn) return;
    btn.addEventListener('click', function () {
        if (window.parent && window.parent !== window) {
            window.parent.postMessage(
                { source: 'plateforme402-game5', type: 'plateforme402:game-end' },
                '*'
            );
        }
    });
})();
