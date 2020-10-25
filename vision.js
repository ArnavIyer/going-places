const WebSocket = require('ws');
const vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient();
const goodLabels = ["Public spaces", "Bridge", "Park", "Tree", "Natural landscape", "Building", "Monument", "Architecture", "Landmark"];
const badLabels = ["Ceiling", "Food"];

const wss = new WebSocket.Server({port: 9099});
wss.on("connection", ws => {
    console.log("Connected");

    ws.on("message", urls => {
        // console.log(urls.split(","));
        // ws.send(url.toUpperCase());
        ws.send( JSON.stringify(isImageGood(urls.split(","))) );
    });

    ws.on("close", () => {
        console.log("Client has disconnected");
    });
});

function isImageGood(urls) {
    answers = [];
    urls.forEach(function(url) {
        console.log(url);
        if (url == "") {
            answers.push(false);
            return;
        }
    
        ret = false;
        client.labelDetection("").then(results => {
            const labels = results[0].labelAnnotations;
            console.log('Labels:');
            labels.forEach(label => console.log(label.description));
            
            let map = new Map();
            goodLabels.forEach(function(label) {
                if (!map.has(label)) {
                    map.set(label, 0);
                } else {
                    map.set(label, 1);
                }
            });
            badLabels.forEach(function(label) {
                if (!map.has(label)) {
                    map.set(label, 0);
                } else {
                    map.set(label, 1);
                }
            });
            labels.forEach(function(label) {
                if (!map.has(label)) {
                    map.set(label, 0);
                } else {
                    map.set(label, 1);
                }
            });
            goodCount = 0;
            goodLabels.forEach(function(label) {
                if (map.get(label) == 1) {
                    goodCount++;
                }
            });
            if (goodCount > 1) {
                ret = true;
            }
            badLabels.forEach(function(label) {
                if (map.get(label) == 1) {
                    ret = false;
                }
            });
            console.log(map);
        });
    
        answers.push(ret);
    });
    return answers;
}
