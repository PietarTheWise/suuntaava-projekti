# MQTT-MongoDB Bridge with HTTP Control

This application bridges MQTT messages to MongoDB and provides HTTP endpoints to control its operation. It can be turned on/off remotely through HTTP requests.

## Prerequisites

- Node.js (version 18 or higher)
- npm (Node Package Manager)
- MongoDB connection string
- MQTT broker (default: test.mosquitto.org)

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env` file:
```
MQTT_BROKER=mqtt://test.mosquitto.org
MQTT_USER=
MQTT_PASSWORD=
MONGODB_URI=your_mongodb_uri
PORT=3000
```

## Running the Application

Start the application:
```bash
node mqtt_mongo.js
```

The application will:
- Connect to the MQTT broker
- Connect to MongoDB
- Start an HTTP server on port 3000

## HTTP Control Endpoints

### Turn the application ON
```bash
curl -X POST -H "Content-Type: application/json" -d '{"state":true}' http://localhost:3000/control
```

### Turn the application OFF
```bash
curl -X POST -H "Content-Type: application/json" -d '{"state":false}' http://localhost:3000/control
```

### Check current status
```bash
curl http://localhost:3000/status
```

## Node-RED Integration

To control the application from Node-RED:

1. Add an HTTP request node for control:
   - Method: POST
   - URL: `http://localhost:3000/control`
   - Headers: `Content-Type: application/json`
   - Body: `{"state": true}` or `{"state": false}`

2. Add a dashboard switch node:
   - Connect it to the HTTP request node
   - Configure the switch to send the appropriate payload

Example Node-RED flow:
```
[Switch] -> [Function] -> [HTTP Request]
```

Function node code:
```javascript
msg.payload = {
    "state": msg.payload
};
return msg;
```

3. Add an HTTP request node for status:
   - Method: GET
   - URL: `http://localhost:3000/status`
   - Connect to a dashboard text node to display the current state

## Docker Deployment

1. Build the Docker image:
```bash
docker build -t mqtt-mongo-app .
```

2. Run the container:
```bash
docker run -d \
  --env-file .env \
  -p 3000:3000 \
  --name mqtt-mongo \
  mqtt-mongo-app
```
