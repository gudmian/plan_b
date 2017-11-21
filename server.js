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

let renderData = {
    playersInf: players,
    bulletsInf: bullets
};

mainSocket.on("connection", (socket) => {
    if (!map) {
        map = new Map(1);
    }
    socket.on("connect", () => {
        console.log("Player conected")
    });

    socket.on("new player", () => {
        let spawnCell = map.getEmptyCell()
        let player = new Player(spawnCell.posX + spawnCell.size/2, spawnCell.posY + spawnCell.size/2, map.getCellByPoint(x, y));
        console.log(player.posX, " ", player.posY, " ", player.radius);
        player.id = socket.id;
        players[socket.id] = player;
        socket.emit("render static", map);
    });

    socket.on("change state", (data) => {

        let player = players[socket.id] || {};

        if (player !== {}) {

            let leftCell = map.getCellByPoint(player.posX - 20, player.posY)
            let rightCell = map.getCellByPoint(player.posX + 15, player.posY)
            let topCell = map.getCellByPoint(player.posX, player.posY - 20)
            let bottomCell = map.getCellByPoint(player.posX, player.posY + 15)

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
                    let intervals = 5;
                    for (let step = 0; step < intervals; step++) {
                        //if(bullet === undefined || bullet === null) break;
                        let xFactor = bullet.velo * Math.cos(currentAngleR) / (intervals - step);
                        let yFactor = bullet.velo * Math.sin(currentAngleR) / (intervals - step);
                        bullet.posX += xFactor;
                        bullet.posY += yFactor;
                        let cell = map.getCellByPoint(bullet.posX, bullet.posY);
                        if (cell && cell.isBlock) {
                            console.log("Bullet collide with wall");
                            buletDead(ids, bullet);
                        } else {
                            for (let id in players) {
                                if (bullet.owner === id) continue;
                                if (bullet.collideWithPlayer(players[id])) {
                                    console.log("Bullet collide with player");
                                    buletDead(ids, bullet);
                                    delete players[id];
                                }
                            }
                        }
                    }
                }
            }
        } else {
            players[socket.id] = respawnPlayer(x, y);
        }
    });

    socket.on("disconnect", () => {
        delete players[socket.id];
    });


});

function buletDead(id, bullet) {
    let bulletIndex = bullets[id].indexOf(bullet);
    bullets[id].splice(bulletIndex, 1);
}



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

function respawnPlayer() {
    let spawnCell = map.getEmptyCell()
    return new Player(spawnCell.posX + spawnCell.size/2, spawnCell.posY + spawnCell.size/2,  map.getCellByPoint(x, y));
}

function fire(id) {
    if (!bullets[id]) {
        bullets[id] = [];
    }
    if (players[id]) {
        let currentAngle = players[id].angle * (Math.PI / 180);
        let bulletX = players[id].posX + players[id].radius * Math.cos(currentAngle) + 0.5;
        let bulletY = players[id].posY + players[id].radius * Math.sin(currentAngle) + 0.5;
        bullets[id].push(new Bullet(50, 5, 10, currentAngle * (180 / Math.PI), bulletX, bulletY, id));
    }
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


setInterval(() => {
    mainSocket.sockets.emit("render", renderData);
}, 1000 / 60);


server.listen(8080, () => {
    console.log("Server run on port:", 8080);
});