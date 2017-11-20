"use sctrict"

let socket = io();
const canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 800;

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

    function renderPlayers() {

    }

    function renderItems() {

    }

    function renderBullets() {

    }
});

socket.on("render static", (map) => {
    console.log("Rendering static...")
    let cellMatrix = map.cellMatrix;
    for (let i = 0; i < map.levelSize; i++) {
        for (let j = 0; j < map.levelSize; j++) {
            let cell = map.cellMatrix[i][j];
            if(cell.isBlock){
                context.fillStyle = "black";
                context.fillRect(cell.posX, cell.posY, cell.size, cell.size);
            }
            else{
                context.fillStyle = "green";
                context.fillRect(cell.posX, cell.posY, cell.size, cell.size);
            }
        }
    }
});