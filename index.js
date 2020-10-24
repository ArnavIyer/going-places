const express = require('express')
const app = express()
const path = require('path');
var cors = require('cors')

app.use(cors())

app.use("/public", express.static('public'))

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});