var express = require('express');
var router = express.Router();
const fs = require('fs');
var sanitizeFilename = require("sanitize-filename");

const SUPPORTED_FORMATS = ['chordpro', 'ultimateguitar', 'regular'];
const SONG_DIR = "./public/chords/"

router.get('/', function (req, res, next) {

    const files = fs.readdir("./public/chords", (err, files) => {
        if (err) {
            console.error(err);
            res.status(500).json({
                error: "Can't list files"
            });
        } else {
            const songs = files.map(filename => {
                const splittedFilename = filename.split('.');
                const extension = splittedFilename.pop();
                return { name: splittedFilename.join(), type: extension };
            })
            res.json({
                songs
            });
        }
    });

});

router.post('/', function (req, res, next) {
    const { body } = req;
    if (!body || !body.name || !body.format || !body.chords) {
        res.status(400).json({
            "error": "name, format and chords fields are required"
        });
    }
    else if (!SUPPORTED_FORMATS.includes(body.format)) {
        res.status(400).json({
            "error": "format field has to have one of value: " + SUPPORTED_FORMATS
        });
    }
    else {
        fs.writeFile(SONG_DIR + sanitizeFilename(body.name + "." + body.format), body.chords, function (err) {
            if (err) {
                res.status(500).json({
                    "error": "couldn't add song"
                });
                console.log(err);
            }

            res.status(201).json();
        });
    }

});

module.exports = router;