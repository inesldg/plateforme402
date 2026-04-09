// taille de l'écran
let H = window.innerHeight;
let W = window.innerWidth;

// taille et selection des zones
const divMenu = document.getElementById("menu");
const divWin = document.getElementById("winGame");
const divLose = document.getElementById("loseGame");
const collisionZone = document.getElementById("collisionZone");
const playerZone = document.getElementById("playerZone");
const playZone = document.getElementById("playZone");
collisionZone.height = H;
collisionZone.width = W;
playerZone.height = H;
playerZone.width = W;
playZone.height = H;
playZone.width = W;

// variables de contexte
const ctxCollisionZone = collisionZone.getContext("2d");
const ctxPlayerZone = playerZone.getContext("2d");
const ctxPlayZone = playZone.getContext("2d");

// win or lose
let win = false;
let lose = false;

// background sprite
const bgCollisions = new Image();
bgCollisions.src = "../../images/jeu2/hitboxBackground.png";
const bgSprite = new Image();
bgSprite.src = "../../images/jeu2/platforms.png";
const bgImg = new Image();
bgImg.src = "../../images/jeu2/backgroundImg.png";
let bgSpritex = 0;
let bgSpritey = 0;
let bgSpriteSizex = 2500;
let bgSpriteSizey = H;

// player
let pHeight = 95;
let pWidth = 55;
let px = 100;
let py = H - 150 - pHeight;
let gammaMove = 20;
const jumpSound = new Audio("../../audio/jeu2/jump.mp3");
jumpSound.volume = 0.90;

// pixels player
let ppx1 = 0;
let bottomLeftPx = 0;
let ppx2 = 0;
let bottomRightPx = 0;
let ppx3 = 0;
let middleLeftPx = 0;
let ppx4 = 0;
let middleRightPx = 0;
let ppx5 = 0;
let topLeftPx = 0;
let ppx6 = 0;
let topRightPx = 0;
let ppx7 = 0;
let bottomLeftSidePx = 0;
let ppx8 = 0;
let bottomRightSidePx = 0;
let ppx9 = 0;
let bottomLeftPx2 = 0;
let ppx10 = 0;
let bottomRightPx2 = 0;

// vitesses movements et jump player
let pvx = 350;
let pvy = 0;
let pay = 0;
let aJump = 1000;
let falling = false;
let moveRight = false;
let moveLeft = false;
let jumping = false;
let keys = [];

let gravity = 2500;
let bumpJump = 1650;

// box
let boxpx = 1520;
let boxpy = 50;
let boxWidth = 150;
let boxHeight = 100;
let boxvx = 0;
let boxvy = 0;

// player sprite
let retourner = false;
let pushing = false;
let runEtape = 0;
let runInterval = -1;
const playerSpriteRight = new Image();
playerSpriteRight.src = "../../images/jeu2/GTSpritesheet.png"; // regarde à droite
const playerSpriteLeft = new Image();
playerSpriteLeft.src = "../../images/jeu2/GTSpritesheetRev.png"; // regarde a gauche
let pClipWidth = 220;
let pClipHeight = 345;
let playerSpritex = px;
let playerSpritey = py;
let playerSpriteWidth = pWidth;
let playerSpriteHeight = pHeight;
// vers droite
// idle
let prIdlex = 52;
let prIdley = 416;
let prIdleWidth = pClipWidth;
let prIdleHeight = pClipHeight;
// jumping
let prJumpx = 638;
let prJumpy = 426;
let prJumpWidth = pClipWidth;
let prJumpHeight = pClipHeight;
// pushing
let prPushx = 655;
let prPushy = 793;
let prPushWidth = pClipWidth;
let prPushHeight = pClipHeight;
// running
let prRun0x = 67;
let prRun0y = 41;
let prRun0Width = pClipWidth;
let prRun0Height = pClipHeight;
let prRun1x = 347;
let prRun1y = 41;
let prRun1Width = pClipWidth;
let prRun1Height = pClipHeight;
let prRun2x = 620;
let prRun2y = 41;
let prRun2Width = pClipWidth;
let prRun2Height = pClipHeight;
// vers gauche
// idle
let plIdlex = 622;
let plIdley = 416;
let plIdleWidth = pClipWidth;
let plIdleHeight = pClipHeight;
// jumping
let plJumpx = 34;
let plJumpy = 426;
let plJumpWidth = pClipWidth;
let plJumpHeight = pClipHeight;
// pushing
let plPushx = 655;
let plPushy = 793;
let plPushWidth = pClipWidth;
let plPushHeight = pClipHeight;
// running
let plRun0x = 603;
let plRun0y = 41;
let plRun0Width = pClipWidth;
let plRun0Height = pClipHeight;
let plRun1x = 320;
let plRun1y = 41;
let plRun1Width = pClipWidth;
let plRun1Height = pClipHeight;
let plRun2x = 56;
let plRun2y = 41;
let plRun2Width = pClipWidth;
let plRun2Height = pClipHeight;

