"use strict"

let Player = require("./player");
let Cell = require("./cell");

class Bullet {
    constructor(damage, size, velo, angle, posX, posY) {
        this.damage = damage;
        this.size = size;
        this.velo = velo;
        this.angle = angle;
        this.posX = posX;
        this.posY = posY;
        this.radius = 2 /*px*/;
    }

    collideBullet(collobj) {
        var XColl = false;
        var YColl = false;

        if ((this.posX + this.radius >= collobj.x) && (this.posX <= collobj.x + collobj.width)) XColl = true;
        if ((this.posY + this.radius >= collobj.y) && (this.posY <= collobj.y + collobj.height)) YColl = true;

        if (XColl & YColl) {
            return true;
        }
        return false;
    }
    killBullet(collobj){
        if (collobj instanceof Player){

        }
        if (collobj instanceof Cell){

        }

    }
}

module.exports = Bullet;