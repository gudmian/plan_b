"use strict"
let http = require("http");
let path = require("path");
let express = require("express");
let logger = require("winston");
let socketIo = require("socket.io");
let Player = require("./object/player");
let Map = require("./object/map");
let Bullet = require("./object/bullet");

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
        let x = 300
        let y = 400
        let player = new Player(x, y, map.getCellByPoint(x, y));
        console.log(player.posX, " ", player.posY, " ", player.radius);
        player.id = socket.id;
        players[socket.id] = player;
        socket.emit("render static", map);
    });

    socket.on("change state", (data) => {

        console.log("Mouse angle", getMouseAngle(data))
        let player = players[socket.id] || {};

        let leftCell = map.getCellByPoint(player.posX - 20, player.posY)
        let rightCell = map.getCellByPoint(player.posX + 15, player.posY)
        let topCell = map.getCellByPoint(player.posX, player.posY - 20)
        let bottomCell = map.getCellByPoint(player.posX , player.posY + 15)

        if (data.left) {
            if (!player.collideLeft(leftCell)) {
                player.posX -= 5;
            }
        }
        if (data.up) {
            if (!player.collideTop(topCell)) {
                player.posY -= 5;
            }
        }
        if (data.right) {
            if (!player.collideRight(rightCell)) {
                player.posX += 5;
            }
        }
        if (data.down) {
            if (!player.collideBottom(bottomCell)) {
                player.posY += 5;
            }
        }
        if (player.angle !== getMouseAngle(data)) {
            player.angle = getMouseAngle(data);
        }
        if (data.mouse_down) {
            fireIfPossible(socket.id);
        }
        for (let ids in bullets) {
            for (var bullet of bullets[ids]) {
                let currentAngle = bullet.angle;
                let currentAngleR = currentAngle * (Math.PI / 180);
                bullet.posX += bullet.velo * Math.cos(currentAngleR);
                bullet.posY += bullet.velo * Math.sin(currentAngleR);
                for (let player in players){
                    let player = players[socket.id];
                    if (bullet.collideBullet(player)){
                        bullet.killBullet(player);
                    }
                }
                let cell = map.getCellByPoint(bullet.posX, bullet.posY);
                if(bullet.collideBullet(cell)){
                    bullet.killBullet(cell);
                }
            }
        }
    });

    socket.on("disconnect", () => {
        delete players[socket.id];
    });


});

function fireIfPossible(id) {
    let nextFire;
    if (nextFire) {
        if (nextFire < Date.now()) {
            fire(id);
            nextFire = Date.now() + 1000;
        }
    } else {
        fire(id);
        nextFire = Date.now() + 1000;
    }
}

function fire(id) {
    if(!bullets[id]){
        bullets[id] = [];
    }
    bullets[id].push(new Bullet(50, 5, 15, players[id].angle, players[id].posX, players[id].posY));
}

function getMouseAngle(movement) {
    let angle = (movement.mouse_angle * 1) % 360;
    // return normalizeAngle(-angle / 360.0 * (2 * Math.PI));
    return angle;
}

function normalizeAngle(angle) {
    let count = (angle / (2 * Math.PI)) | 0;
    angle = angle - count * 2 * Math.PI;
    if (angle < 0) angle = 2 * Math.PI + angle;
    return angle;
}

let renderData = {
    playersInf: players,
    bulletsInf: bullets
}

setInterval(() => {
    mainSocket.sockets.emit("render", renderData);
}, 1000 / 60);


server.listen(8080, () => {
    console.log("Server run on port:", 8080);
});