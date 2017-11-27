"use strict";
let http = require("http");
let path = require("path");
let express = require("express");
const bodyParser = require('body-parser');
let logger = require("winston");
let socketIo = require("socket.io");
let Player = require("./object/player");
let Map = require("./object/map");
let Bullet = require("./object/bullet");
let Powerup = require("./object/powerup");
let WEAPON = require("./global").constants.WEAPON;
let DIFF = require("./global").constants.DIFFICULTY;
let shortid = require("shortid");
let TableRaw = require("./object/tableRaw");

const app = express();
const server = http.Server(app);
const mainSocket = socketIo(server);


let connectionsAmount = 0;

let amountBots = 1;
let difficultyBots = DIFF.EASY;
let maxBots = 15;
let botCount = 0;
let lastBotAction = 0;
let maxPowerups = 5;
let mapType = 1;

app.use("/static", express.static(path.join(__dirname, "/static")));

app.get("/", (req, res) => {
    if (connectionsAmount === 0) {
        res.sendfile("./static/welcome.html");
    } else {
        res.sendfile("./static/welcomeInCreatedGame.html");
    }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.post("/firstlogin", (req, res) => {
    let complexity = req.body.group1;
    let nickname = req.body.username;
    let botsInf = req.body.botsAmount;
    let levelSize = req.body.group2;
    connectionsAmount++;
    amountBots = parseInt(botsInf);
    if (complexity === "easy") {
        difficultyBots = DIFF.EASY;
    } else if (complexity === "medium") {
        difficultyBots = DIFF.NORMAL;
    } else {
        difficultyBots = DIFF.HARD;
    }

    if(levelSize === "small"){
        mapType = 1;
    } else if(levelSize === "normal"){
        mapType = 2;
    } else {
        mapType = 3;
    }
    let params = "?nickname=" + nickname;
    res.redirect("./static/index.html" + params);
});
app.post("/login", (req, res) => {
    let nickname = req.body.username;
    connectionsAmount++;
    let params = "?nickname=" + nickname;
    res.redirect("./static/index.html" + params);
});

function updateBots() {
    while (amountBots !== botCount) {
        if (amountBots > botCount) {
            addBot();
        } else if (amountBots < botCount) {
            removeBot();
        }
    }
}

let players = {};
let bullets = {};
let pwrups = [];

let scoreTable = [];

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
        map = new Map(mapType);
        createBots();
        createPowerup();
    }
    socket.on("connect", () => {
        console.log("Connected player with id:", socket.id);
    });

    socket.on("new player", (nickname) => {
        console.log(nickname);
        let player = respawnPlayer(socket.id, nickname, false);
        player.setDifficulty(difficultyBots);
        players[socket.id] = player;
        socket.emit("render static", map);
    });


    socket.on("change state", (data) => {

        let player = players[socket.id] || {};

        if (players !== {} && player !== {} && player !== undefined && players !== undefined && (player instanceof Player)) {
            let leftCell = map.getCellByPoint(player.posX - 20, player.posY);
            let rightCell = map.getCellByPoint(player.posX + 15, player.posY);
            let topCell = map.getCellByPoint(player.posX, player.posY - 20);
            let bottomCell = map.getCellByPoint(player.posX, player.posY + 15);

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
            if (data.add) {
                addBot();
            }
            if (data.del) {
                removeBot();
            }
            if (player.angle !== getMouseAngle(data, socket.id)) {
                player.angle = getMouseAngle(data, socket.id);
            }
            if (data.mouse_down) {
                fireIfPossible(socket.id);
            }
            if (data.mouse_wheel) {
                player.currentWeapon = player.weapon[Math.abs((data.mouse_wheel / 120)) % 3];
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
                                if (bullet.collideWithPlayer(players[id])) {
                                    bulletDead(bulletId, bullet);
                                    if (!players[id].isShield) {
                                        players[id].health -= bullet.damage;
                                        if (players[id].health <= 0) {
                                            for (let index = 0; index < scoreTable.length; index++) {
                                                if (scoreTable[index].id === bullet.owner) {
                                                    scoreTable[index].score += 100;
                                                }
                                            }
                                            players[id] = respawnPlayer(id, players[id].name, players[id].isBot);
                                            players[id].setDifficulty(difficultyBots);
                                        }
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
                    map.getCellByPoint(pwrup.posX, pwrup.posY).isReserved = false;
                    if (index > -1) {
                        pwrups.splice(index, 1);
                    }
                }
            }
            player.cell = map.getCellByPoint(player.posX, player.posY);
            // changeCameraPosition(player);
        } else {
            if (players[socket.id] !== undefined) players[socket.id] = respawnPlayer(socket.id, players[socket.id].name, players[socket.id].isBot);
        }
    });

    socket.on("disconnect", () => {
        delete players[socket.id];
        for (let index = 0; index < scoreTable.length; index++) {
            if (scoreTable[index].id === socket.id) {
                scoreTable.splice(index, 1);
            }
        }
        connectionsAmount--;
    });


});


