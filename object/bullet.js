"use strict"

class Bullet{
    constructor(damage, size, velo, angle, posX, posY){
        this.damage = damage;
        this.size = size;
        this.velo = velo;
        this.angle = angle;
        this.posX = posX;
        this.posY = posY;
        this.radius = 2 /*px*/;
    }
}

module.exports = Bullet;