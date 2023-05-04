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

app.post('/drone/startTransmission', authDrone,  (req, res) => {
    const session = {
        id : Math.random().toString(36).substring(7),
        broadcaster: null,
        viewers: []
    };
    sessions.push(session);
    if (!streamOnline) {
        const wss = new WebSocket.Server({ port: 8080});
        // on connect
        wss.on('connection', (ws) => {
            if(!session.broadcaster) {
                session.broadcaster = ws;
                ws.send(JSON.stringify({type: 'broadcaster'}));
            } else {
                session.viewers.push(ws);
                ws.send(JSON.stringify({type: 'viewer', sessionID: session.id}));
                session.broadcaster.send(JSON.stringify({type:'viewerConnected', viewerCount: session.viewers.length }));

            }
            // on message
            ws.on('message', (message) => {
                session.viewers.forEach((viewer) => {
                    viewer.send(message);
                });
            });

            // on close connection
            ws.on('close', () => {
                if (ws === session.broadcaster) {
                    session.viewers.forEach((viewer) => {
                        viewer.close();
                    });
                    session.splice(session.indexOf(session), 1);
                } else {
                    session.viewers.splice(session.viewers.indexOf(ws), 1);
                    session.broadcaster.send(JSON.stringify({type: 'viewerDisconnected', viewerCount: session.viewers.length}));

                }
            });
        })
    }
});

const server = app.listen(PORT, () => console.log(`its alive on http://localhost:${PORT}`));

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws);
    });
});