function createPowerup() {
    setInterval(() => {
        if (pwrups.length <= maxPowerups) {
            let spawnCell = map.getEmptyCell();
            spawnCell.isReserved = true;
            let type = Math.floor(Math.random() * (7 - 1) + 1);
            ;   //от 1 до 7 см. global.js
            pwrups.push(new Powerup(type, spawnCell));
        }
    }, 10000);
};


function addBot() {
    if (botCount < maxBots && Date.now() > lastBotAction + 300) {
        let botId = shortid.generate();
        players[botId] = respawnPlayer(botId, "Bot-" + botCount, true);
        players[botId].setDifficulty(difficultyBots);
        lastBotAction = Date.now();
        botCount++;
    }
}

function removeBot() {
    if (botCount > 0 && Date.now() > lastBotAction + 300) {
        for (let id in players) {
            if (players[id].isBot) {
                delete players[id];
                for (let index = 0; index < scoreTable.length; index++) {
                    if (scoreTable[index].id === id) {
                        scoreTable.splice(index, 1);
                    }
                }
                lastBotAction = Date.now();
                botCount--;
                return;
            }
        }
    }
}

function sortScores() {
    scoreTable.sort((a, b) => {
        return b.score - a.score;
    });
}

function createBots() {
    for (let i = 0; i < amountBots; i++) {
        let botId = shortid.generate();
        players[botId] = respawnPlayer(botId, "Bot-" + botCount, true);
        players[botId].setDifficulty(difficultyBots);
        lastBotAction = Date.now();
        players[botId].setDifficulty(difficultyBots);
        botCount++;
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
    // while (wpn.type > WEAPON.SIMPLE && wpn.patrons === 0) {
    //     players[id].currentWeapon = players[id].weapon[wpn.type - 1];
    //     wpn = players[id].currentWeapon;
    // }
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

function respawnPlayer(id, name, isBot) {
    let spawnCell = map.getEmptyCell();
    spawnCell.isReserved = true;
    if (players[id] === undefined) scoreTable.push(new TableRaw(id, name, 0));
    return new Player(spawnCell.posX + spawnCell.size / 2, spawnCell.posY + spawnCell.size / 2, spawnCell, id, name, isBot);
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
            if (player.isBot) {
                player.makeDesicions(players, pwrups, map);
                let leftCell = map.getCellByPoint(player.posX - 20, player.posY);
                let rightCell = map.getCellByPoint(player.posX + 15, player.posY);
                let topCell = map.getCellByPoint(player.posX, player.posY - 20);
                let bottomCell = map.getCellByPoint(player.posX, player.posY + 15);

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

                for (let pwrup of pwrups) {
                    let index = pwrups.indexOf(pwrup);
                    if (pwrup.isCollideWithPlayer(player)) {
                        player.setPower(pwrup);
                        if (index > -1) {
                            pwrups.splice(index, 1);
                        }
                    }
                }
                player.cell.isReserved = false;
                player.cell = map.getCellByPoint(player.posX, player.posY);
                map.getCellByPoint(player.posX, player.posY).isReserved = true;
            }
        } else {
            players[pId] = respawnPlayer(pId, players[pId].name, true);
            players[pId].setDifficulty(difficultyBots);
        }
    }
}

function getMouseAngle(movement, socketId) {
    let player = players[socketId];
    let x = 0;
    let y = 0;
    let maxPos = map.levelSize * map.cellMatrix[0][0].size;

    function convertPlayerPosition(pos) {
        let resPos = 0;
        if (pos < 250) {
            resPos = pos;
        }
        else if (pos + 250 > maxPos) {
            resPos = 500 - (maxPos - pos);
        }
        else {
            resPos = 250 /*+ pos % 50*/;
        }
        return resPos;

    }

    if (player !== undefined) {
        if (!player.isBot) {
            x = convertPlayerPosition(player.posX);
            y = convertPlayerPosition(player.posY);
        }
        else {
            x = player.posX;
            y = player.posY;
        }
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

function dropScores() {
    scoreTable.forEach((a)=>{
        a.score = 0;
    })
}

    setInterval(() => {
        botsTurn();
        sortScores();
        let maxScore = 0;
        if(scoreTable.length > 0) maxScore = scoreTable[0];
        if (maxScore.score < 1000) {
            mainSocket.sockets.emit("render", renderData, map);
        } else {
            mainSocket.sockets.emit("game over", maxScore);
            dropScores();
        }
    }, 1000 / 60);


server.listen(8080, () => {
    console.log("Server run on port:", 8080);
});