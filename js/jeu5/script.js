// =====================================================
// ÉTAT GLOBAL
// =====================================================

// Nombre de parts de la tarte
const NB_SEGMENTS = 6;

// Variables liées au micro
let micStream = null;
let audioCtx = null;
let analyser = null;
let micDataBuf = null;
let micPreviewRaf = null;

let state = {
    running: false,
    temp: 20,
    tilt: 0,
    tiltLisse: 0,
    timeLeft: 60,
    lastTick: 0,
    volume: 0,
    rotation: 0,
    gyroActif: false,
    segments: new Array(NB_SEGMENTS).fill(0), // cuisson de chaque part
    spikeActive: false,
    spikeDuration: 0,
    spikeTimer: 5 + Math.random() * 7,
    perteEnCours: false,
    vitesseDroite: 1,
    vitesseGauche: 1,
    timerVitesse: 0,
    touchLeft: false,
    touchRight: false,
};

// =====================================================
// CANVAS
// =====================================================
const canvas = document.getElementById("cv");
const ctx = canvas.getContext("2d");

// ajuste la taille du canvas
function resizeCanvas() {
    if (document.getElementById('screenGame').style.display === 'none')
        return;

    const W = Math.min(window.innerWidth, 380);
    // FORCER un carré parfait
    const H = W;

    cv.width = W;
    cv.height = H;
}

window.addEventListener('resize', resizeCanvas);

// =====================================================
// LANCEMENT
// =====================================================
function startGame() {

    if (micPreviewRaf) {
        cancelAnimationFrame(micPreviewRaf);
        micPreviewRaf = null;
    }

    // passage écran accueil du jeu
    document.getElementById('screenStart').style.display = 'none';
    document.getElementById('screenGame').style.display = 'flex';

    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();

    resetState();
    initGyroscope();

    setTimeout(() => {
        resizeCanvas();
        dernierRaf = performance.now();
        requestAnimationFrame(boucleJeu);
    }, 80);
}

// reset complet de l'état du jeu
function resetState() {
    Object.assign(state, {
        running: true,
        temp: 20,
        tilt: 0,
        tiltLisse: 0,
        timeLeft: 60,
        lastTick: performance.now(),
        volume: 0,
        rotation: 0,
        gyroActif: false,
        spikeActive: false,
        spikeDuration: 0,
        spikeTimer: 5 + Math.random() * 7,
        perteEnCours: false,
        segments: new Array(NB_SEGMENTS).fill(0),
        vitesseDroite: 0.5 + Math.random() * 1.5,
        vitesseGauche: 0.5 + Math.random() * 1.5,
        timerVitesse: 2 + Math.random() * 4,
        touchLeft: false, touchRight: false,
    });
}

// =====================================================
// BOUCLE
// =====================================================
let dernierRaf = 0;

function boucleJeu(timestamp) {

    // stop si le jeu est terminé
    if (!state.running && !state.perteEnCours)
        return;

    requestAnimationFrame(boucleJeu);

    const dt = Math.min(timestamp - dernierRaf, 60) / 1000;
    dernierRaf = timestamp;
    
    mettreAJourLogique(dt);
    dessiner();
}