// box sprite
const boxSprite = new Image();
boxSprite.src = "../../images/jeu2/box.png";
let boxSpritex = boxpx;
let boxSpritey = boxpy;
let boxSpriteWidth = boxWidth;
let boxSpriteHeight = boxHeight;

// pixels boite
let ppxBox1 = 0;
let bottomLeftBoxPx = 0;
let ppxBox2 = 0;
let bottomRightBoxPx = 0;
let ppxBox3 = 0;
let bottomLeftBoxPx2 = 0;
let ppxBox4 = 0;
let bottomRightBoxPx2 = 0;

let oldBgx = 0;
let newBgx = 0;
let boxdpx = 0;

let boxpay = 0;

let t0 = performance.now();
let t1 = 0;
let dt = 0;

let rafId = 0;
let jeu2InputsBound = false;

// window.addEventListener('resize', resize);
// 
// function resize()
// {
    // H = window.innerHeight;
    // W = window.innerWidth;
// }

document.querySelectorAll(".start").forEach(e => {
    e.addEventListener("click", startGame);
});

function startGame()
{
    affichageGame();

    initGame();
}

function stopGame()
{
    if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
    }

    if (win){
        affichageWin();
        win = false;
    }
    else if (lose){
        affichageLose();
        lose = false;
    }
    else
        affichageMenu();
}

function affichageGame()
{
    divMenu.classList.add('invisible');
    divWin.classList.add('invisible');
    divLose.classList.add('invisible');

    collisionZone.classList.remove('invisible');
    playerZone.classList.remove('invisible');
    playZone.classList.remove('invisible');
}

function affichageMenu()
{
    divMenu.classList.remove('invisible');
    divWin.classList.add('invisible');
    divLose.classList.add('invisible');

    collisionZone.classList.add('invisible');
    playerZone.classList.add('invisible');
    playZone.classList.add('invisible');
}

function affichageWin()
{
    divMenu.classList.add('invisible');
    divWin.classList.remove('invisible');
    divLose.classList.add('invisible');

    collisionZone.classList.add('invisible');
    playerZone.classList.add('invisible');
    playZone.classList.add('invisible');
}

function affichageLose()
{
    divMenu.classList.add('invisible');
    divWin.classList.add('invisible');
    divLose.classList.remove('invisible');

    collisionZone.classList.add('invisible');
    playerZone.classList.add('invisible');
    playZone.classList.add('invisible');
}

function initGame()
{
    // win or lose
    win = false;
    lose = false;

    // sprite background
    bgSpritex = 0;
    bgSpritey = 0;
    bgSpriteSizex = 2500;
    bgSpriteSizey = H;

    // position player
    px = 100;
    py = H - 150 - pHeight;

    // pixels player
    bottomLeftPx = 0;
    bottomRightPx = 0;
    middleLeftPx = 0;
    middleRightPx = 0;
    topLeftPx = 0;
    topRightPx = 0;
    bottomLeftSidePx = 0;
    bottomRightSidePx = 0;
    bottomLeftPx2 = 0;
    bottomRightPx2 = 0;

    // vitesses mouvements et jump player
    pvx = 350;
    pvy = 0;
    pay = 0;
    falling = false;
    moveRight = false;
    moveLeft = false;
    jumping = false;
    keys = [];

    // box position et vitesses
    boxpx = 1520;
    boxpy = 50;
    boxvx = 0;
    boxvy = 0;

    // box sprite
    boxSpritex = boxpx;
    boxSpritey = boxpy;

    // pixels boite
    bottomLeftBoxPx = 0;
    bottomRightBoxPx = 0;
    bottomLeftBoxPx2 = 0;
    bottomRightBoxPx2 = 0;

    oldBgx = 0;
    newBgx = 0;
    boxdpx = 0;

    boxpay = 0;

    t0 = performance.now();
    t1 = 0;
    dt = 0;

    gameLoop();
}

