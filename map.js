"use strict"

var Level = require("./global").constants.LEVEL

class Map {
    constructor(levelType) {

        if (levelType === Level.SMALL) {
            this.levelSize = 16;
        }
        if (levelType === Level.MEDIUM) {
            this.levelSize = 32;
        }
        if (levelType === Level.BIG) {
            this.levelSize = 64;
        }

        this.cellMatrix = [];

        var generationMatrix = Level.lvlgen[levelType - 1]
        for (var i = 0; i < levelSize; i++) {
            this.cellMatrix [i] = [];
            for (var j = 0; j < levelSize; j++) {
                this.cellMatrix [i][j] = new Cell(x, y, generationMatrix[i][j])
            }

        }
    }

    //nees replace to Util
    getRandom(x) {
        return Math.floor(Math.random() * x);
    }

    getEmptyCell() {
        var randI = this.getRandom(this.levelSize);
        var rangJ = this.getRandom(this.levelSize);
        if (!this.cellMatrix[randI][rangJ].isBlock){
            return this.cellMatrix[randI][rangJ];
        }
        else{
            this.getEmptyCell();
        }
    }
}