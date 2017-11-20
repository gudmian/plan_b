"use strict";

let http = require("http");
let path = require("path");
let express = require("express");
let logger = require("winston");
let socketIo = require("socket.io");


const app = express();
const server = http.Server(app);
const mainSocket = socketIo(server);


app.use(express.static(path.join(__dirname, "/static")));

app.get("/", (req, res)=>{
    res.sendfile("index.html");
});



let players{

};

mainSocket.on("connection", (socket)=>{
    socket.on("connect", ()=>{

    });
});




server.listen(8080, ()=>{
    console.log("Server run on port:", 8080);
});