"use strict"

class Cell {
    constructor(x, y, isBlock) {
        this.size = 50 /*px*/;
        this.posX = x * size;
        this.posY = y * size;
        this.isBlock = isBlock;
    }

}