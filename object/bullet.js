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

    collideBullet(collobj) {
        console.log("Type of collision object:", typeof collobj)
        if(collobj !== undefined) {
            var XColl = false;
            var YColl = false;
            var collCenterX = collobj.posX;
            var collCenterY = collobj.posY;

            if ((this.posX + this.radius >= collCenterX) && (this.posX <= collCenterX + collobj.size)) XColl = true;
            if ((this.posY + this.radius >= collCenterY) && (this.posY <= collCenterY + collobj.size)) YColl = true;

            if (XColl & YColl) {
                console.log("Bullet is collide");
                return true;
            }
            console.log("Bullet is not collide");
            return false;
        } else  {
            return false;
        }
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