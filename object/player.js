"use strict"

var Weapon = require("../global").constants.WEAPON
var Map = require("../map")

class Player {
    constructor(x, y) {
        var id;
        var name;
        var radius = 50 /*px*/;
        var posX = x;
        var posY = y;
        var angle = 0;
        var weapon = new Weapon(Weapon.SIMPLE)
        //weapon.setPlayer(this.id)
    }

    spawnPlayer(){

        new Player();
    }
}