function conditionWin()
{
    if (bottomLeftSidePx[0]  == 0 && // vérification si sur du vert (gagné)
        bottomLeftSidePx[1]    == 255 && 
        bottomLeftSidePx[2]    == 0 ||
        bottomRightSidePx[0]   == 0 &&
        bottomRightSidePx[1]   == 255 && 
        bottomRightSidePx[2]   == 0){

        win = true;
        stopGame();
    }
}

function conditionLose()
{
    if (bottomLeftPx[0]  == 255 && // vérification si sur du violet (perdu)
        bottomLeftPx[1]    == 0 && 
        bottomLeftPx[2]    == 255 ||
        bottomRightPx[0]   == 255 &&
        bottomRightPx[1]   == 0 && 
        bottomRightPx[2]   == 255 ||
        py + pHeight >= H){

        lose = true;
        stopGame();
    }
}

function gameLoop() {
    if (!jeu2InputsBound) {
        jeu2InputsBound = true;
        window.addEventListener("mousedown", initJump);
        window.addEventListener("keydown", startMoving);
        window.addEventListener("keyup", stopMoving);
        window.addEventListener("touchstart", initJump);
        window.addEventListener("deviceorientation", playerControl, true);
    }

    variablesTemps();

    affichage();

    player();

    box();

    bumper();

    conditionWin();

    conditionLose();

    rafId = window.requestAnimationFrame(gameLoop);
}

function playSound(sound)
{
    sound.pause();
    sound.load();
    sound.play();
}

function variablesTemps(){
    t1 = performance.now();
    dt = (t1 - t0) / 1000;
    t0 = performance.now();
}

function affichage()
{
    affichageCollisions();

    affichageSprites();
}

function affichageCollisions()
{
    ctxCollisionZone.clearRect(0, 0, W, H);

    // player
    ctxCollisionZone.fillStyle = "lightgrey";
    ctxCollisionZone.fillRect(px, py, pWidth, pHeight);

    // box
    ctxCollisionZone.fillStyle = "rgb(255, 126, 0)";
    ctxCollisionZone.fillRect(boxpx, boxpy, boxWidth, boxHeight);

    // fond
    ctxCollisionZone.drawImage(bgCollisions, bgSpritex, bgSpritey, bgSpriteSizex, bgSpriteSizey);
}

