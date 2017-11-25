"use sctrict"

let socket = io();
const staticCanvas = document.getElementById("layer1");
const dynamicCanvas = document.getElementById("layer2");
const abilitiesCanvas = document.getElementById("layer3");
let currentHeight = document.getElementById("layer1").offsetHeight;
let staticContext = staticCanvas.getContext("2d");
let dynamicContext = dynamicCanvas.getContext("2d");
let abilitiesContext = abilitiesCanvas.getContext("2d");
staticCanvas.width = 800;
dynamicCanvas.width = 800;
staticCanvas.height = 800;
dynamicCanvas.height = 800;

socket.emit("new player");

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
    }, false);

    dynamicCanvas.addEventListener("mousedown", function (event) {
        movement.mouse_down = true;
    }, false);

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

setInterval(() => {
    socket.emit("change state", movement);
}, 1000 / 60);


//vision parameters
let visionWidth = 500;
let visionHeigth = 500;

function isInVision(x, y, player) {
    if (player !== undefined){
        if (x > (player.posX - visionWidth / 2) && x < (player.posX + visionWidth / 2) &&
            y > (player.posY - visionHeigth / 2) && y < (player.posY + visionHeigth / 2)) {
            return true;
        }
        else{
            return false;
        }
    }
    else{
        return false;
    }
}

