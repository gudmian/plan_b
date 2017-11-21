"use strict"

let wpn = require("../global").constants.WEAPON

class Weapon{
    constructor(type){
        this.type = type;
        this.damage = wpn.wpn_desc[type].damage;
        this.patrons = wpn.wpn_desc[type].patrons;
        this.frequency = wpn.wpn_desc[type].frequency;
        this.velocity = wpn.wpn_desc[type].vel;
        this.owner;
    }

    setPlayer(owner){
        this.owner = owner;
    }
}

module.exports = Weapon;