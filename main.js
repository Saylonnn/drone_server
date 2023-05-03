const express = require('express');
const db = require('./db/databaseConnection');

const https = require('https');
const fs = require('fs');
const helmet = require('helmet');





const app = express();
app.use(helmet());
app.use(express.static('static'));
app.use(express.json());

const PORT = 1337;




const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/api.caylonn.de/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/api.caylonn.de/fullchain.pem'),
};

/**
 * URLS
 * /auth/register                   -GET
 * /auth/login                      -GET
 * /auth/updateToken                -POST
 * /messaging/send_message          -POST
 * /messaging/get_update            -GET
 *
 * /contacts/send_friend_request    -POST
 * /contacts/accept_friend_request  -POST
 * /contacts/denie_friend_request   -POST
 * /contacts/delete_friend          -POST
 *
 * /utility/get_settingsbackup      -GET
 * /utility/upload_settings         -POST
 */


app.get('/' , (req, res)=>{
    res.status(200).send('messenger-api');
});

app.get('/auth/login', isAuthorized, updateToken, (req, res) =>{
    res.status(200);
    res.send('accepted');

});

app.get('/auth/register', register, (req, res) => {
    res.status(200);
    res.send('registered');
    console.log("register finished");
});


app.post('/messaging/send_message', isAuthorized, sendMessage,  (req,res) =>{
    res.status(200);
    res.send("message send ");
});

app.get('/messaging/get_update', isAuthorized , sendUpdate, (req, res)=>{
    res.status(200);
});

app.get('/contacts/list_users', list_users, (req, res) => {
    res.status(200);
});


function main(){
    console.log('init');
}
app.listen(
    8080,
    () => console.log(`its alive on http://localhost:${PORT}`)
)

https.createServer(options, app).listen(PORT);
