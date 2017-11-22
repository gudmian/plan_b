"use strict"

var Weapon = require("./weapon");
var Power = require("./powerup");
var wpn = require("../global").constants.WEAPON;
var pwr = require("../global").constants.POWERUP;
var Map = require("./map");

class Player {
    constructor(x, y, cell, id) {
        this.id = id;
        this.name;
        this.radius = 15 /*px*/;
        this.posX = x;
        this.posY = y;
        this.angle = 0;
        this.health = 100;
        this.cell = cell;
        this.weapon;
        this.powerup;
        this.isShield = false;
        this.velocity = 5;


        this.setSimpleWeapon();
    }

    spawn() {

    }

    collideLeft(collobj) {
        if (collobj.isBlock) {
            let dist = (this.posX - this.radius) - (collobj.PosX + collobj.size)
            if (dist >= 0) {
                return false
            }
            else {
                return true
            }
        }
    }

    collideRight(collobj) {
        if (collobj.isBlock) {
            let dist = (collobj.PosX - collobj.size) - (this.posX + this.radius)
            if (dist >= 0) {
                return false
            }
            else {
                return true
            }
        }
    }

    collideTop(collobj) {
        if (collobj.isBlock) {
            let dist = (this.posY - this.radius) - (collobj.PosY + collobj.size)
            if (dist >= 0) {
                return false
            }
            else {
                return true
            }
        }
    }

    collideBottom(collobj) {
        if (collobj.isBlock) {
            let dist = (collobj.PosY - collobj.size) - (this.posY + this.radius)
            if (dist >= 0) {
                return false
            }
            else {
                return true
            }
        }
    }

    collidePlayer(player) {
        var XColl = false;
        var YColl = false;
        if ((this.posX + this.radius >= player.posX) && (this.posX <= player.posX + player.radius)) XColl = true;
        if ((this.posY + this.radius >= player.posY) && (this.posY <= player.posY + player.radius)) YColl = true;

        if (XColl & YColl) {
            return true;
        }
        return false;
    }

    setCustomWeapon(weapon) {
        if (weapon === undefined) {
            this.setSimpleWeapon();
            return;
        }
        this.weapon = new Weapon(weapon);
        this.weapon.setPlayer(this.id)
    }

    setSimpleWeapon() {
        this.weapon = new Weapon(wpn.SIMPLE);
        this.weapon.setPlayer(this.id);
    }

    setPower(power) {
        if (power === undefined) {
            this.powerup = null;
            return;
        }
        this.powerup = power;
        this.usePowerUp()
    }

    usePowerUp() {
        switch (this.powerup.type) {
            case wpn.MEDIUM:
                this.setCustomWeapon(wpn.MEDIUM);
                break;
            case wpn.STRONG:
                this.setCustomWeapon(wpn.STRONG);
                break;
            case pwr.PATRONS:
                let weapon = this.weapon;
                if(weapon.patrons === wpn.wpn_desc[weapon.type].patrons){
                    //DO NOTHING
                }
                else{
                    weapon.patrons = wpn.wpn_desc[weapon.type].patrons;
                }
                break;

            case pwr.HEALTH:
                // if (this.health === 100) {
                //     //DO NOTHING
                // } else if ((this.health + 25) > 100) {
                //     this.health = 100;
                // } else {
                    this.health += 25;
                // }
                console.log("Powerup in use: HEALTH");
                break;
            case pwr.SHIELD:
                if (!this.isShield) {
                    //DO NOTHING
                } else {
                    this.isShield = true;
                }
                console.log("Powerup in use: SHIELD");
                break;
            case pwr.SPEED:
                if (this.velocity === 10) {
                    //DO NOTHING
                } else {
                    this.velocity += 5;
                }
                console.log("Powerup in use: SPEED");
                break;
            case pwr.BERSERC:
                if (this.weapon.damage === 2 * this.weapon.permanentDamage) {
                    //DO NOTHING
                } else {
                    this.weapon.setDamage(2 * this.weapon.permanentDamage);
                }
                console.log("Powerup in use: BERSERC");
                break;
        }
        setTimeout(() => {
            this.restoreDefaults();
            this.powerup = null;
        }, this.powerup.duration);
    }


    restoreDefaults() {
        this.velocity = 5;
        this.isShield = false;
        this.weapon.restoreDamage();
    }
}

module.exports = Player;