"use strict"

let socket = io();
const audioShoot = document.getElementById("shoot");
const audioRespawn = document.getElementById("respawn");
const staticCanvas = document.getElementById("layer1");
const dynamicCanvas = document.getElementById("layer2");
const abilitiesCanvas = document.getElementById("layer3");
const scoreCanvas = document.getElementById("layer4");
let currentHeight = document.getElementById("layer1").offsetHeight;
let staticContext = staticCanvas.getContext("2d");
let dynamicContext = dynamicCanvas.getContext("2d");
let abilitiesContext = abilitiesCanvas.getContext("2d");
let scoreContext = scoreCanvas.getContext("2d");
staticCanvas.width = 500;
dynamicCanvas.width = 500;
staticCanvas.height = 500;
dynamicCanvas.height = 500;
let isNeedRender = true;
var winnerLR = "";

var url_string = window.location.href;
var url = new URL(url_string);
var nickname = url.searchParams.get("nickname");

socket.emit("new player", nickname);
if (document.getElementById("sounds").checked === true) {
    audioRespawn.play();
}

let movement = {
    mouse_X: 0,
    mouse_Y: 0,
    mouse_down: false,
    mouse_wheel: 0,
    up: false,
    down: false,
    left: false,
    right: false
};

document.cancelFullScreen = document.cancelFullScreen || document.webkitCancelFullScreen || document.mozCancelFullScreen;

function onFullScreenEnter() {
};

function onFullScreenExit() {
};

// Note: FF nightly needs about:config full-screen-api.enabled set to true.
function enterFullscreen(id) {
    onFullScreenEnter(id);
    var el = document.getElementById(id);
    el.style.position = "static";
    el.style.height = window.height;
    var onfullscreenchange = function (e) {
        var fullscreenElement = document.fullscreenElement || document.mozFullscreenElement || document.webkitFullscreenElement;
        var fullscreenEnabled = document.fullscreenEnabled || document.mozFullscreenEnabled || document.webkitFullscreenEnabled;
    }
    el.addEventListener("webkitfullscreenchange", onfullscreenchange);
    el.addEventListener("mozfullscreenchange", onfullscreenchange);
    el.addEventListener("fullscreenchange", onfullscreenchange);
    if (el.webkitRequestFullScreen) {
        el.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
    } else {
        el.mozRequestFullScreen();
    }
    document.querySelector('#' + id + ' button').onclick = function () {
        exitFullscreen(id);
    }
}

function exitFullscreen(id) {
    onFullScreenExit(id);
    document.cancelFullScreen();
    document.querySelector('#' + id + ' button').onclick = function () {
        enterFullscreen(id);
    }
}

document.addEventListener('keydown', (event) => {
    switch (event.keyCode) {
        case 65: // A
            movement.left = true;
            break;
        case 87: // W
            movement.up = true;
            break;
        case 68: // D
            movement.right = true;
            break;
        case 83: // S
            movement.down = true;
            break;
        case 107:   //+
            movement.add = true;
            break;
        case 109:   //-
            movement.del = true;
            break;
    }

});

document.addEventListener('keyup', (event) => {
    switch (event.keyCode) {
        case 65: // A
            movement.left = false;
            break;
        case 87: // W
            movement.up = false;
            break;
        case 68: // D
            movement.right = false;
            break;
        case 83: // S
            movement.down = false;
            break;
        case 107:   //+
            movement.add = false;
            break;
        case 109:   //-
            movement.del = false;
            break;
    }
});


function initMouseEvents() {
    // Mouse handling code
    // When the mouse is pressed it rotates the players view

    // dynamicCanvas.addEventListener("click", function(event)
    // {
    //     dynamicCanvas.requestPointerLock();
    // }, false);

    dynamicCanvas.addEventListener("mouseup", function (event) {
        movement.mouse_down = false;
        if (!movement.mouse_down) {
            audioShoot.pause();
        }
    }, false);

    dynamicCanvas.addEventListener("mousedown", function (event) {
        movement.mouse_down = true;
        if (movement.mouse_down) {
            // alert(document.getElementById("sounds").checked == true);
            if (document.getElementById("sounds").checked == true) {
                audioShoot.play();
            }
        }
    }, false);

    audioShoot.addEventListener("ended", loop, false);

    function loop() {
        audioShoot.play();
    }

    dynamicCanvas.addEventListener("mousewheel", function (event) {
        movement.mouse_wheel += event.wheelDelta;
    }, false);

    dynamicCanvas.addEventListener("mousemove", function (event) {
        if (event.offsetX) {
            movement.mouse_X = event.offsetX * staticCanvas.width / currentHeight;
            movement.mouse_Y = event.offsetY * staticCanvas.height / currentHeight;
        }
        else if (event.layerX) {
            movement.mouse_X = event.offsetX * staticCanvas.width / currentHeight;
            movement.mouse_Y = event.offsetY * staticCanvas.height / currentHeight;
        }

    }, false);
}

