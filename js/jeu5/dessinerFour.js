// =====================================================
// DESSIN FOUR
// =====================================================

/**
 * Fonction principale de rendu appelée à chaque frame
 */
function dessiner() {
  // Récupération des dimensions actuelles du canvas
  const W = cv.width, H = cv.height;

  // Effacement complet de l'écran avant de redessiner
  ctx.clearRect(0, 0, W, H);

  // Empilement des couches visuelles (du fond vers le premier plan)
  dessinerFour(W, H);           // Décor et structure
  dessinerTarte(W, H);          // L'élément de jeu central
  dessinerFlammesPixel(W, H);   // Effets de particules/flammes
  dessinerIndicateursTactiles(W, H); // Feedback utilisateur
}


//  Affiche des flèches visuelles lors des interactions sur mobile/tactile

function dessinerIndicateursTactiles(W, H) {
  if (!state.touchLeft && !state.touchRight) return;

  ctx.save();
  // Application d'une transparence globale pour ne pas masquer le jeu
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = '#ffffff';

  // Affichage du triangle à gauche
  if (state.touchLeft) {
    ctx.textAlign = 'left';
    ctx.fillText('◀', 16, H / 2);
  }

  // Affichage du triangle à droite
  if (state.touchRight) {
    ctx.textAlign = 'right';
    ctx.fillText('▶', W - 16, H / 2);
  }
  ctx.restore();
}


//Dessine l'intérieur du four et les effets de chaleur

function dessinerFour(W, H) {
  const m = 10; // Marge de base

  // Fond du four
  ctx.fillStyle = '#d3d3d3';
  ctx.fillRect(m, m, W - m * 2, H - m * 2);

  // Bordure extérieure : encadrement métallique
  ctx.strokeStyle = '#dddddd';
  ctx.lineWidth = 4;
  ctx.strokeRect(m, m, W - m * 2, H - m * 2);

  // Bordure intérieure
  ctx.strokeStyle = '#3a1800';
  ctx.lineWidth = 2;
  ctx.strokeRect(m + 6, m + 6, W - m * 2 - 12, H - m * 2 - 12);

  // Calcul du facteur de température (0 à 1)
  const tf = Math.max(0, Math.min(1, (state.temp - 20) / 230));
  
  // Applique un filtre de couleur orange/rouge selon la chaleur
  ctx.fillStyle = `rgba(${Math.round(tf * 140)},${Math.round(tf * 35)},0,${0.1 + tf * 0.4})`;
  ctx.fillRect(m + 4, m + 4, W - m * 2 - 8, H - m * 2 - 8);

  // Effet d'alerte visuelle (clignotement) si un "spike" de chaleur survient
  if (state.spikeActive) {
    const flash = (Math.sin(Date.now() / 70) + 1) / 2;
    ctx.fillStyle = `rgba(220,0,0,${flash * 0.3})`;
    ctx.fillRect(m + 4, m + 4, W - m * 2 - 8, H - m * 2 - 8);
  }

  // Dessin des grilles horizontales du four
  ctx.strokeStyle = 'rgba(90,40,0,0.5)';
  ctx.lineWidth = 1;
  for (let y = m + 22; y < H - m - 30; y += 18) {
    ctx.beginPath();
    ctx.moveTo(m + 18, y);
    ctx.lineTo(W - m - 18, y);
    ctx.stroke();
  }

  // Affichage de la jauge verticale sur le côté
  dessinerJaugeTemp(W, H, m);
}

