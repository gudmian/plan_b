"use strict"

class PowerUp{
    constructor(type, cell){
        this.radius = 50 /*px*/;
        this.posX = cell.posX;
        this.posY = cell.posY;
        this.type = type;
    }
}