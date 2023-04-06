const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const fs = require('fs');
const moment = require('moment');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function (req, res, next) {

    res.setHeader("Access-Control-Allow-Origin", "*");

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.post('/creategame', (req, res) => {
    const urlFileName = req.body.post.url;
    const missilesPerTurn = req.body.post.missilesPerTurn;
    const playerName = req.body.post.playerName;
    const numberOfPlayers = req.body.post.numberOfPlayers;
    let date = moment();

    obj = {}; //crete object
    obj.gameInfo = { url: urlFileName, missilesPerTurn, connectedPlayers: 1, numberOfPlayers, playersTurnEndedCount: 0, turnCount: 0 };
    obj[`${playerName}`] = { name: playerName, turnEnded: false };
    json = JSON.stringify(obj); //convert it to json

    fs.writeFile(`${urlFileName}.json`, json, 'utf8', function readFileCallback(error, data2) {
        if (error) {
            console.log(error);
            res.send({ status: "error", message: "game not created" });
        } else {
            res.send({ status: "ok", message: "game created" });
        }
    }); // write it back 
});

app.post('/connecttogame', (req, res) => {
    const urlFileName = req.body.post.url;
    const playerName = req.body.post.playerName;

    fs.readFile(`${urlFileName}.json`, 'utf8', function readFileCallback(err, data) {
        if (err) {
            console.log(err);
            res.send({ status: "error", message: "failed to connect to game - Game file not found" });
        } else {
            const obj = JSON.parse(data);
            obj.gameInfo.connectedPlayers = obj.gameInfo.connectedPlayers + 1;
            obj[`${playerName}`] = { name: playerName, turnEnded: false };
            const map = obj.gameInfo.map;
            json = JSON.stringify(obj); //convert it back to json
            fs.writeFile(`${urlFileName}.json`, json, 'utf8', function readFileCallback(error, data2) {
                if (error) {
                    console.log(error);
                    res.send({ status: "error", message: "failed to connect to game - cannot write to file" });
                } else {
                    res.send({ map, status: "ok", message: "connected to game" });
                }
            }); // write it back 
        }
    });
});

app.post('/savemap', (req, res) => {
    const urlFileName = req.body.post.url;
    const map = req.body.post.map;

    fs.readFile(`${urlFileName}.json`, 'utf8', function readFileCallback(err, data) {
        if (err) {
            console.log(err);
            res.send({ status: "error", message: "failed to save map" });
        } else {
            obj = JSON.parse(data); //now it an object
            obj.gameInfo.map = map; //add some data
            json = JSON.stringify(obj); //convert it back to json
            fs.writeFile(`${urlFileName}.json`, json, 'utf8', function readFileCallback(error, data2) {
                if (error) {
                    console.log(error);
                    res.send({ status: "error", message: "failed to write file to save map" });
                } else {
                    res.send({ status: "ok", message: "map saved" });
                }
            }); // write it back 
        }
    });
});


app.get('/endturn', (req, res) => {
    const urlFileName = req.body.post.url;
    const playerName = req.body.post.playerName;
    const shipCoordinates = req.body.post.shipCoordinates;
    const missileCoordinates = req.body.post.missileCoordinates;
    const map = req.body.post.map;
    const turnCount = req.body.post.turnCount;


    fs.readFile(`${urlFileName}.json`, 'utf8', function readFileCallback(err, data) {
        if (err) {
            console.log(err);
            res.send({ status: "error", message: "failed to read file for turn end" });
        } else {
            obj = JSON.parse(data); //now it an object
            obj[`${playerName}`].turnEnded = true; //add some data
            obj[`${playerName}`].shipCoordinates = shipCoordinates; //add some data
            obj.gameInfo.map = map;
            if (obj.gameInfo.turnCount === turnCount) {
                obj.gameInfo.turnMissileCoordinates.push(missileCoordinates)
            } else {
                obj.gameInfo.turnMissileCoordinates = [];
            }
            obj.gameInfo.turnCount = turnCount;
            obj.gameInfo.playersTurnEndedCount = obj.gameInfo.playersTurnEndedCount + 1;


            json = JSON.stringify(obj); //convert it back to json
            fs.writeFile(`${urlFileName}.json`, json, 'utf8', function readFileCallback(error, data2) {
                if (error) {
                    console.log(error);
                    res.send({ status: "error", message: "failed to write file for turn end" });
                } else {
                    res.send({ status: "ok", message: "turn ended" });
                }
            }); // write it back 
        }
    });
})

app.get('/pollendturn', (req, res) => {
    fs.readFile(`${urlFileName}.json`, 'utf8', function readFileCallback(err, data) {
        if (err) {
            console.log(err);
            res.send({ status: "error", message: "failed to read file for poll turn end" });
        } else {
            obj = JSON.parse(data); //now it an object
            obj[`${playerName}`].turnEnded = true; //add some data
            obj[`${playerName}`].shipCoordinates = shipCoordinates; //add some data
            obj.gameInfo.map;
            if (obj.gameInfo.turnCount === turnCount) {
                obj.gameInfo.turnMissileCoordinates.push(missileCoordinates)
            } else {
                obj.gameInfo.turnMissileCoordinates = [];
            }
            obj.gameInfo.turnCount = turnCount;
            obj.gameInfo.playersTurnEndedCount = obj.gameInfo.playersTurnEndedCount + 1;

            var allPlayersEndedTurn = false;
            if (obj.gameInfo.playersTurnEndedCount === obj.gameInfo.numberOfPlayers) {
                allPlayersEndedTurn = true;
            }
            return ({ allPlayersEndedTurn, map: obj.gameInfo.map, missileCoordinates: obj.gameInfo.turnMissileCoordinates })
        }
    });
});

app.listen(port, () => console.log(`Listening on port ${port}`));