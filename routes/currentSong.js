var express = require('express');
var router = express.Router();
const fs = require('fs');
const {SONG_DIR} = require('./constants')

let currentSong;

router.get('/', function (req, res, next) {
    res.json(
        {
            name: currentSong
        });

});

router.post('/', function (req, res, next) {
    const { body } = req;
    if (!body || !body.name) {
        res.status(400).json({
            error: "name field is required"
        });
    } else {
        fs.access(SONG_DIR + body.name, fs.constants.R_OK, (err) => {
            if (err) {
                res.status(400).json({
                    error: "song not exist"
                });
            } else {
                currentSong = body.name;
                res.status(200).json();
            }
        });
    }
});

module.exports = router;