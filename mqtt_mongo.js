// Load environment variables
require('dotenv').config();

//MQTT-välityspalvelimen määrittely
const mqtt = require('mqtt');
const broker = process.env.MQTT_BROKER || 'mqtt://test.mosquitto.org';
const user = process.env.MQTT_USER || '';
const pw = process.env.MQTT_PASSWORD || '';
const http = require('http');

// Store script state
let isRunning = true;

// Create HTTP server
const server = http.createServer((req, res) => {
  if (req.url === '/control' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const data = JSON.parse(body);
      isRunning = data.state;
      console.log(`Script state changed to: ${isRunning}`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, state: isRunning }));
    });
  } else if (req.url === '/status' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ state: isRunning }));
  } else if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <head>
          <title>Status</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
            .status { font-size: 24px; margin: 20px; }
            .running { color: green; }
            .stopped { color: red; }
          </style>
        </head>
        <body>
          <div class="status">
            Status: <span class="${isRunning ? 'running' : 'stopped'}">${isRunning ? 'RUNNING' : 'STOPPED'}</span>
          </div>
        </body>
      </html>
    `);
  } else {
    res.writeHead(404);
    res.end();
  }
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Control server running on port ${port}`);
});

//määritellään välityspalvelimen "olio"
mq = mqtt.connect(broker, {
  'username': user,
  'password': pw
});

//tilataan oikea topic
mq.subscribe('automaatio/#');

//liitytään välityspalvelimeen
mq.on('connect', function () {
  console.log('Connected to MQTT.....');
});

console.log("Connecting to MongoDB...");
//Määritellään tietokanta-API
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGODB_URI || "mongodb+srv://calamari:KUUmaaKUU6@suuntaava.gkiuv.mongodb.net/?retryWrites=true&w=majority&appName=suuntaava";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

//määritellään tietokannan ja kokoelman nimi sekä dataobjekti sensoridatan käsittelyyn
const myDB = client.db("sensordata2");
const myColl = myDB.collection("sensordata2");
var obj;

console.log("Connecting to MongoDB... asd");

// Handle messages
mq.on('message', function (topic, message) {
  if (isRunning && topic.startsWith('automaatio/')) {
    console.log(message.toString('utf8'));
    obj = JSON.parse(message);
    console.log(obj.Time, obj.T, obj.H, obj.DP, obj.pCount);
    myColl.insertOne(obj);
    console.log(`An entry was inserted successfully`);
  }
});
