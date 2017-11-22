"use strict"

let Player = require("./player");
let Cell = require("./cell");

class Bullet {
    constructor(damage, velo, angle, posX, posY, owner) {
        this.damage = damage;
        this.velo = velo;
        this.angle = angle;
        this.posX = posX;
        this.posY = posY;
        this.radius = 2 /*px*/;
        this.owner = owner;
    }

    collideWithPlayer(player){
        var XColl = false;
        var YColl = false;
        if ((this.posX + this.radius >= player.posX) && (this.posX <= player.posX + player.radius)) XColl = true;
        if ((this.posY + this.radius >= player.posY) && (this.posY <= player.posY + player.radius)) YColl = true;

        if (XColl & YColl) {
            // console.log("Bullet is collide wirh player");
            // console.log("Bullet:", this.posX, ",", this.posY, "| Player:", player.posX, ",", player.posY);
            return true;
        }
        // console.log("Bullet is not collide with player");
        // console.log("Bullet:", this.posX, ",", this.posY, "| Player:", player.posX, ",", player.posY);

        return false;
    }
}

module.exports = Bullet;