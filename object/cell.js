"use strict"

class Cell {
    constructor(x, y, isBlock) {
        this.size = 50 /*px*/;
        this.i = x;
        this.j = y;
        this.posX = x * this.size;
        this.posY = y * this.size;
        this.isBlock = isBlock;
    }

}

module.exports = Cell;