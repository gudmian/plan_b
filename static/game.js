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

setInterval(() => {
    socket.emit("change state", movement);
}, 1000 / 60);

socket.on("render", (state) => {
    console.log("Rendering...")
    dynamcCanvas.clearRect(0, 0, dynamcCanvas.width, dynamcCanvas.height)
    function renderPlayers() {
        dynamicContext.fillStyle = "red"
        for (player of state){
            dynamicContext.beginPath();
            dynamicContext.arcTo(player.posX, player.posY, player.radius, 0, 1.5 * Math.PI)
            dynamicContext.fill()
        }
    }

    function renderItems() {

    }

    function renderBullets() {

    }

    renderPlayers();
});

socket.on("render static", (map) => {
    console.log("Rendering static...")
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

