var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')

var songsRouter = require('./routes/songs');
var currentSongRouter = require('./routes/currentSong');
var app = express();

var corsOptions = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
    credentials: true,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions))

app.use(logger(process.env.LOG_LEVEL || 'common'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/songs', songsRouter);
app.use('/current-song', currentSongRouter);

module.exports = app;