initMouseEvents();

if (isNeedRender) {
    setInterval(() => {
        socket.emit("change state", movement);
    }, 1000 / 60);
}

//vision parameters
let visionWidth = 500;
let visionHeigth = 500;

function isInVision(x, y, player) {

    if (player !== undefined) {

        if (x > (player.posX - visionWidth / 2) && x < (player.posX + visionWidth / 2) &&
            y > (player.posY - visionHeigth / 2) && y < (player.posY + visionHeigth / 2)) {
            return true;
        }
        else {
            return false;
        }
    }
    else {
        return false;
    }
}

let maxPos = 0;

function convertPlayerPosition(pos) {
    let resPos = 0;
    if (pos < 250) {
        resPos = pos;
    }
    else if (pos + 250 > maxPos) {
        resPos = 500 - (maxPos - pos);
    }
    else {
        resPos = 250 + pos % 50;
    }
    return resPos;

}

let startXpos = 0;
let startYpos = 0;

function convertCoordX(coord) {
    return coord - startXpos;
}

function convertCoordY(coord) {
    return coord - startYpos;

}

let oldCellX = 0;
let oldCellY = 0;


socket.on("game over", (winner)=>{
	winnerLR = winner.nick;
});

socket.on("render", (state, map) => {

    let tex_player = new Image();
    tex_player.src = "../static/textures/players/apier.png";
    let tex_player2 = new Image();
    tex_player2.src = "../static/textures/players/greenier.png";
    let tex_player3 = new Image();
    tex_player3.src = "../static/textures/players/iceer.png";
    let tex_weaponSimple = new Image();
    tex_weaponSimple.src = "../static/textures/weapons/pistol.png";
    let tex_weaponMedium = new Image();
    tex_weaponMedium.src = "../static/textures/weapons/medium.png";
    let tex_weaponStrong = new Image();
    tex_weaponStrong.src = "../static/textures/weapons/strong.png";

    // var tex_playerLoaded = false;
    // tex_player.onload = function(){
    // 	tex_playerLoaded = true;
    // };

    dynamicContext.clearRect(0, 0, dynamicCanvas.width, dynamicCanvas.height);

    function renderPlayers() {

        let players = state.playersInf;
        // tex_player.onload = function () {
        for (let id in players) {
            let player = players[id];
            if (isInVision(player.posX, player.posY, players[socket.id])) {
                if (player.health < 30) {
                    dynamicContext.fillStyle = "red";
                }
                else {
                    dynamicContext.fillStyle = "#00F";
                }
                dynamicContext.font = "italic 10pt Arial";
                if (socket.id === id) {
                    dynamicContext.fillText(player.health, convertPlayerPosition(player.posX) - 15, convertPlayerPosition(player.posY) - 20);

                    let dx = convertPlayerPosition(player.posX);
                    let dy = convertPlayerPosition(player.posY);
                    dynamicContext.save();
                    dynamicContext.translate(dx, dy);
                    dynamicContext.rotate(2 * Math.PI + player.angle);
                    dynamicContext.translate(-dx, -dy);
                    // if (tex_playerLoaded)
                    if (player.currentWeapon.name == "simple") dynamicContext.drawImage(tex_weaponSimple, convertPlayerPosition(player.posX), convertPlayerPosition(player.posY), 20, 10);
                    if (player.currentWeapon.name == "medium") dynamicContext.drawImage(tex_weaponMedium, convertPlayerPosition(player.posX), convertPlayerPosition(player.posY), 30, 15);
                    if (player.currentWeapon.name == "strong") dynamicContext.drawImage(tex_weaponStrong, convertPlayerPosition(player.posX), convertPlayerPosition(player.posY), 40, 15);
                    if (player.skin === 0) dynamicContext.drawImage(tex_player, convertPlayerPosition(player.posX) - 15, convertPlayerPosition(player.posY) - 15, 30, 30);
                    if (player.skin === 1) dynamicContext.drawImage(tex_player2, convertPlayerPosition(player.posX) - 15, convertPlayerPosition(player.posY) - 15, 30, 30);
                    if (player.skin === 2) dynamicContext.drawImage(tex_player3, convertPlayerPosition(player.posX) - 15, convertPlayerPosition(player.posY) - 15, 30, 30);
                    dynamicContext.restore();
                }
                else {

                    dynamicContext.fillText(player.health, convertCoordX(player.posX) - 15, convertCoordY(player.posY) - 20);

                    let dx = convertCoordX(player.posX);
                    let dy = convertCoordY(player.posY);
                    dynamicContext.save();
                    dynamicContext.translate(dx, dy);
                    dynamicContext.rotate(2 * Math.PI + player.angle);
                    dynamicContext.translate(-dx, -dy);
                    // if (tex_playerLoaded)
                    if (player.currentWeapon.name == "simple") dynamicContext.drawImage(tex_weaponSimple, convertCoordX(player.posX), convertCoordY(player.posY), 20, 10);
                    if (player.currentWeapon.name == "medium") dynamicContext.drawImage(tex_weaponMedium, convertCoordX(player.posX), convertCoordY(player.posY), 30, 15);
                    if (player.currentWeapon.name == "strong") dynamicContext.drawImage(tex_weaponStrong, convertCoordX(player.posX), convertCoordY(player.posY), 40, 15);
                    if (player.skin === 0) dynamicContext.drawImage(tex_player, convertCoordX(player.posX) - 15, convertCoordY(player.posY) - 15, 30, 30);
                    if (player.skin === 1) dynamicContext.drawImage(tex_player2, convertCoordX(player.posX) - 15, convertCoordY(player.posY) - 15, 30, 30);
                    if (player.skin === 2) dynamicContext.drawImage(tex_player3, convertCoordX(player.posX) - 15, convertCoordY(player.posY) - 15, 30, 30);
                    dynamicContext.restore();
                }
            }
        }
        // }
    }

    abilitiesContext.clearRect(0, 0, 500, 500);

    function renderWeaponName() {
        let players = state.playersInf;
        for (let id in players) {
            let player = players[id];

            if (socket.id == id) {
                abilitiesContext.beginPath();
                abilitiesContext.fillStyle = "red";
                abilitiesContext.font = "bold 14pt Arial";
                abilitiesContext.fillText(player.name, 50, 20);
                abilitiesContext.fillText("Weapon: ", 10, 40);
                abilitiesContext.fillText(player.currentWeapon.name, 100, 40);
                abilitiesContext.fillText("Patrons: ", 10, 60);
                abilitiesContext.fillText(player.currentWeapon.patrons, 100, 60);
                abilitiesContext.fillText("skin: ", 10, 80);
                abilitiesContext.fillText(player.skin, 100, 80);
				abilitiesContext.fillText("Winner of last round: ", 10, 100);
				abilitiesContext.fillText(winnerLR, 200, 100);
                abilitiesContext.closePath();
            }
        }
    }


    function renderPowerups() {
        let pwrups = state.powerupInf;

        let tex_mediumWeapon = new Image();
        tex_mediumWeapon.src = "../static/textures/powerUp/mediumWeapon.png";
        let tex_strongWeapon = new Image();
        tex_strongWeapon.src = "../static/textures/powerUp/strongWeapon.png";
        let tex_patrons = new Image();
        tex_patrons.src = "../static/textures/powerUp/patronsWeapon.png";
        let tex_health = new Image();
        tex_health.src = "../static/textures/powerUp/heart.png";
        let tex_shield = new Image();
        tex_shield.src = "../static/textures/powerUp/shield.png";
        let tex_speed = new Image();
        tex_speed.src = "../static/textures/powerUp/speed.png";
        let tex_berserk = new Image();
        tex_berserk.src = "../static/textures/powerUp/berserk.png";

        for (let pwrupId in pwrups) {
            if (isInVision(pwrups[pwrupId].posX, pwrups[pwrupId].posY, state.playersInf[socket.id])) {
                dynamicContext.beginPath();
                switch (pwrups[pwrupId].type) {
                    case 1:
                        dynamicContext.drawImage(tex_mediumWeapon, convertCoordX(pwrups[pwrupId].posX - 15), convertCoordY(pwrups[pwrupId].posY - 15), 30, 30);
                        break;
                    case 2:
                        dynamicContext.drawImage(tex_strongWeapon, convertCoordX(pwrups[pwrupId].posX - 15), convertCoordY(pwrups[pwrupId].posY - 15), 30, 30);
                        break;
                    case 3:
                        dynamicContext.drawImage(tex_patrons, convertCoordX(pwrups[pwrupId].posX - 15), convertCoordY(pwrups[pwrupId].posY - 15), 30, 30);
                        break;
                    case 4:
                        dynamicContext.drawImage(tex_health, convertCoordX(pwrups[pwrupId].posX - 15), convertCoordY(pwrups[pwrupId].posY - 15), 30, 30);
                        break;
                    case 5:
                        dynamicContext.drawImage(tex_shield, convertCoordX(pwrups[pwrupId].posX - 15), convertCoordY(pwrups[pwrupId].posY - 15), 30, 30);
                        break;
                    case 6:
                        dynamicContext.drawImage(tex_speed, convertCoordX(pwrups[pwrupId].posX - 15), convertCoordY(pwrups[pwrupId].posY - 15), 30, 30);
                        break;
                    case 7:
                        dynamicContext.drawImage(tex_berserk, convertCoordX(pwrups[pwrupId].posX - 15), convertCoordY(pwrups[pwrupId].posY - 15), 30, 30);
                        break;
                }
                dynamicContext.closePath();
            }
        }
    }

    function renderBullets() {
        dynamicContext.fillStyle = "blue";
        let bullets = state.bulletsInf;
        for (let id in bullets) {
            for (let bullet of bullets[id]) {
                if (isInVision(bullet.posX, bullet.posY, state.playersInf[socket.id])) {
                    dynamicContext.beginPath();
                    dynamicContext.arc(convertCoordX(bullet.posX), convertCoordY(bullet.posY), bullet.radius, 0, 2 * Math.PI);
                    dynamicContext.fill();
                    dynamicContext.closePath();
                }
            }
        }
    }


    if (state.playersInf[socket.id] !== undefined && map) {
        // let deltaX = state.playersInf[socket.id].posX <= 250 ?  state.playersInf[socket.id].posX : 250 - state.playersInf[socket.id].posX;
        // let deltaY = state.playersInf[socket.id].posY <= 250 ?  state.playersInf[socket.id].posY : 250 - state.playersInf[socket.id].posY;
        // dynamicContext.translate(deltaX, deltaY);
        maxPos = map.levelSize * map.cellMatrix [0][0].size;
        let cellX = state.playersInf[socket.id].cell.i;
        let cellY = state.playersInf[socket.id].cell.j;
        if (cellX !== oldCellX || cellY !== oldCellY) {
            //render map
            let cellMatrix = map.cellMatrix;

            let startX = (cellX - 5) >= 0 ? (cellX - 5) : 0;
            let startY = (cellY - 5) >= 0 ? (cellY - 5) : 0;
            let endX = (cellX + 5) < map.levelSize ? (cellX + 5) : map.levelSize;
            let endY = (cellY + 5) < map.levelSize ? (cellY + 5) : map.levelSize;
            endX = startX === 0 ? 10 : endX;
            endY = startY === 0 ? 10 : endY;
            startX = endX === map.levelSize ? map.levelSize - 10 : startX;
            startY = endY === map.levelSize ? map.levelSize - 10 : startY;
            startXpos = map.cellMatrix[startX][startY].posX;
            startYpos = map.cellMatrix[startX][startY].posY;

            for (let i = startX; i < endX; i++) {
                for (let j = startY; j < endY; j++) {
                    let cell = map.cellMatrix[i][j];
                    if (cell.isBlock) {
                        staticContext.fillStyle = "black";
                        staticContext.fillRect(cell.size * (i - startX), cell.size * (j - startY), cell.size, cell.size);
                    }
                    else {
                        let ground = new Image();
                        ground.src = "../static/textures/grass00.png";
                        ground.onload = function () {
                            staticContext.drawImage(ground, cell.size * (i - startX), cell.size * (j - startY), cell.size, cell.size)
                        }
                    }
                }
            }

            oldCellX = state.playersInf[socket.id].cell.i;
            oldCellY = state.playersInf[socket.id].cell.j;
        }
    }
    //
    // if (state.playersInf[socket.id] !== undefined && map) {
    //     maxPos = map.levelSize * map.cellMatrix [0][0].size;
    //     let cellX = state.playersInf[socket.id].cell.i;
    //     let cellY = state.playersInf[socket.id].cell.j;
    //     let posX = state.playersInf[socket.id].posX;
    //     let posY = state.playersInf[socket.id].posY;
    //     if (posX !== oldCellX || posY !== oldCellY) {
    //         //render map
    //         let cellMatrix = map.cellMatrix;
    //         let cellSize = cellMatrix[0][0].size;
    //         let startX = (cellX - 5) > 0 ? (cellX - 5) : 0;
    //         let startY = (cellY - 5) > 0 ? (cellY - 5) : 0;
    //         let endX = (cellX + 5) < map.levelSize ? (cellX + 5) : map.levelSize;
    //         let endY = (cellY + 5) < map.levelSize ? (cellY + 5) : map.levelSize;
    //         endX = startX === 0 ? 10 : endX;
    //         endY = startY === 0 ? 10 : endY;
    //         startX = endX === map.levelSize ? map.levelSize - 10 : startX;
    //         startY = endY === map.levelSize ? map.levelSize - 10 : startY;
    //
    //         for (let i = startX; i < endX; i++) {
    //             for (let j = startY; j < endY; j++) {
    //                 let cell = map.cellMatrix[i][j];
    //                 if (cell.isBlock) {
    //                     staticContext.fillStyle = "black";
    //                     if(i===startX){
    //                         staticContext.fillRect(cell.size * (i - startX) + (posX % 50), cell.size * (j - startY), cell.size - (posX%50), cell.size);
    //                     }
    //                     if(i===endX-1){
    //                         staticContext.fillRect(cell.size * (i - startX), cell.size * (j - startY), (posX%50), cell.size);
    //                     }
    //                     if(j===startY){
    //                         staticContext.fillRect(cell.size * (i - startX), cell.size * (j - startY) + (posY % 50), cell.size, cell.size - (posY % 50));
    //                     }
    //                     if(j===endY-1){
    //                         staticContext.fillRect(cell.size * (i - startX), cell.size * (j - startY), cell.size, (posY % 50));
    //                     }
    //                     else {
    //                         staticContext.fillRect(cell.size * (i - startX) + (posX % 50), cell.size * (j - startY) + (posY % 50), cell.size, cell.size);
    //                     }
    //                 }
    //                 else {
    //                     ground = new Image();
    //                     ground.src = "../static/textures/grass00.png";
    //                     ground.onload = function () {
    //                         // staticContext.drawImage(ground, cell.size * (i - startX), cell.size * (j - startY), cell.size - posX % 50, cell.size - posY % 50)
    //                         if(j===startY){
    //                             staticContext.drawImage(ground,cell.size * (i - startX), cell.size * (j - startY), cell.size, cell.size - posY % 50);
    //                         }
    //                         if(j===endY-1){
    //                             staticContext.drawImage(ground,cell.size * (i - startX), cell.size * (j - startY), cell.size, cell.size + posY % 50);
    //                         }
    //                         if(i===startX){
    //                             staticContext.drawImage(ground,cell.size * (i - startX), cell.size * (j - startY), cell.size - posX % 50, cell.size);
    //                         }
    //                         if(i===endX-1){
    //                             staticContext.drawImage(ground,cell.size * (i - startX), cell.size * (j - startY), cell.size + posX % 50, cell.size);
    //                         }
    //                         else {
    //                             staticContext.drawImage(ground, cell.size * (i - startX), cell.size * (j - startY), cell.size, cell.size);
    //                         }
    //                     }
    //                 }
    //             }
    //         }

    scoreContext.clearRect(0, 0, 800, 800);

    function renderScores() {
        let scoresTabl = state.scores;

        var y = 10;
        for (let scoreId of scoresTabl) {

            scoreContext.beginPath();
            scoreContext.fillStyle = "blue";
            scoreContext.font = "bold 8pt Arial";
            scoreContext.fillText(scoreId.nick, 10, y);
            scoreContext.fillText(scoreId.score, 200, y);
            y += 20;
            scoreContext.closePath();
        }
        // abilitiesContext.fillText(scoresId.score, 60, 10);
    }


    renderScores();
    renderPlayers();
    renderBullets();
    renderWeaponName();
    renderPowerups();
});

socket.on("render static", (map) => {
    // let cellMatrix = map.cellMatrix;
    // for (let i = 0; i < map.levelSize; i++) {
    //     for (let j = 0; j < map.levelSize; j++) {
    //         let cell = map.cellMatrix[i][j];
    //         if (cell.isBlock) {
    //             staticContext.fillStyle = "black";
    //             staticContext.fillRect(cell.posX, cell.posY, cell.size, cell.size);
    //         }
    //         else {
    //             ground = new Image();
    //             ground.src = "../static/textures/grass00.png";
    //             ground.onload = function () {
    //                 staticContext.drawImage(ground, cell.posX, cell.posY, cell.size, cell.size)
    //             }
    //         }
    //     }
    // }
});

