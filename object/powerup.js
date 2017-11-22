"use strict"

class PowerUp{
    constructor(type, cell){
        this.radius = 10 /*px*/;
        this.posX = cell.posX + cell.size/2;
        this.posY = cell.posY + cell.size/2;
        this.type = type;
        this.duration = 5000;
    }
    isCollideWithPlayer(player){
        var XColl = false;
        var YColl = false;
        if ((this.posX + this.radius >= player.posX) && (this.posX <= player.posX + player.radius)) XColl = true;
        if ((this.posY + this.radius >= player.posY) && (this.posY <= player.posY + player.radius)) YColl = true;

        if (XColl & YColl) {
            return true;
        }
        return false;
    }
}

module.exports= PowerUp;