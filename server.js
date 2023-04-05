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
    obj.gameInfo = { url: urlFileName, missilesPerTurn, connectedPlayers: 1, numberOfPlayers };
    obj[`${playerName}`] = { name: playerName };
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
            obj[`${playerName}`] = { name: playerName };
            const map = obj.gameInfo.map;
            json = JSON.stringify(obj); //convert it back to json
            fs.writeFile(`${urlFileName}.json`, json, 'utf8', function readFileCallback(error, data2) {
                if (error) {
                    console.log(error);
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
                } else {
                    res.send({ status: "ok", message: "map saved" });
                }
            }); // write it back 
        }
    });
});


app.get('/endturn', (req, res) => { })

app.listen(port, () => console.log(`Listening on port ${port}`));