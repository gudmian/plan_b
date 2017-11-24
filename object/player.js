"use strict"

var Weapon = require("./weapon");
var Power = require("./powerup");
var wpn = require("../global").constants.WEAPON;
var pwr = require("../global").constants.POWERUP;
var Map = require("./map");

class Player {
    constructor(x, y, cell, id, isBot) {
        this.id = id;
        this.name;
        this.radius = 15 /*px*/;
        this.posX = x;
        this.posY = y;
        this.isBot = isBot;
        this.botVision = 250+this.radius;
        this.angle = 0;
        this.health = 100;
        this.cell = cell;
        this.weapon = {};
        this.currentWeapon;
        this.powerup;
        this.isShield = false;
        this.velocity = 5;
        this.skin = randomInteger(0,2);

        this.actions = {
            mouse_X: 0,
            mouse_Y: 0,
            mouse_down: false,
            mouse_wheel: 0,
            up: true,
            down: false,
            left: false,
            right: false
        };

        this.setSimpleWeapon();
    }

    collideLeft(collobj) {
        if (collobj.isBlock) {
            let dist = (this.posX - this.radius) - (collobj.PosX + collobj.size);
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
            let dist = (collobj.PosX - collobj.size) - (this.posX + this.radius);
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
            let dist = (this.posY - this.radius) - (collobj.PosY + collobj.size);
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

    isInArea(area, player) {
        return this.countDistToPlayer(player) < 50;
    }

    setCustomWeapon(weapon) {
        if (weapon === undefined) {
            return;
        }
        this.weapon[weapon] = new Weapon(weapon);
        this.currentWeapon = this.weapon[weapon];
        this.currentWeapon.setPlayer(this.id);
    }

    setSimpleWeapon() {
        this.weapon [wpn.SIMPLE] = new Weapon(wpn.SIMPLE);
        this.weapon [wpn.MEDIUM] = new Weapon(wpn.MEDIUM);
        this.weapon [wpn.MEDIUM].patrons = 0;
        this.weapon [wpn.STRONG] = new Weapon(wpn.STRONG);
        this.weapon [wpn.STRONG].patrons = 0;
        this.currentWeapon = this.weapon [wpn.SIMPLE];
        this.currentWeapon.setPlayer(this.id);
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
                for (let type in this.weapon) {
                    let weapon = this.weapon[type];
                    if (weapon.patrons === wpn.wpn_desc[weapon.type].patrons) {
                        //DO NOTHING
                    }
                    else {
                        weapon.patrons = wpn.wpn_desc[weapon.type].patrons;
                    }
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
        this.currentWeapon.restoreDamage();
    }


    //FOR AI
    startFire() {
        // console.log("Bot shoot");
        this.actions.mouse_down = true;
    }

    stopFire() {
        this.actions.mouse_down = false;
    }

    startGoLeft() {
        // console.log("Bot moves left");
        this.actions.left = true;
    }

    stopGoLeft() {
        this.actions.left = false;
    }

    startGoRight() {
        // console.log("Bot moves right");
        this.actions.right = true;
    }

    stopGoRight() {
        this.actions.right = false;
    }


    startGoUp() {
        // console.log("Bot moves up");
        this.actions.up = true;
    }

    stopGoUp() {
        this.actions.up = false;
    }

    startGoDown() {
        // console.log("Bot moves down");
        this.actions.down = true;
    }

    stopGoDown() {
        this.actions.down = false;
    }


    aimOnPlayer(player) {
        let accuracy = Math.random();
        this.actions.mouse_X = player.posX + accuracy;
        this.actions.mouse_Y = player.posY + accuracy;
        console.log(this.actions.mouse_X);
        console.log(this.actions.mouse_Y);
    }

    setDeffaultActions() {
        this.stopGoDown();
        this.stopGoUp();
        this.stopGoLeft();
        this.stopGoRight();
    }

    seek(player){
        let distX = player.posX;
        let distY = player.posY;
        if (this.posX < distX) {
            this.startGoRight();
        }
        if (this.posX > distX) {
            this.startGoLeft();
        }
        if (this.posY < distY) {
            this.startGoDown()
        }
        if (this.posY > distY) {
            this.startGoUp();
        }
    }

    hide(player){
        let distX = player.posX;
        let distY = player.posY;
        if (this.posX > distX) {
            this.startGoRight();
        }
        if (this.posX < distX) {
            this.startGoLeft();
        }
        if (this.posY > distY) {
            this.startGoDown()
        }
        if (this.posY < distY) {
            this.startGoUp();
        }
    }

    wanderToPlayer(player) {
        if ((this.countDistToPlayer(player) > (this.radius+20)) && (this.health >= player.health)) {
           this.seek(player);
        } else {
            this.hide(player);
        }
    }

//     private function wander() :Vector3D {
//     // Calculate the circle center
//     var circleCenter :Vector3D;
//     circleCenter = velocity.clone();
//     circleCenter.normalize();
//     circleCenter.scaleBy(CIRCLE_DISTANCE);
//     //
//     // Calculate the displacement force
//     var displacement :Vector3D;
//     displacement = new Vector3D(0, -1);
//     displacement.scaleBy(CIRCLE_RADIUS);
//     //
//     // Randomly change the vector direction
//     // by making it change its current angle
//     setAngle(displacement, wanderAngle);
//     //
//     // Change wanderAngle just a bit, so it
//     // won't have the same value in the
//     // next game frame.
//     wanderAngle += Math.random() * ANGLE_CHANGE - ANGLE_CHANGE * .5;
//     //
//     // Finally calculate and return the wander force
//     var wanderForce :Vector3D;
//     wanderForce = circleCenter.add(displacement);
//     return wanderForce;
// }
//
//     public function setAngle(vector :Vector3D, value:Number):void {
//     var len :Number = vector.length;
//     vector.x = Math.cos(value) * len;
//     vector.y = Math.sin(value) * len;
//


    // steering = wander()
    // steering = truncate (steering, max_force)
    // steering = steering / mass
    // velocity = truncate (velocity + steering , max_speed)
    // position = position + velocity

    countDistToPlayer(player) {
        let dx = this.posX - player.posX;
        let dy = this.posY - player.posY;
        let result = Math.sqrt(dx * dx + dy * dy);
        return result;
    }

    //call from server
    makeDesicions(players) {
        this.setDeffaultActions();
        let minDist = 100000;
        let nearestPlayer = null;
        let onMisledPlayer = null;

        for (let playerId in players) {
            let player = players[playerId];
            if (player.id === this.id) continue;
            let dist = this.countDistToPlayer(player);
            // console.log("Dist from", this.id, ":", dist, "Min dist to", player.id, ":", minDist)
            if (dist < minDist) {
                minDist = dist;
                nearestPlayer = player;
            }
            if (this.isInArea(this.botVision, player)) {
                // console.log("Fire on player", playerId);
                onMisledPlayer = player;
                this.aimOnPlayer(onMisledPlayer);
                this.startFire();
                break;
            }
        }
        if(onMisledPlayer === null) this.stopFire();
        if (nearestPlayer !== null) {
            // console.log(this.id, " follows by", nearestPlayer.id);
            this.wanderToPlayer(nearestPlayer);
        }
    }


}

function randomInteger(min, max) {
	var rand = min - 0.5 + Math.random() * (max - min + 1)
	rand = Math.round(rand);
	return rand;
}

module.exports = Player;