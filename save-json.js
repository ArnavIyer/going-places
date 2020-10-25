const WebSocket = require('ws');
const fs = require('fs');
const {spawn} = require('child_process');

const wss = new WebSocket.Server({ port: 8088 });
wss.on("connection", ws => {
    console.log("Connected");

    ws.on("message", json => {
        // console.log(json);
        // console.log('received ' + JSON.parse(json));

        fs.writeFile("json.json", json, 'utf8', function(err) {
            if (err) {
                console.log(err);
            }
            console.log(json.hull_data);
            console.log("written");
        });

        const python = spawn('python', ['populate_route_data.py',]);
    });

    ws.on("close", () => {
        console.log("Client has disconnected");
    });
});