function affichageSprites()
{
    ctxPlayerZone.clearRect(0, 0, W, H);
    ctxPlayZone.clearRect(0, 0, W, H);

    // fond
    ctxPlayZone.drawImage(bgImg, bgSpritex, bgSpritey, bgSpriteSizex, bgSpriteSizey);
    ctxPlayZone.drawImage(bgSprite, bgSpritex, bgSpritey, bgSpriteSizex, bgSpriteSizey);

    // box
    boxSpritex = boxpx;
    boxSpritey = boxpy;
    ctxPlayerZone.drawImage(boxSprite, boxSpritex, boxSpritey, boxSpriteWidth, boxSpriteHeight);

    // player
    playerSpritex = px;
    playerSpritey = py;
    if (retourner){
        if (jumping){
            ctxPlayerZone.drawImage(playerSpriteLeft, 
            plJumpx, plJumpy, plJumpWidth, plJumpHeight, 
            playerSpritex, playerSpritey, playerSpriteWidth, playerSpriteHeight);
        }
        else if (pushing){
            ctxPlayerZone.drawImage(playerSpriteLeft, 
            plPushx, plPushy, plPushWidth, plPushHeight, 
            playerSpritex, playerSpritey, playerSpriteWidth, playerSpriteHeight);
        }
        else if (moveLeft){
            if (runInterval < 0)
                runInterval = setInterval(running, 150);

            if (runEtape == 0){
                ctxPlayerZone.drawImage(playerSpriteLeft, 
                plRun0x, plRun0y, plRun0Width, plRun0Height, 
                playerSpritex, playerSpritey, playerSpriteWidth, playerSpriteHeight);
            }
            else if (runEtape == 1){
                ctxPlayerZone.drawImage(playerSpriteLeft, 
                plRun1x, plRun1y, plRun1Width, plRun1Height, 
                playerSpritex, playerSpritey, playerSpriteWidth, playerSpriteHeight);
            }
            else if (runEtape == 2){
                ctxPlayerZone.drawImage(playerSpriteLeft, 
                plRun2x, plRun2y, plRun2Width, plRun2Height, 
                playerSpritex, playerSpritey, playerSpriteWidth, playerSpriteHeight);
            }
        }
        else{
            ctxPlayerZone.drawImage(playerSpriteLeft, 
            plIdlex, plIdley, plIdleWidth, plIdleHeight, 
            playerSpritex, playerSpritey, playerSpriteWidth, playerSpriteHeight);
        }
    }
    else{
        if (jumping){
            ctxPlayerZone.drawImage(playerSpriteRight, 
            prJumpx, prJumpy, prJumpWidth, prJumpHeight, 
            playerSpritex, playerSpritey, playerSpriteWidth, playerSpriteHeight);
        }
        else if (pushing){
            ctxPlayerZone.drawImage(playerSpriteRight, 
            prPushx, prPushy, prPushWidth, prPushHeight, 
            playerSpritex, playerSpritey, playerSpriteWidth, playerSpriteHeight);
        }
        else if (moveRight){
            if (runInterval < 0)
                runInterval = setInterval(running, 150);

            if (runEtape == 0){
                ctxPlayerZone.drawImage(playerSpriteRight, 
                prRun0x, prRun0y, prRun0Width, prRun0Height, 
                playerSpritex, playerSpritey, playerSpriteWidth, playerSpriteHeight);
            }
            else if (runEtape == 1){
                ctxPlayerZone.drawImage(playerSpriteRight, 
                prRun1x, prRun1y, prRun1Width, prRun1Height, 
                playerSpritex, playerSpritey, playerSpriteWidth, playerSpriteHeight);
            }
            else if (runEtape == 2){
                ctxPlayerZone.drawImage(playerSpriteRight, 
                prRun2x, prRun2y, prRun2Width, prRun2Height, 
                playerSpritex, playerSpritey, playerSpriteWidth, playerSpriteHeight);
            }
        }
        else{
            ctxPlayerZone.drawImage(playerSpriteRight, 
            prIdlex, prIdley, prIdleWidth, prIdleHeight, 
            playerSpritex, playerSpritey, playerSpriteWidth, playerSpriteHeight);
        }
    }
}

function running()
{
    if (runEtape < 2)
        runEtape += 1;
    else
        runEtape = 0;

    if(moveRight == false && moveLeft == false){
        clearInterval(runInterval);
        runInterval = -1;
        runEtape = 0;
    }
}

function initJump()
{
    if (pvy == 0){
        pvy = -aJump;  // Impulsion de saut fixe (indépendante du dt)
        playSound(jumpSound);
    }
}

function bumper()
{
    if ((pvy == 0 &&
        bottomLeftPx[0]  == 255 && 
        bottomLeftPx[1]    == 255 && 
        bottomLeftPx[2]    == 0 ||
        bottomRightPx[0]   == 255 &&
        bottomRightPx[1]   == 255 && 
        bottomRightPx[2]   == 0) ||
        (pvy == 0 &&
        bottomLeftSidePx[0]  == 255 && 
        bottomLeftSidePx[1]    == 255 && 
        bottomLeftSidePx[2]    == 0 ||
        bottomRightSidePx[0]   == 255 &&
        bottomRightSidePx[1]   == 255 && 
        bottomRightSidePx[2]   == 0)){
    pvy = -bumpJump;
    playSound(jumpSound);
    }
}

