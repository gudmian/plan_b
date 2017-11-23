"use strict"

let wpn = require("../global").constants.WEAPON

class Weapon{
    constructor(type){
        this.type = type;
        this.permanentDamage = wpn.wpn_desc[type].damage;
        this.damage = wpn.wpn_desc[type].damage;
        this.patrons = wpn.wpn_desc[type].patrons;
        this.frequency = wpn.wpn_desc[type].frequency;
        this.velocity = wpn.wpn_desc[type].vel;
        this.name = wpn.wpn_desc[type].name;
        this.owner;
        this.lastFire = 0;
    }

    setPlayer(owner){
        this.owner = owner;
    }

    setDamage(dam){
        this.damage = dam;
    }

    getDamage(){
        return this.damage;
    }

    restoreDamage(){
        this.damage = this.permanentDamage;
    }
}

module.exports = Weapon;