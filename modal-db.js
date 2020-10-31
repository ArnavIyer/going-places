const WebSocket = require('ws');
const fs = require('fs');
const {spawn} = require('child_process');

const wss = new WebSocket.Server({ port: 7077 });
wss.on("connection", ws => {
    console.log("Connected");

    ws.on("message", msg => {
        // trigger update_modal.py
        const python = spawn('python', ['update_modal.py',]);

        var dataToSend = ''

        // obtain new innerHTML data
        python.stdout.on('data', function (data) {
            console.log('Pipe data from python script ...');
            dataToSend = data.toString();
        });

        python.on('close', (code) => {
            console.log(`child process close all stdio with code ${code}`);
            // send data to browser
            console.log(dataToSend);
            ws.send(dataToSend);
        });
    });

    ws.on("close", () => {
        console.log("Client has disconnected");
    });
});