function player()
{
    ppx1 = ctxCollisionZone.getImageData((px + 1), (py + pHeight + 1), 1, 1);
    bottomLeftPx = ppx1.data;
    ppx2 = ctxCollisionZone.getImageData((px + pWidth - 1), (py + pHeight + 1), 1, 1);
    bottomRightPx = ppx2.data;

    ppx3 = ctxCollisionZone.getImageData((px - 1), (py + (pHeight / 2)), 1, 1);
    middleLeftPx = ppx3.data;
    ppx4 = ctxCollisionZone.getImageData((px + pWidth + 1), (py + (pHeight / 2)), 1, 1);
    middleRightPx = ppx4.data;

    ppx5 = ctxCollisionZone.getImageData(px, (py - 1), 1, 1);
    topLeftPx = ppx5.data;
    ppx6 = ctxCollisionZone.getImageData((px + pWidth), (py - 1), 1, 1);
    topRightPx = ppx6.data;

    ppx7 = ctxCollisionZone.getImageData((px - 1), (py + pHeight - 5), 1, 1);
    bottomLeftSidePx = ppx7.data;
    ppx8 = ctxCollisionZone.getImageData((px + pWidth + 1), (py + pHeight - 5), 1, 1);
    bottomRightSidePx = ppx8.data;


    pay = gravity;

    if (!(bottomLeftPx[0]  == 255 && // vérification si sur du rouge (plateforme)
    bottomLeftPx[1]    == 0 && 
    bottomLeftPx[2]    == 0 ||
    bottomRightPx[0]   == 255 &&
    bottomRightPx[1]   == 0 && 
    bottomRightPx[2]   == 0 ||
    bottomLeftPx[0]  == 255 && // vérification si sur du jaune (jump)
    bottomLeftPx[1]    == 255 && 
    bottomLeftPx[2]    == 0 ||
    bottomRightPx[0]   == 255 &&
    bottomRightPx[1]   == 255 && 
    bottomRightPx[2]   == 0 ||
    bottomLeftPx[0]  == 255 && // vérification si sur du orange (box)
    bottomLeftPx[1]    == 126 && 
    bottomLeftPx[2]    == 0 ||
    bottomRightPx[0]   == 255 &&
    bottomRightPx[1]   == 126 && 
    bottomRightPx[2]   == 0)){
        jumping = true;
        if (py < 0)
            pvy = pay * dt;
        else
            pvy += Math.round(pay * dt);
    }
    else if (pvy > 0){
        pvy = 0;
        jumping = false;

        // verification des pixels
        ppx9 = ctxCollisionZone.getImageData((px + 1), (py + pHeight), 1, 1);
        bottomLeftPx2 = ppx9.data;
        ppx10 = ctxCollisionZone.getImageData((px + pWidth - 1), (py + pHeight), 1, 1);
        bottomRightPx2 = ppx10.data;

        // remonte le personnage sur la plateforme
        while ((bottomLeftPx2[0]  == 255 && // vérification si sur du rouge (plateforme)
        bottomLeftPx2[1]    == 0 && 
        bottomLeftPx2[2]    == 0) ||
        (bottomRightPx2[0]   == 255 &&
        bottomRightPx2[1]   == 0 && 
        bottomRightPx2[2]   == 0) ||
        (bottomLeftPx2[0]  == 255 && // vérification si sur du orange (box)
        bottomLeftPx2[1]    == 126 && 
        bottomLeftPx2[2]    == 0) ||
        (bottomRightPx2[0]   == 255 &&
        bottomRightPx2[1]   == 126 && 
        bottomRightPx2[2]   == 0)){
            py -= 1;

            // reverifie les pixels
            ppx9 = ctxCollisionZone.getImageData((px + 1), (py + pHeight), 1, 1);
            bottomLeftPx2 = ppx9.data;
            ppx10 = ctxCollisionZone.getImageData((px + pWidth - 1), (py + pHeight), 1, 1);
            bottomRightPx2 = ppx10.data;
        }
    }

    py += pvy * dt;

    playerMove();
}

