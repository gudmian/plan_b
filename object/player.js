"use strict"

var Weapon = require("../global").constants.WEAPON;
var Map = require("./map");

class Player {
    constructor(x, y) {
        this.id;
        this.name;
        this.radius = 20 /*px*/;
        this.posX = x;
        this.posY = y;
        this.angle = 0;
        //this.weapon = new Weapon(Weapon.SIMPLE)
        //weapon.setPlayer(this.id)
    }

    spawnPlayer(){

        new Player();
    }
}

module.exports = Player;