"use strict"

class Cell {
    constructor(x, y, isBlock) {
        this.size = 50 /*px*/;
        this.posX = x * size + size/2;
        this.posY = y * size + size/2;
        this.isBlock = isBlock;
    }

}