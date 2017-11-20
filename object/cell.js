"use strict"

class Cell {
    constructor(x, y, isBlock) {
        this.size = 50 /*px*/;
        this.posX = x * this.size + this.size/2;
        this.posY = y * this.size + this.size/2;
        this.isBlock = isBlock;
    }

}

module.exports = Cell;