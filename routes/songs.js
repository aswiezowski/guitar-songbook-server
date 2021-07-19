var express = require('express');
var router = express.Router();
const fs = require('fs');
const fsPromises = require('fs').promises;
var sanitizeFilename = require("sanitize-filename");
const { SONG_DIR } = require('./constants')
const SUPPORTED_FORMATS = ['chordpro', 'ultimateguitar', 'regular'];

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

router.put('/', async (req, res, next) => {
    const { body } = req;
    const songFileName = sanitizeFilename(body.name + "." + body.format);
    const oldFileName = sanitizeFilename(body.oldFileName);
    if (!body || !body.name || !body.oldFileName || !body.format || !body.chords) {
        res.status(400).json({
            "error": "name, oldFileName, format and chords fields are required"
        });
    }
    else if (!SUPPORTED_FORMATS.includes(body.format)) {
        res.status(400).json({
            "error": "format field has to have one of value: " + SUPPORTED_FORMATS
        });
    }
    else if (!await fileExistsAndIsWritable(SONG_DIR + oldFileName)) {
        res.status(400).json({
            error: "song doesn't exist or can't be renamed"
        });
    }
    else if (songFileName !== oldFileName && await fileExist(SONG_DIR + songFileName)) {
        res.status(400).json({
            error: "song already exists"
        });
    } else {
        try {
            await fsPromises.writeFile(SONG_DIR + songFileName, body.chords);
            if (songFileName !== oldFileName) {
                try {
                    await fsPromises.rm(SONG_DIR + oldFileName);
                    res.status(200).json();
                }
                catch (error) {
                    res.status(500).json({
                        "error": "couldn't remove old song"
                    });
                    console.log(err);
                }
            } else {
                res.status(200).json();
            }
        } catch (error) {
            res.status(500).json({
                "error": "couldn't add song"
            });
            console.log(err);
        }
    }
});

const fileExistsAndIsWritable = async (filePath) => {
    try {
        await fsPromises.access(filePath, fs.constants.F_OK | fs.constants.W_OK);
        return true;
    } catch (err) {
        return false;
    }
}

const fileExist = async (filePath) => {
    try {
        await fsPromises.access(filePath, fs.constants.F_OK);
        return true;
    } catch (err) {
        return false;
    }
}

module.exports = router;