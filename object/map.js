"use strict";

let Level = require("../global").constants.LEVEL;
let Cell = require("./cell");
let Simplex = require("simplex-noise");

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

        var simplex = new Simplex(Math.random);

        for (var i = 0; i < this.levelSize; i++) {
            this.cellMatrix [i] = [];
            for (var j = 0; j < this.levelSize; j++) {
                var isBorder = i === 0 || j === 0 || i === (this.levelSize - 1) || j === (this.levelSize - 1);
                var noise = simplex.noise2D(i, j);
                noise = Math.abs(noise - 0.5) * 2;
                if(noise < 0) noise = 0;
                if(noise > 1) noise = 1;
                this.cellMatrix [i][j] = new Cell(i, j, isBorder || noise < 0.2);
            }

        }
    }

    //nees replace to Util
    getRandom(x) {
        return Math.floor(Math.random() * (x - 1 - 1) + 1);
    }

    getEmptyCell() {
        var randI = this.getRandom(this.levelSize);
        var rangJ = this.getRandom(this.levelSize);
        if (!this.cellMatrix[randI][rangJ].isBlock && !this.cellMatrix[randI][rangJ].isReserved) {
            let cell = this.cellMatrix[randI][rangJ];
            return cell;
        }
        else {
            return this.getEmptyCell();
        }
    }

    getCellByPoint(x, y) {
        let cellSize = this.cellMatrix[0][0].size;
        let i = Math.floor(x / cellSize);
        let j = Math.floor(y / cellSize);
        if (i < this.levelSize && j < this.levelSize) {
            return this.cellMatrix[i][j];
        }
        else {
            //console.log("No cell in this point;")
        }
    }
}

module.exports = Map;