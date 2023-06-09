const express = require('express');
const isAuthorized = require('./middleware/authorisation');
const register = require('./middleware/register');
const registerDrone = require('./middleware/registerDrone');
const authDrone = require('./middleware/authDrone');
const https = require('https');
const fs = require('fs');
const helmet = require('helmet');
const WebSocket = require('ws');





const app = express();
app.use(helmet());
app.use(express.static('static'));
app.use(express.json());

const PORT = 5000;


const sessions = [];
const streamOnline = false;


app.get('/' , (req, res)=>{
    res.status(200).send('messenger-api');
});

app.get('/auth/login', isAuthorized, /*updateToken,*/ (req, res) =>{
    res.status(200);
    res.send('accepted');

});

app.get('/auth/register', register, (req, res) => {
    res.status(200);
    res.send('registered');
    console.log("register finished");
});

app.get('/drone/registerDrone', registerDrone, (req, res) => {
    //res.status(200);
    //res.send('Drone registered');
    console.log("Drone Register finished");
});

app.get('/drone/authDrone', authDrone, (req, res) => {
    res.status(200);
    res.send('Drone authenticated');
    console.log("Drone Authenticaiton finished");
});

app.getDroneStart('/drone/startTransmission', authDrone,  (req, res) => {
    const session = {
        id : Math.random().toString(36).substring(7),
        broadcaster: null,
        viewers: []
    };
    sessions.push(session);

});

const server = app.listen(PORT, () => console.log(`its alive on http://localhost:${PORT}`));

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws);
    });
});