//  Dessine la jauge thermique et les indicateurs de réussite (zone verte)
function dessinerJaugeTemp(W, H, m) {
  const gw = 14;              // Largeur de la barre
  const gx = W - m - gw - 10; // Position X (marge à droite)
  const gy = m + 14;          // Position Y
  const gh = H - m * 2 - 32;  // Hauteur totale de la jauge

  // Fond de la jauge (le "contenant" vide)
  ctx.fillStyle = '#110500';
  ctx.fillRect(gx, gy, gw, gh);
  ctx.strokeStyle = '#3a1800';
  ctx.lineWidth = 1;
  ctx.strokeRect(gx, gy, gw, gh);

  // Remplissage dynamique (couleur HSL : passe du bleu/vert au rouge)
  const tf = Math.max(0, Math.min(1, (state.temp - 20) / 230));
  ctx.fillStyle = `hsl(${Math.round(60 - tf * 60)},100%,50%)`;
  ctx.fillRect(gx, gy + gh - tf * gh, gw, tf * gh);

  // Zone cible de cuisson idéale (entre 150 et 190 degrés)
  const yH = gy + gh - ((190 - 20) / 230) * gh; // Limite haute
  const yB = gy + gh - ((150 - 20) / 230) * gh; // Limite basse

  // Overlay vert pour indiquer la zone de succès
  ctx.fillStyle = 'rgba(68,221,68,0.25)';
  ctx.fillRect(gx, yH, gw, yB - yH);

  // Bordures en pointillés de la zone idéale
  ctx.strokeStyle = '#44dd44';
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 2]);
  ctx.beginPath();
  ctx.moveTo(gx - 3, yH); ctx.lineTo(gx + gw + 3, yH);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(gx - 3, yB); ctx.lineTo(gx + gw + 3, yB);
  ctx.stroke();
  ctx.setLineDash([]); // Reset du style de ligne

  // Graduation textuelle (Max et Min)
  ctx.fillStyle = '#886633';
  ctx.font = '6px "Press Start 2P"';
  ctx.textAlign = 'center';
  ctx.fillText('250', gx + gw / 2, gy + 7);
  ctx.fillText('20', gx + gw / 2, gy + gh + 8);
  ctx.textAlign = 'left';

  // Si la température est parfaite, on ajoute un contour brillant animé
  if (state.temp >= 150 && state.temp <= 190) {
    const f = (Math.sin(Date.now() / 200) + 1) / 2;
    ctx.strokeStyle = `rgba(68,221,68,${0.5 + f * 0.5})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(gx - 1, gy - 1, gw + 2, gh + 2);
  }
}


// Anime et dessine les flammes au bas du four selon la température

function dessinerFlammesPixel(W, H) {
  // Activation progressive des flammes à partir de 60°C
  const tf = Math.max(0, Math.min(1, (state.temp - 60) / 180));
  if (tf <= 0) return;

  const basY = H - 12;
  const nb = 6 + Math.round(tf * 6); // Plus il fait chaud, plus il y a de flammes
  const now = Date.now();

  for (let i = 0; i < nb; i++) {
    // Distribution horizontale des flammes
    const x = 18 + (i / (nb - 1)) * (W - 36);

    // Calcul de la hauteur et de l'oscillation (vibration du feu)
    const fh = Math.max(8, 18 + tf * 55 + Math.sin(now / 220 + i * 1.7) * 10 + Math.sin(now / 130 + i * 0.9) * 6);
    const ox = Math.sin(now / 190 + i * 2.1) * 5 + Math.sin(now / 110 + i * 1.3) * 3;
    const lw = 7 + tf * 6; // Largeur de la base de la flamme

    // Création d'un dégradé vertical pour chaque flamme
    const grad = ctx.createLinearGradient(x, basY, x, basY - fh);
    grad.addColorStop(0, 'rgba(255,245,180,0.95)');    // Cœur jaune
    grad.addColorStop(0.25, 'rgba(255,200,20,0.92)');  // Orange
    grad.addColorStop(0.55, 'rgba(255,100,0,0.80)');   // Rouge
    grad.addColorStop(1, 'rgba(180,0,0,0)');           // Pointe invisible

    // Dessin de la forme organique de la flamme
    ctx.beginPath();
    ctx.moveTo(x - lw, basY);
    ctx.quadraticCurveTo(x + ox, basY - fh * 0.55, x + ox, basY - fh); // Courbe vers la pointe
    ctx.quadraticCurveTo(x + ox, basY - fh * 0.55, x + lw, basY);       // Retour à la base
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
  }

  // Halo lumineux horizontal au pied des flammes
  const bg = ctx.createLinearGradient(0, basY - 4, 0, basY + 12);
  bg.addColorStop(0, `rgba(255,80,0,${tf * 0.5})`);
  bg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = bg;
  ctx.fillRect(14, basY - 4, W - 28, 16);
}