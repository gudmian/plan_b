"use sctrict"

let socket = io();
const staticCanvas = document.getElementById("layer1");
const dynamcCanvas = document.getElementById("layer2")
let staticContext = staticCanvas.getContext("2d");
let dynamicContext = dynamcCanvas.getContext("2d");
staticCanvas.width = 800;
dynamcCanvas.width = 800;
staticCanvas.height = 800;
dynamcCanvas.height = 800;

socket.emit("new player");

let movement = {
    mouse_angle: 0,
    mouse_down: false,
    mouse_wheel: 0,
    up: false,
    down: false,
    left: false,
    right: false
};

let options =
    {
        sens: 0.00000001
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
    dynamcCanvas.addEventListener("click", function(event)
    {
        dynamcCanvas.requestPointerLock();
    }, false);

    // Mouse handling code
    // When the mouse is pressed it rotates the players view
    dynamcCanvas.addEventListener("mouseup", function(event)
    {
        movement.mouse_down = false;
    }, false);

    dynamcCanvas.addEventListener("mousedown", function(event)
    {
        movement.mouse_down = true;
    }, false);

    dynamcCanvas.addEventListener("mousemove", function(event)
    {
        if (event.movementX !== undefined)
            movement.mouse_angle += event.movementX;
        else
            movement.mouse_angle = event.pageX;
    }, false);
}

initMouseEvents();

setInterval(() => {
    socket.emit("change state", movement);
}, 1000 / 60);

socket.on("render", (state) => {
    console.log("Rendering...")
    dynamicContext.clearRect(0, 0, dynamcCanvas.width, dynamcCanvas.height)

    function renderPlayers() {
        dynamicContext.fillStyle = "red";
        let players = state.playersInf;
        for (id in players) {
            let player = players[id];
            dynamicContext.beginPath();
            dynamicContext.arc(player.posX, player.posY, player.radius, player.angle, 1.5 * Math.PI+player.angle);
            dynamicContext.fill()
        }
    }

    function renderItems() {

    }

    function renderBullets() {
        dynamicContext.fillStyle = "blue";
        let bullets = state.bulletsInf;
        for (id in bullets) {
            for(let bullet of bullets[id]){
                dynamicContext.beginPath();
                dynamicContext.arc(bullet.posX, bullet.posY, bullet.size, 0, 2 * Math.PI);
                dynamicContext.fill()
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
                staticContext.fillStyle = "green";
                staticContext.fillRect(cell.posX, cell.posY, cell.size, cell.size);
            }
        }
    }
});