// =====================================================
// LOGIQUE DU JEU
// =====================================================
function mettreAJourLogique(dt) {
    if (state.perteEnCours) return;

    // Micro → température
    state.volume = getVolumeMicro();
    const v = state.volume;

    let deltaTemp = 0;

    if (v < 0.03) deltaTemp = -18 * dt;
    else if (v < 0.22) deltaTemp = (-18 + ((v - 0.03) / 0.19) * 13) * dt;
    else if (v < 0.55) deltaTemp = (5 + ((v - 0.22) / 0.33) * 30) * dt;
    else deltaTemp = 70 * dt;

    // Spikes
    state.spikeTimer -= dt;

    if (state.spikeTimer <= 0 && !state.spikeActive) {
        state.spikeActive = true;
        state.spikeDuration = 2 + Math.random() * 3;
        state.spikeTimer = 7 + Math.random() * 12;
        sonSOS();

        if (navigator.vibrate) navigator.vibrate([120, 60, 120]);
    }

    if (state.spikeActive) {
        deltaTemp += 55 * dt;
        state.spikeDuration -= dt;
        if (state.spikeDuration <= 0) state.spikeActive = false;
    }

    state.temp = Math.max(20, Math.min(250, state.temp + deltaTemp));
    
    // affiche over SOS
    document.getElementById('sosOverlay').classList.toggle('show', state.spikeActive);

    // Vitesse aléatoire
    state.timerVitesse -= dt;
    if (state.timerVitesse <= 0) {
        state.vitesseDroite = 0.4 + Math.random() * 1.8;
        state.vitesseGauche = 0.4 + Math.random() * 1.8;
        state.timerVitesse = 2 + Math.random() * 5;
    }

    // Rotation : tactile EN PRIORITÉ sur gyroscope
    let tiltCible = state.tilt; // gyroscope par défaut (0 si inactif)
    if (state.touchLeft && !state.touchRight) tiltCible = -70;
    if (state.touchRight && !state.touchLeft) tiltCible = 70;
    if (state.touchLeft && state.touchRight) tiltCible = 0;

    state.tiltLisse += (tiltCible - state.tiltLisse) * 0.18;

    const incli = Math.abs(state.tiltLisse);

    if (incli > 3) {
        const dir = state.tiltLisse > 0 ? 1 : -1;
        const mult = dir > 0 ? state.vitesseDroite : state.vitesseGauche;
        
        const speed = (incli / 90) * 380 * mult * dt;
        state.rotation = ((state.rotation + dir * speed) % 360 + 360) % 360;
    }

    // Cuisson des segments
    const vitesseCuisson = Math.max(0, (state.temp - 80) / 150) * 55 * dt;
    const vitesseBrulure = state.temp > 215 ? ((state.temp - 215) / 35) * 30 * dt : 0;

    for (let i = 0; i < NB_SEGMENTS; i++) {

        if (state.segments[i] > 110) continue;

        const angleSeg = (i * 360 / NB_SEGMENTS + state.rotation) % 360;
        
        const distBas = Math.min(Math.abs(angleSeg - 180), 360 - Math.abs(angleSeg - 180));
        if (distBas < 60) {
            const intensite = 1 - distBas / 60;
            state.segments[i] = Math.min(
                vitesseBrulure > 0 ? 130 : 105,
                state.segments[i] + (vitesseBrulure > 0 ? vitesseBrulure : vitesseCuisson) * intensite
            );
        }
    }

    // petit son de cuisson aléatoire
    if (vitesseCuisson > 0.005 && Math.random() < 0.02) sonGresille();

    // Timer
    const now = performance.now();
    if (now - state.lastTick >= 1000) { state.timeLeft--; state.lastTick = now; }

    mettreAJourHUD();
    verifierFin();
}

// =====================================================
// HUD
// =====================================================
function mettreAJourHUD() {
    const t = state.temp;
    const tempEl = document.getElementById('valTemp');
    tempEl.textContent = Math.round(t) + '°C';
    tempEl.style.color = t < 100 ? '#66aaff' : t < 160 ? '#ffcc00' : t < 215 ? '#ff6a00' : '#cc1100';

    const timerEl = document.getElementById('valTimer');
    timerEl.textContent = Math.max(0, state.timeLeft) + 's';
    timerEl.classList.toggle('clignote', state.timeLeft <= 10);

    const volPct = Math.round(state.volume * 100);
    const mf = document.getElementById('micInGameFill');
    mf.style.width = volPct + '%';
    mf.style.background = volPct < 3 ? '#555' : volPct < 30 ? 'var(--vert)' : volPct < 65 ? '#ff9900' : '#cc1100';
    document.getElementById('micInGameVal').textContent = volPct + '%';

    mettreAJourMessage();
}

function mettreAJourMessage() {
    const t = state.temp;
    const incli = Math.abs(state.tiltLisse);
    let msg = '';
    if (state.spikeActive) msg = '⚠ OVEN UNSTABLE! Whisper to calm it!';
    else if (t < 80) msg = 'Oven is cold - talk to heat it up!';
    else if (t > 215) msg = 'OVERHEAT! Stop talking!';
    else if (incli > 15) msg = state.tiltLisse > 0 ? 'Turn to the right →' : '← Turn to the left';
    else {
        const brules = state.segments.filter(s => s > 110).length;
        const crus = state.segments.filter(s => s < 40).length;
        if (brules > 0) msg = '⚠ Burnt slice! Turn quickly!';
        else if (crus > NB_SEGMENTS / 2) msg = 'Rotate the pie to bake it evenly!';
        else if (t >= 150 && t <= 190) msg = '✅ Ideal zone! 150-190°C!';
        else msg = 'Manage the oven and rotate the pie';
    }
    document.getElementById('msgBox').textContent = msg;
}