"use strict"

var Level = require("../global").constants.LEVEL
let Cell = require("./cell");

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
        for (var i = 0; i < this.levelSize; i++) {
            this.cellMatrix [i] = [];
            for (var j = 0; j < this.levelSize; j++) {
                this.cellMatrix [i][j] = new Cell(i, j, generationMatrix[i][j])
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
        if (!this.cellMatrix[randI][rangJ].isBlock) {
            return this.cellMatrix[randI][rangJ];
        }
        else {
            this.getEmptyCell();
        }
    }

    getCellByPoint(x, y) {
        let cellSize = this.cellMatrix[0][0].size;
        let i = Math.floor(x / cellSize);
        let j = Math.floor(y / cellSize);
        if (i < this.levelSize && j < this.levelSize) {
            //console.log("Map returned cell: ", i, "  ", j )
            return this.cellMatrix[i][j];
        }
        else {
            //console.log("No cell in this point;")
        }
    }
}

module.exports = Map;