// =====================================================
// SONS
// =====================================================

//  * Initialise ou récupère le contexte audio (singleton)
//  * Nécessaire car les navigateurs bloquent l'audio sans interaction utilisateur

function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
}

// cela permet de génerer la hauteur du son en Hz, la durée en secondes et l'intensité
function jouerSon(frequence, type, duree, volume = 0.3) {
    try {
        const ac = getAudioCtx(); const osc = ac.createOscillator(); const gain = ac.createGain();

        // Connexion : Oscillateur -> Volume -> Sortie
        osc.connect(gain); gain.connect(ac.destination);
        osc.type = type; osc.frequency.value = frequence;
        gain.gain.setValueAtTime(volume, ac.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duree);
        osc.start(); osc.stop(ac.currentTime + duree);
    } catch (e) { }
}

// si victoire petite melodie
function sonVictoire() {
    [523, 659, 784, 1047].forEach((f, i) =>
        setTimeout(() => jouerSon(f, 'sine', 0.3), i * 110));
}

//  trois bips 
function sonSOS() {
    [0, 200, 400].forEach(d => setTimeout(() =>
        jouerSon(280, 'sawtooth', 0.15, 0.5), d));
}

// son qui grésille
function sonGresille() {
    jouerSon(160 + Math.random() * 50, 'sawtooth', 0.1, 0.12);
}

// =====================================================
// MICRO — Gestion de l'entrée vocale
// =====================================================

// Demande l'autorisation d'accéder au micro et configure l'analyseur
async function demanderMicro() {
    const btn = document.getElementById('btnMicPerm');
    const status = document.getElementById('micStatus');

    btn.disabled = true;
    status.className = 'mic-status';
    status.textContent = '⏳ Request in progress...';

    try {
        // Requête d'accès au flux audio
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

        // Initialisation du contexte et de l'analyseur de fréquences
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const src = audioCtx.createMediaStreamSource(micStream);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        src.connect(analyser);
        micDataBuf = new Uint8Array(analyser.frequencyBinCount);

        // Mise à jour de l'interface UI
        status.className = 'mic-status ok';
        status.textContent = '✅ Microphone enabled! Talk to test it.';
        btn.style.display = 'none';
        document.getElementById('micLevelWrap').style.display = 'flex';

        // Démarre la visualisation et débloque le bouton de jeu
        lancerPreviewMicro();
        document.getElementById('btnDemarrer').disabled = false;
    } catch (err) {

        // Gestion des erreurs courantes (refus, absence de matériel)
        btn.disabled = false;
        status.className = 'mic-status err';
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')
            status.textContent = '❌ Permission denied.\nCheck your browser settings.';

        else if (err.name === 'NotFoundError')
            status.textContent = '❌ No microphone detected.';

        else
            status.textContent = '❌ Error: ' + err.message;
    }
}


function getVolumeMicro() {
    if (!analyser) return 0;

    analyser.getByteFrequencyData(micDataBuf);
    const sum = micDataBuf.reduce((a, b) => a + b, 0);

    // 1. Calcul de la moyenne brute
    let moyenne = sum / micDataBuf.length;

    // 2. LE SEUIL (Noise Gate)
    const seuilDeBruit = 25;
    moyenne = Math.max(0, moyenne - seuilDeBruit);

    // 3. LA SENSIBILITÉ (Le diviseur)
    const diviseurSensibilite = 65;

    return Math.min(1, moyenne / diviseurSensibilite);
}


// Gère l'animation de la barre de niveau sonore
function lancerPreviewMicro() {
    if (micPreviewRaf) cancelAnimationFrame(micPreviewRaf);
    function tick() {
        const pct = Math.round(getVolumeMicro() * 200);
        const fill = document.getElementById('micLevelFill');

        // Mise à jour de la largeur et de la couleur de la barre selon l'intensité
        fill.style.width = pct + '%';
        fill.style.background = pct < 30 ? 'var(--vert)' : pct < 65 ? '#ff9900' : '#cc1100';
        micPreviewRaf = requestAnimationFrame(tick);
    }
    micPreviewRaf = requestAnimationFrame(tick);
}

// Calcule le volume moyen capté par le micro
function getVolumeMicro() {
    if (!analyser) return 0;
    analyser.getByteFrequencyData(micDataBuf);

    // Calcul de la moyenne des amplitudes
    const sum = micDataBuf.reduce((a, b) => a + b, 0);
    return Math.min(1, (sum / micDataBuf.length) / 75);
}