const WebSocket = require('ws');
const vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient();

const wss = new WebSocket.Server({port: 9099});
wss.on("connection", ws => {
    console.log("Connected");

    ws.on("message", url => {
        console.log('client has sent us: ' + url);
        // ws.send(url.toUpperCase());
        ws.send(isImageGood(url));
    });

    ws.on("close", () => {
        console.log("Client has disconnected");
    });
});

function isImageGood(url) {
    if (url == "") {
        return false;
    }

    let labels = await client.labelDetection(url);
    return true;
}

client
    .labelDetection('/home/arnav/Pictures/alena-aenami-wait.jpg')
    .then(results => {
        const labels = results[0].labelAnnotations;
        console.log('Labels: ');
        labels.forEach(label => console.log(label.description));
    });