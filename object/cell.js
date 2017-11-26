"use strict"

class Cell {
    constructor(x, y, isBlock) {
        this.size = 50 /*px*/;
        this.i = x;
        this.j = y;
        this.posX = x * this.size;
        this.posY = y * this.size;
        this.isBlock = isBlock;
        this.isReserved = false;
    }

    equals(cell){
        if(!(cell instanceof Cell)) return false;
        if(this.i !== cell.i) return false;
        if(this.j !== cell.j) return false;
        if(this.posX !== cell.posX) return false;
        if(this.posY !== cell.posY) return false;
        if(this.size !== cell.size) return false;
        return true;
    }

}

module.exports = Cell;