const express = require('express')
const app = express()
const path = require('path');
const {spawn} = require('child_process');

var favicon = require('serve-favicon');

app.use("/public", express.static('public'))
app.use('/favicon.ico', express.static('public/images/favicon.ico'));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});