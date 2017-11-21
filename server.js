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
        let player = new Player(300, 200);
        console.log(player.posX, " ", player.posY, " ", player.radius);
        player.id = socket.id;
        players[socket.id] = player;
        socket.emit("render static", map);
    });

    socket.on("change state", (data) => {

        console.log("Mouse angle", getMouseAngle(data))
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
        if (player.angle !== getMouseAngle(data)) {
            player.angle = getMouseAngle(data);
        }
        if (data.mouse_down) {
            fireIfPossible(socket.id);
        }
        for (let ids in bullets) {
            let bullet = bullets[ids];
            let currentAngle = bullet.angle;
            let currentAngleR = currentAngle * (Math.PI / 180);
            let currentX = bullet.posX;
            let currentY = bullet.posY;

            if (currentAngle >= 0 && currentAngle < 90) {
                bullet.posX += currentX * Math.cos(currentAngleR);
                bullet.posY += currentX * Math.sin(currentAngleR);
            } else if (currentAngle >= 90 && currentAngle < 180) {
                bullet.posX -= currentX * Math.cos(currentAngleR);
                bullet.posY += currentX * Math.sin(currentAngleR);
            } else if (currentAngle >= 180 && currentAngle < 270) {
                bullet.posX -= currentX * Math.cos(currentAngleR);
                bullet.posY -= currentX * Math.sin(currentAngleR);
            } else {
                bullet.posX += currentX * Math.cos(currentAngleR);
                bullet.posY -= currentX * Math.sin(currentAngleR);
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
    bullets[id] = new Bullet(50, 5, 15, players[id].angle, players[id].posX, players[id].posY);
}

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