function box()
{
    ppxBox1 = ctxCollisionZone.getImageData(boxpx, (boxpy + boxHeight + 1), 1, 1);
    bottomLeftBoxPx = ppxBox1.data;
    ppxBox2 = ctxCollisionZone.getImageData((boxpx + boxWidth), (boxpy + boxHeight + 1), 1, 1);
    bottomRightBoxPx = ppxBox2.data;


    boxay = gravity;


    if (!(bottomLeftBoxPx[0]  == 255 && // vérification si sur du rouge (plateforme)
    bottomLeftBoxPx[1]    == 0 && 
    bottomLeftBoxPx[2]    == 0 ||
    bottomRightBoxPx[0]   == 255 &&
    bottomRightBoxPx[1]   == 0 && 
    bottomRightBoxPx[2]   == 0 || 
    boxpx > W || 
    boxpx < 0 || 
    (boxpy + boxHeight) >= H)){
        boxvy += Math.round(boxay * dt);
    }
    else if (boxvy > 0){
        boxvy = 0;

        ppxBox3 = ctxCollisionZone.getImageData(boxpx, (boxpy + boxHeight), 1, 1);
        bottomLeftBoxPx2 = ppxBox3.data;
        ppxBox4 = ctxCollisionZone.getImageData((boxpx + boxWidth), (boxpy + boxHeight), 1, 1);
        bottomRightBoxPx2 = ppxBox4.data;

        while (bottomLeftBoxPx2[0]  == 255 && // vérification si sur du rouge (plateforme)
        bottomLeftBoxPx2[1]    == 0 && 
        bottomLeftBoxPx2[2]    == 0 ||
        bottomRightBoxPx2[0]   == 255 &&
        bottomRightBoxPx2[1]   == 0 && 
        bottomRightBoxPx2[2]   == 0 || 
        (boxpy + boxHeight) >= H){
            boxpy -= 1;

            ppxBox3 = ctxCollisionZone.getImageData(boxpx, (boxpy + boxHeight), 1, 1);
            bottomLeftBoxPx2 = ppxBox3.data;
            ppxBox4 = ctxCollisionZone.getImageData((boxpx + boxWidth), (boxpy + boxHeight), 1, 1);
            bottomRightBoxPx2 = ppxBox4.data;
        }
    }

    boxpy += Math.round(boxvy * dt);

    if (moveRight == true && bgSpritex > - bgSpriteSizex + W + 10 && moveRight == true && px >= 100){
        // px += pvx * dt;
        boxpx -= pvx * dt;
    }
    else if (moveRight == true && bgSpritex <= - bgSpriteSizex + W + 10 || moveRight == true && px < 100){
        // px += pvx * dt;
    }

    if (moveLeft == true && bgSpritex < 0  && moveLeft == true && px <= 100){
        // px -= pvx * dt;
        boxpx += pvx * dt;
    }
}

function playerControl(event)
{
    let gamma = event.gamma;
    let beta = event.beta;

    // console.log(gamma, beta);

    // activer mouvement
    if (gamma > gammaMove)
        moveRight = true;
    if (gamma < -gammaMove)
        moveLeft = true;
    
    // desactiver mouvement
    if (gamma < gammaMove)
        moveRight = false;
    if (gamma > -gammaMove)
        moveLeft = false;
    
}

// fonction pour commencer a bouger avec touches pc
function startMoving(event)
{
    let index = keys.indexOf(event.key);
    if (index > -1){
        return;
    }
    else {
        keys.push(event.key);
        switch(event.key){
            case "ArrowRight":
                moveRight = true;
                break;
            case "d":
                moveRight = true;
                break;
            case "ArrowLeft":
                moveLeft = true;
                break;
            case "q":
                moveLeft = true;
                break;
        }
    }   
}

// fonction pour arreter de bouger avec touches pc
function stopMoving(event)
{
    let index = keys.indexOf(event.key);
    if (index >= -1){
        keys.splice(index, 1);
    }

    switch(event.key){
        case "ArrowRight":
            moveRight = false;
            break;
        case "d":
            moveRight = false;
            break;
        case "ArrowLeft":
            moveLeft = false;
            break;
        case "q":
            moveLeft = false;
            break;
    }
}

