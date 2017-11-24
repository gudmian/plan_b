"use strict";
let http = require("http");
let path = require("path");
let express = require("express");
let logger = require("winston");
let socketIo = require("socket.io");
let Player = require("./object/player");
let Map = require("./object/map");
let Bullet = require("./object/bullet");
let Powerup = require("./object/powerup");
let WEAPON = require("./global").constants.WEAPON;

const app = express();
const server = http.Server(app);
const mainSocket = socketIo(server);


app.use("/static", express.static(path.join(__dirname, "/static")));

app.get("/", (req, res) => {
    res.sendfile("./static/index.html");
});

let amountBots = 5;
let botId = 0;
let maxPowerups = 5;

let players = {};
let bullets = {};
let pwrups = [];

let scoreTable = {};

let map = null;

let renderData = {
    playersInf: players,
    bulletsInf: bullets,
    powerupInf: pwrups,
    scores: scoreTable
};

for (let player in players) {
    delete players[player]
}


mainSocket.on("connection", (socket) => {


    if (!map) {
        map = new Map(1);
        createBots();
        createPowerup();
    }
    socket.on("connect", () => {
        console.log("Connected player with id:", socket.id);
    });

    socket.on("new player", () => {
        let spawnCell = map.getEmptyCell();
        let player = new Player(spawnCell.posX + spawnCell.size / 2, spawnCell.posY + spawnCell.size / 2, spawnCell, socket.id, false);
        // player.id = socket.id;
        players[socket.id] = player;
        scoreTable[socket.id] = 0;
        socket.emit("render static", map);
    });


    socket.on("change state", (data) => {

        let player = players[socket.id] || {};

        if (players !== {} && player !== {} && player !== undefined && players !== undefined && (player instanceof Player)) {
            let leftCell = map.getCellByPoint(player.posX - 20, player.posY)
            let rightCell = map.getCellByPoint(player.posX + 15, player.posY)
            let topCell = map.getCellByPoint(player.posX, player.posY - 20)
            let bottomCell = map.getCellByPoint(player.posX, player.posY + 15)

            if (data.left) {
                if (!player.collideLeft(leftCell)) {
                    player.posX -= player.velocity;
                    if (isCollideWithOther(player)) {
                        player.posX += player.velocity;
                    }
                }
            }
            if (data.up) {
                if (!player.collideTop(topCell)) {
                    player.posY -= player.velocity;
                    if (isCollideWithOther(player)) {
                        player.posY += player.velocity;
                    }
                }
            }
            if (data.right) {
                if (!player.collideRight(rightCell)) {
                    player.posX += player.velocity;
                    if (isCollideWithOther(player)) {
                        player.posX -= player.velocity;
                    }
                }
            }
            if (data.down) {
                if (!player.collideBottom(bottomCell)) {
                    player.posY += player.velocity;
                    if (isCollideWithOther(player)) {
                        player.posY -= player.velocity;
                    }
                }
            }
            if (player.angle !== getMouseAngle(data, socket.id)) {
                player.angle = getMouseAngle(data, socket.id);
            }
            if (data.mouse_down) {
                fireIfPossible(socket.id);
            }
            if (data.mouse_wheel) {
                console.log("Wheel ", (player.currentWeapon.type + data.mouse_wheel/120) % 3);
                player.currentWeapon = player.weapon[Math.abs((data.mouse_wheel/120)) % 3];
            }
            for (let bulletId in bullets) {
                for (var bullet of bullets[bulletId]) {
                    let currentAngle = bullet.angle;
                    let currentAngleR = currentAngle * (Math.PI / 180);
                    let intervals = 5;
                    for (let step = 0; step < intervals; step++) {
                        //if(bullet === undefined || bullet === null) break;
                        let xFactor = bullet.velo * Math.cos(currentAngle) / (intervals);      //WRONG!!!
                        let yFactor = bullet.velo * Math.sin(currentAngle) / (intervals);
                        bullet.posX += xFactor;
                        bullet.posY += yFactor;
                        let cell = map.getCellByPoint(bullet.posX, bullet.posY);

                        if (cell && cell.isBlock) {
                            bulletDead(bulletId, bullet);
                        } else {
                            for (let id in players) {
                                if (bullet.owner === id) continue;
                                if (bullet.collideWithPlayer(players[id]) && !players[id].isShield) {
                                    bulletDead(bulletId, bullet);
                                    players[id].health -= bullet.damage;
                                    if (players[id].health <= 0) {
                                        // setTimeout(() => {
                                        scoreTable[bullet.owner] += 100;
                                        players[id] = respawnPlayer(id, players[id].isBot);
                                        // }, 2000);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            for (let pwrup of pwrups) {
                let index = pwrups.indexOf(pwrup);
                if (pwrup.isCollideWithPlayer(player)) {
                    player.setPower(pwrup);
                    if (index > -1) {
                        pwrups.splice(index, 1);
                    }
                }
            }
        } else {
            players[socket.id] = respawnPlayer(socket.id, players[socket.id].isBot);
        }
    });

    socket.on("disconnect", () => {
        delete players[socket.id];
    });


});


function createPowerup() {
    setInterval(() => {
        if(pwrups.length <= maxPowerups){
            let spawnCell = map.getEmptyCell();
            let type = Math.floor(Math.random() * (7 - 1) + 1);
            ;   //от 1 до 7 см. global.js
            pwrups.push(new Powerup(type, spawnCell));
        }
    }, 10000);
};


function createBots() {
    for (let i = 0; i < amountBots; i++) {
        players[botId] = respawnPlayer(botId, true);
        botId++;
    }
    botsTurn();
}


function bulletDead(id, bullet) {
    let bulletIndex = bullets[id].indexOf(bullet);
    if (bulletIndex > -1) {
        bullets[id].splice(bulletIndex, 1);
    }
}

function isCollideWithOther(player) {
    for (let other in players) {
        if (player.id === other) continue;
        if (player.collidePlayer(players[other])) {
            return true;
        }
    }
    return false
}

function fireIfPossible(id) {
    if (players[id] === undefined) return;
    let wpn = players[id].currentWeapon;
    while (wpn.type > WEAPON.SIMPLE && wpn.patrons === 0) {
        players[id].currentWeapon = players[id].weapon[wpn.type - 1];
        wpn = players[id].currentWeapon;
    }
    if (wpn.patrons > 0) {
        if (wpn.lastFire === 0) {
            wpn.lastFire = Date.now();
            wpn.patrons -= 1;
            fire(id);
        }
        else {
            if ((wpn.lastFire + wpn.frequency) < Date.now()) {
                wpn.lastFire = Date.now();
                wpn.patrons -= 1;
                fire(id);
            }
        }
    }
}

function respawnPlayer(id, isBot) {
    let spawnCell = map.getEmptyCell();
    return new Player(spawnCell.posX + spawnCell.size / 2, spawnCell.posY + spawnCell.size / 2, spawnCell, id, isBot);
}

function fire(id) {
    if (!bullets[id]) {
        bullets[id] = [];
    }
    if (players[id]) {
        let currentAngle = players[id].angle;
        let bulletX = players[id].posX + players[id].radius * Math.cos(currentAngle) + 0.5;
        let bulletY = players[id].posY + players[id].radius * Math.sin(currentAngle) + 0.5;
        // console.log("Bullet params:", players[id].weapon.damage, players[id].weapon.velocity, currentAngle, bulletX, bulletY, id)
        bullets[id].push(new Bullet(players[id].currentWeapon.damage, players[id].currentWeapon.velocity, currentAngle, bulletX, bulletY, players[id].currentWeapon.owner));
    }
}


function botsTurn() {
    for (let pId in players) {
        let player = players[pId];
        if (players !== {} && player !== {} && player !== undefined && players !== undefined && (player instanceof Player)) {
            // console.log(player === null);
            // console.log(player === undefined);
            // console.log(player === {});
            // console.log(player instanceof Player);
            // console.log(typeof player);
            if (player.isBot) {
                player.makeDesicions(players);
                let leftCell = map.getCellByPoint(player.posX - 20, player.posY)
                let rightCell = map.getCellByPoint(player.posX + 15, player.posY)
                let topCell = map.getCellByPoint(player.posX, player.posY - 20)
                let bottomCell = map.getCellByPoint(player.posX, player.posY + 15)

                if (player.actions.left) {
                    if (!player.collideLeft(leftCell)) {
                        player.posX -= player.velocity;
                        if (isCollideWithOther(player)) {
                            player.posX += player.velocity;
                        }
                    }
                }
                if (player.actions.up) {
                    if (!player.collideTop(topCell)) {
                        player.posY -= player.velocity;
                        if (isCollideWithOther(player)) {
                            player.posY += player.velocity;
                        }
                    }
                }
                if (player.actions.right) {
                    if (!player.collideRight(rightCell)) {
                        player.posX += player.velocity;
                        if (isCollideWithOther(player)) {
                            player.posX -= player.velocity;
                        }
                    }
                }
                if (player.actions.down) {
                    if (!player.collideBottom(bottomCell)) {
                        player.posY += player.velocity;
                        if (isCollideWithOther(player)) {
                            player.posY -= player.velocity;
                        }
                    }
                }
                if (player.angle !== getMouseAngle(player.actions, pId)) {
                    player.angle = getMouseAngle(player.actions, pId);
                }
                if (player.actions.mouse_down) {
                    fireIfPossible(pId);
                }
            }
        } else {
            players[pId] = respawnPlayer(pId, true);
        }
    }
}

function getMouseAngle(movement, socketId) {
    let player = players[socketId];
    let x = 0;
    let y = 0;
    if (player !== undefined) {
        x = player.posX;
        y = player.posY;
    }
    let angle = Math.atan((movement.mouse_Y - y) / (movement.mouse_X - x ));
    if ((movement.mouse_Y - y) < 0 && (movement.mouse_X - x ) < 0) {
        angle += 2 * Math.acos(0)
    }
    if ((movement.mouse_Y - y) > 0 && (movement.mouse_X - x) < 0) {
        angle += 2 * Math.acos(0)
    }
    return angle;
}

function normalizeAngle(angle) {
    let count = (angle / (2 * Math.PI)) | 0;
    angle = angle - count * 2 * Math.PI;
    if (angle < 0) angle = 2 * Math.PI + angle;
    return angle;
}


setInterval(() => {
    botsTurn();
    mainSocket.sockets.emit("render", renderData);
}, 1000 / 60);


server.listen(8080, () => {
    console.log("Server run on port:", 8080);
});