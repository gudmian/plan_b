"use sctrict"

let socket = io();
const staticCanvas = document.getElementById("layer1");
const dynamicCanvas = document.getElementById("layer2");
let currentHeight = document.getElementById("layer1").offsetHeight;
console.log("height = ", currentHeight);
let staticContext = staticCanvas.getContext("2d");
let dynamicContext = dynamicCanvas.getContext("2d");
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
    }
    console.log("in key down");

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
    }
    console.log("in key up");
});




function initMouseEvents() {
    // Mouse handling code
    // When the mouse is pressed it rotates the players view
    dynamcCanvas.addEventListener("mouseup", function(event)
    {
        movement.mouse_down = false;
    }, false);

    dynamicCanvas.addEventListener("mousedown", function(event)
    {
        movement.mouse_down = true;
    }, false);

    dynamicCanvas.addEventListener("mousemove", function(event)
    {
        if(event.offsetX) {
            movement.mouse_X = event.offsetX * staticCanvas.width/currentHeight;
            movement.mouse_Y = event.offsetY * staticCanvas.height/currentHeight;
        }
        else if(event.layerX) {
            movement.mouse_X = event.layerX;
            movement.mouse_Y = event.layerY;
        }

    }, false);
}

initMouseEvents();

setInterval(() => {
    socket.emit("change state", movement);
}, 1000/60);

socket.on("render", (state) => {
    console.log("Rendering...")
    dynamicContext.clearRect(0, 0, dynamicCanvas.width, dynamicCanvas.height)
	var TO_RADIANS = Math.PI/180;

    function renderPlayers() {
        //dynamicContext.fillStyle = "red";
        let players = state.playersInf;
		tex_player = new Image;
		tex_player.src = "static/textures/players/apier.png";
		tex_player.onload = function () {
            for (let id in players) {
                let player = players[id];
                if (socket.id == id) {
					dynamicContext.fillStyle = "#00F";
					dynamicContext.font = "italic 10pt Arial";
					dynamicContext.fillText(player.health, player.posX-15, player.posY-20);
                }
				let dx = player.posX;
				let dy = player.posY;
                dynamicContext.save();
				dynamicContext.translate(dx,dy);
                dynamicContext.rotate(2 * Math.PI + player.angle);
				dynamicContext.translate(-dx,-dy);
				dynamicContext.drawImage(tex_player, player.posX-15, player.posY-15, 30, 30);
                dynamicContext.restore();
			}
        }
    }

    function renderItems() {

    }

    function renderBullets() {
        dynamicContext.fillStyle = "blue";
        let bullets = state.bulletsInf;
        for (let id in bullets) {
            for(let bullet of bullets[id]){
                dynamicContext.beginPath();
                dynamicContext.arc(bullet.posX, bullet.posY, bullet.radius, 0, 2 * Math.PI);
                dynamicContext.fill();
                dynamicContext.closePath();
            }
        }
    }

    renderPlayers();
    renderBullets();
});

socket.on("render static", (map) => {
    console.log("Rendering static...");
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