function playerMove()
{
    pushing = false
    pvx = 325;
    if (bottomLeftSidePx[0]  == 255 && // vérification si sur du rouge (plateforme)
        bottomLeftSidePx[1]    == 0 && 
        bottomLeftSidePx[2]    == 0 ||
        middleLeftPx[0]  == 255 &&
        middleLeftPx[1]    == 0 && 
        middleLeftPx[2]    == 0 ||
        topLeftPx[0]  == 255 &&
        topLeftPx[1]    == 0 && 
        topLeftPx[2]    == 0)
        moveLeft = false;
    else if (bottomLeftSidePx[0]  == 255 && // vérification si sur du orange (box)
        bottomLeftSidePx[1]    == 126 && 
        bottomLeftSidePx[2]    == 0 ||
        middleLeftPx[0]  == 255 &&
        middleLeftPx[1]    == 126 && 
        middleLeftPx[2]    == 0 ||
        topLeftPx[0]  == 255 &&
        topLeftPx[1]    == 126 && 
        topLeftPx[2]    == 0)
        moveLeft = false;

    if (bottomRightSidePx[0]  == 255 && // vérification si sur du rouge (plateforme)
        bottomRightSidePx[1]    == 0 && 
        bottomRightSidePx[2]    == 0 ||
        middleRightPx[0]  == 255 &&
        middleRightPx[1]    == 0 && 
        middleRightPx[2]    == 0 ||
        topRightPx[0]  == 255 &&
        topRightPx[1]    == 0 && 
        topRightPx[2]    == 0 ||
        topRightPx[0]  == 0 && // vérification si sur du vert (fin de map)
        topRightPx[1]    == 255 && 
        topRightPx[2]    == 0)
        moveRight = false;
    else if (bottomRightSidePx[0]  == 255 && // vérification si sur du orange (box)
        bottomRightSidePx[1]    == 126 && 
        bottomRightSidePx[2]    == 0 ||
        middleRightPx[0]  == 255 &&
        middleRightPx[1]    == 126 && 
        middleRightPx[2]    == 0 ||
        topRightPx[0]  == 255 &&
        topRightPx[1]    == 126 && 
        topRightPx[2]    == 0)
        if (moveRight == true){
            // bgSpritex -= (pvx / 1.5) * dt;
            // boxpx += (pvx / 1.5) * dt;
            // moveRight = false;

            pvx = 325 / 2.5;
            boxpx = px + pWidth;

            pushing = true;
        }
        else
            moveRight = false;

    if (moveRight == true && bgSpritex > - bgSpriteSizex + W + 10 && moveRight == true && px >= 100){
        // px += pvx * dt;
        bgSpritex -= pvx * dt;
    }
    else if (moveRight == true && bgSpritex <= - bgSpriteSizex + W + 10 || moveRight == true && px < 100){
        // console.log("tf", px, W - pWidth);
        if (px < W - pWidth)
            px += pvx * dt;
        else
            px += W - pWidth;
    }
    else if (moveLeft == true && px >= W - pWidth){
        px = W - pWidth;
    }

    if (moveLeft == true && bgSpritex < 0  && moveLeft == true && px <= 100){
        // px -= pvx * dt;
        bgSpritex += pvx * dt;
    }
    else if (moveLeft == true && bgSpritex >= 0 || moveLeft == true && px > 100){
        if (px > 0)
            px -= pvx * dt;
        else
            px = 0;
    }
    else if (moveLeft == true && px <= 0){
        px = 0;
    }

    // direction sprite
    if (moveRight == true)
        retourner = false;
    else if (moveLeft == true)
        retourner = true;
}

(function () {
    var btn = document.getElementById("btnContinuerJeu2");
    if (!btn) return;
    btn.addEventListener("click", function () {
        if (window.parent && window.parent !== window) {
            window.parent.postMessage(
                { source: "plateforme402-game2", type: "plateforme402:game-end" },
                "*"
            );
        }
    });
})();