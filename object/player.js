"use strict"

var Weapon = require("./weapon");
var wpn = require("../global").constants.WEAPON;
var Map = require("./map");

class Player {
    constructor(x, y ,cell) {
        this.id;
        this.name;
        this.radius = 15 /*px*/;
        this.posX = x;
        this.posY = y;
        this.angle = 0;
        this.health = 100;
        this.cell = cell;
        this.weapon = new Weapon(wpn.SIMPLE);
        this.weapon.setPlayer(this.id)
    }

    spawn(){

    }

    collideLeft(collobj){
        if(collobj.isBlock){
            let dist = (this.posX-this.radius)-(collobj.PosX + collobj.size)
            if (dist>=0){
                return false
            }
            else{
                return true
            }
        }
    }
    collideRight(collobj){
        if(collobj.isBlock){
            let dist = (collobj.PosX - collobj.size) - (this.posX + this.radius)
            if (dist>=0){
                return false
            }
            else{
                return true
            }
        }
    }
    collideTop(collobj){
        if(collobj.isBlock){
            let dist = (this.posY - this.radius) - (collobj.PosY + collobj.size)
            if (dist>=0){
                return false
            }
            else{
                return true
            }
        }
    }
    collideBottom(collobj){
        if(collobj.isBlock){
            let dist = (collobj.PosY - collobj.size) - (this.posY + this.radius)
            if (dist>=0){
                return false
            }
            else{
                return true
            }
        }
    }

    collidePlayer(player){
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

module.exports = Player;