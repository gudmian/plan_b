"use strict"
let http = require("http");
let path = require("path");
let express = require("express");
let logger = require("winston");
let socketIo = require("socket.io");
let Player = require("./object/player");
let Map = require("./object/map");

const app = express();
const server = http.Server(app);
const mainSocket = socketIo(server);


app.use("/static", express.static(path.join(__dirname, "/static")));

app.get("/", (req, res) => {
    res.sendfile("./static/index.html");
});


let players = {};
let bullets = {};
let items = {};
let map = null;

mainSocket.on("connection", (socket) => {
    if (!map) {
        map = new Map(1);
    }
    socket.on("connect", () => {
        console.log("Player conected")
    });

    socket.on("new player", () => {
        let player = new Player(300, 200);
        console.log(player.posX, " ", player.posY, " ", player.radius);
        player.id = socket.id;
        players[socket.id] = player;
        socket.emit("render static", map);
    });

    socket.on("change state", (data)=>{

        console.log("Mouse angle",getMouseAngle(data))
        let player = players[socket.id] || {};
        if (data.left) {
            player.posX -= 5;
        }
        if (data.up) {
            player.posY -= 5;
        }
        if (data.right) {
            player.posX += 5;
        }
        if (data.down) {
            player.posY += 5;
        }
        if (player.angle !== getMouseAngle(data)){
            player.angle = getMouseAngle(data);
        }
    });

    socket.on("disconnect", ()=>{
        delete players[socket.id];
    });


});



function getMouseAngle(movement) {
    let angle = (movement.mouse_angle * 1) % 360;
    return normalizeAngle(-angle / 360.0 * (2 * Math.PI));
}

function normalizeAngle(angle) {
    let count = (angle / (2 * Math.PI)) | 0;
    angle = angle - count * 2 * Math.PI;
    if (angle < 0) angle = 2 * Math.PI + angle;
    return angle;
}


setInterval(()=>{
    mainSocket.sockets.emit("render", players);
},1000/60);


server.listen(8080, () => {
    console.log("Server run on port:", 8080);
});