function dessinerTarte(W, H) {

    // centre avec un petit decalage car barre de degre sur le cote droit
    const cx = (W - 20) / 2;
    const cy = H / 2;

    // Rayon basé sur la plus petite dimension pour éviter effet ovale
    const ray = Math.min(W, H) * 0.30;

    // angle par segment
    const aps = (2 * Math.PI) / NB_SEGMENTS;


    // =====================================================
    // DESSIN DES SEGMENTS DE LA TARTE
    // =====================================================
    for (let i = 0; i < NB_SEGMENTS; i++) {
        // rotation de la tarte
        const rr = (state.rotation * Math.PI) / 180;
        // angle debut et fin du segment
        const ad = rr + i * aps - Math.PI / 2;
        const af = rr + (i + 1) * aps - Math.PI / 2;

        ctx.beginPath();
        ctx.moveTo(cx, cy); // centre
        ctx.arc(cx, cy, ray * 0.80, ad, af);
        ctx.closePath();

        // couleur qui s'adapte en fonction de la cuisson
        ctx.fillStyle = couleurSegment(
            state.segments[i],
            state.segments[i] > 110
        );
        ctx.fill();
    }


    // =====================================================
    // 🍞 CROÛTE (anneau extérieur)
    // =====================================================

    // moeynne de cuisson
    const moy = state.segments.reduce((a, b) => a + b, 0) / NB_SEGMENTS;
    // Vérifie si au moins un segment est brûlé
    const brules = state.segments.some(s => s > 110);

    ctx.beginPath();
    ctx.arc(cx, cy, ray, 0, Math.PI * 2);
    ctx.arc(cx, cy, ray * 0.80, 0, Math.PI * 2, true);

    // Couleur croûte dépend de la cuisson globaleF
    ctx.fillStyle = brules ? '#2a0800' : couleurCroute(moy, false);
    ctx.fill();

    // Contour extérieur de la tarte
    ctx.beginPath();
    ctx.arc(cx, cy, ray, 0, Math.PI * 2);
    ctx.strokeStyle = '#1a0600';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Intensité basée sur la température
    const tfZ = Math.max(0, Math.min(1, (state.temp - 60) / 150));

    if (tfZ > 0) {
        ctx.beginPath();
        // arc du dessus de la tarte
        ctx.arc(
            cx,
            cy,
            ray + 6,
            Math.PI / 2 - Math.PI / 3,
            Math.PI / 2 + Math.PI / 3
        );

        // Couleur orangée avec transparence
        ctx.strokeStyle = `rgba(255,100,0,${tfZ * 0.7})`;
        ctx.lineWidth = 4;
        ctx.stroke();
    }


    // =====================================================
    // 💨 VAPEUR (si cuisson suffisante et pas brûlée)
    // =====================================================
    if (moy > 35 && !brules) {
        dessinerVapeur(cx, cy, ray, 1, moy);
    }

    // =====================================================
    // ❌ CROIX ROUGE SI BRÛLÉ
    // =====================================================
    if (brules) {
        ctx.strokeStyle = '#cc1100';
        ctx.lineWidth = 5;
        ctx.lineCap = 'square';

        const r = ray * 0.35;

        ctx.beginPath();
        ctx.moveTo(cx - r, cy - r);
        ctx.lineTo(cx + r, cy + r);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cx + r, cy - r);
        ctx.lineTo(cx - r, cy + r);
        ctx.stroke();
    }
}

// =====================================================
// 🎨 COULEUR DES SEGMENTS
// =====================================================
function couleurSegment(c, b) {
    // brulée = noir
    if (b || c > 110) return '#1a0400';

    // pas cuit = beige clair
    if (c < 20) return '#f0e4c0';

    // transition vers dorée
    if (c < 45) {
        const t = (c - 20) / 25; return `rgb(${Math.round(240 - t * 60)},
        ${Math.round(228 - t * 90)},
        ${Math.round(192 - t * 110)})`;
    }

    // cuisson moyenne
    if (c < 70) {
        const t = (c - 45) / 25;
        return `rgb(${Math.round(180 - t * 40)},
        ${Math.round(138 - t * 50)},
        ${Math.round(82 - t * 40)})`;
    }

    // bien cuit
    if (c < 90) {
        const t = (c - 70) / 20;
        return `rgb(${Math.round(140 - t * 30)},
        ${Math.round(88 - t * 30)},
        ${Math.round(42 - t * 15)})`;
    }

    // tres cuit
    return 'rgb(110,55,20)';
}

// =====================================================
// COULEUR DES SEGMENTS
// =====================================================
function couleurCroute(c, b) {

    // brulé
    if (b) return '#0d0400';

    if (c < 20) return 'rgb(225,195,145)';
    if (c < 50) {
        const t = (c - 20) / 30; return `rgb(${Math.round(225 - t * 55)},
    ${Math.round(195 - t * 70)},
    ${Math.round(145 - t * 70)})`;
    }

    if (c < 80) {
        const t = (c - 50) / 30;
        return `rgb(${Math.round(170 - t * 35)},
        ${Math.round(125 - t * 40)},
        ${Math.round(75 - t * 30)})`;
    }

    return 'rgb(135,82,30)';
}

// vapeur animée
function dessinerVapeur(cx, cy, ray, ey, cuisson) {

    for (let i = 0; i < 3; i++) {

        const sx = cx + (i - 1) * 16;

        const t = (Date.now() / 500 + i * 0.9) % (Math.PI * 2);

        ctx.beginPath();
        ctx.moveTo(sx, cy - ray * ey - 4);
        ctx.bezierCurveTo(sx + Math.sin(t) * 9,
            cy - ray * ey - ray * 0.45, sx - Math.sin(t) * 9,
            cy - ray * ey - ray * 0.85,
            sx, cy - ray * ey - ray * 1.15);

        ctx.strokeStyle = `rgba(210,210,210,${(cuisson / 100) * 0.5})`;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}