socket.on("render", (state) => {
	let tex_player = new Image();
	tex_player.src = "static/textures/players/apier.png";
	let tex_player2 = new Image();
	tex_player2.src = "static/textures/players/greenier.png";
	let tex_player3 = new Image();
	tex_player3.src = "static/textures/players/iceer.png";
	let tex_weaponSimple = new Image();
	tex_weaponSimple.src = "static/textures/weapons/pistol.png";
	let tex_weaponMedium = new Image();
	tex_weaponMedium.src = "static/textures/weapons/medium.png";
	let tex_weaponStrong = new Image();
	tex_weaponStrong.src = "static/textures/weapons/strong.png";

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
                if (isInVision(player.posX, player.posY, players[socket.id])){
                    if (player.health < 30) {
                        dynamicContext.fillStyle = "red";
                    }
                    else {
                        dynamicContext.fillStyle = "#00F";
                    }
                    dynamicContext.font = "italic 10pt Arial";
                    dynamicContext.fillText(player.health, player.posX - 15, player.posY - 20);

                    let dx = player.posX;
                    let dy = player.posY;
                    dynamicContext.save();
                    dynamicContext.translate(dx, dy);
                    dynamicContext.rotate(2 * Math.PI + player.angle);
                    dynamicContext.translate(-dx, -dy);
                    // if (tex_playerLoaded)
                    if (player.currentWeapon.name == "simple") dynamicContext.drawImage(tex_weaponSimple, player.posX, player.posY, 20, 10);
                    if (player.currentWeapon.name == "medium") dynamicContext.drawImage(tex_weaponMedium, player.posX, player.posY, 30, 15);
                    if (player.currentWeapon.name == "strong") dynamicContext.drawImage(tex_weaponStrong, player.posX, player.posY, 40, 15);
                    if (player.skin === 0) dynamicContext.drawImage(tex_player, player.posX - 15, player.posY - 15, 30, 30);
                    if (player.skin === 1) dynamicContext.drawImage(tex_player2, player.posX - 15, player.posY - 15, 30, 30);
                    if (player.skin === 2) dynamicContext.drawImage(tex_player3, player.posX - 15, player.posY - 15, 30, 30);
                    dynamicContext.restore();
                }
            }
        // }
    }

	abilitiesContext.clearRect(0, 0, 800, 800);
	function renderWeaponName() {
		let players = state.playersInf;
		for (let id in players) {
			let player = players[id];

			if (socket.id == id) {
			    abilitiesContext.beginPath();
				abilitiesContext.fillStyle = "red";
				abilitiesContext.font = "bold 14pt Arial";
				abilitiesContext.fillText(player.id, 50, 20);
				abilitiesContext.fillText("Weapon: ", 10, 40);
				abilitiesContext.fillText(player.currentWeapon.name, 100, 40);
				abilitiesContext.fillText("Patrons: ", 10, 60);
				abilitiesContext.fillText(player.currentWeapon.patrons, 100, 60);
				abilitiesContext.fillText("skin: ", 10, 80);
				abilitiesContext.fillText(player.skin, 100, 80);
				abilitiesContext.closePath();
			}
		}
	}

    
    function renderPowerups() {
        let pwrups = state.powerupInf;

        let tex_mediumWeapon = new Image();
        tex_mediumWeapon.src = "static/textures/powerUp/mediumWeapon.png";
		let tex_strongWeapon = new Image();
		tex_strongWeapon.src = "static/textures/powerUp/strongWeapon.png";
		let tex_patrons = new Image();
		tex_patrons.src = "static/textures/powerUp/patronsWeapon.png";
		let tex_health = new Image();
		tex_health.src = "static/textures/powerUp/heart.png";
		let tex_shield = new Image();
		tex_shield.src = "static/textures/powerUp/shield.png";
		let tex_speed = new Image();
		tex_speed.src = "static/textures/powerUp/speed.png";
		let tex_berserk = new Image();
		tex_berserk.src = "static/textures/powerUp/berserk.png";

        for (let pwrupId in pwrups){
            if (isInVision(pwrups[pwrupId].posX, pwrups[pwrupId].posY, state.playersInf[socket.id])) {
                dynamicContext.beginPath();
                switch (pwrups[pwrupId].type){
                    case 1: dynamicContext.drawImage(tex_mediumWeapon, pwrups[pwrupId].posX - 15, pwrups[pwrupId].posY - 15, 30, 30);
                        break;
                    case 2: dynamicContext.drawImage(tex_strongWeapon, pwrups[pwrupId].posX - 15, pwrups[pwrupId].posY - 15, 30, 30);
                        break;
                    case 3: dynamicContext.drawImage(tex_patrons, pwrups[pwrupId].posX - 15, pwrups[pwrupId].posY - 15, 30, 30);
                        break;
                    case 4: dynamicContext.drawImage(tex_health, pwrups[pwrupId].posX - 15, pwrups[pwrupId].posY - 15, 30, 30);
                        break;
                    case 5: dynamicContext.drawImage(tex_shield, pwrups[pwrupId].posX - 15, pwrups[pwrupId].posY - 15, 30, 30);
                        break;
                    case 6: dynamicContext.drawImage(tex_speed, pwrups[pwrupId].posX - 15, pwrups[pwrupId].posY - 15, 30, 30);
                        break;
                    case 7: dynamicContext.drawImage(tex_berserk, pwrups[pwrupId].posX - 15, pwrups[pwrupId].posY - 15, 30, 30);
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
                    dynamicContext.arc(bullet.posX, bullet.posY, bullet.radius, 0, 2 * Math.PI);
                    dynamicContext.fill();
                    dynamicContext.closePath();
                }
            }
        }
    }

    renderPlayers();
    renderBullets();
    renderWeaponName();
    renderPowerups();
});

socket.on("render static", (map) => {
    let cellMatrix = map.cellMatrix;
    for (let i = 0; i < map.levelSize; i++) {
        for (let j = 0; j < map.levelSize; j++) {
            let cell = map.cellMatrix[i][j];
            if (cell.isBlock) {
                staticContext.fillStyle = "black";
                staticContext.fillRect(cell.posX, cell.posY, cell.size, cell.size);
            }
            else {
                ground = new Image();
                ground.src = "static/textures/grass00.png";
                ground.onload = function () {
                    staticContext.drawImage(ground, cell.posX, cell.posY, cell.size, cell.size)
                }
            }
        }
    }
});

