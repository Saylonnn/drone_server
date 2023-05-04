const db = require('../db/databaseConnection');
const argon2 = require("argon2");

const MIN_PW_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 20;

function register(req, res, next) {
    console.log(' -------------------------------');
    console.log('[register aufgerufen] ');
    const email = req.headers["email"];
    const username = req.headers["username"];
    const password = req.headers["password"];
    console.log("email: ", email, "username: ", username, "password: ", password);
    if(email === undefined || username === undefined || password === undefined){
        res.status(200);
        res.send('invalid entry');
        console.log("invalid entry");
    } else if(password.length <= MIN_PW_LENGTH || password.length >= MAX_PASSWORD_LENGTH){
        res.status(200);
        res.send('invalid pw length');
        console.log("invalid pw length");
    }else {
        db.execute('Select email From users where email like ?', [email]).then(result => {
            console.log("db execute : result: ", result);
            if (result[0][0] === undefined){
                console.log("generating hash");
                argon2.hash(password, {type: argon2.argon2id})
                    .then(result => {
                        console.log("hash", result);
                        db.execute('Insert into drone_app.users (email, username, hash, token) values (?,?,?,?)',[email, username, result, token])
                            .then(result => {
                                    next();
                                }
                            ).catch(err => {
                            console.log(err);
                            res.status(500);
                            res.send("server error");
                        })
                    }).catch(error =>{
                    console.log(err);
                    res.status(500);
                    res.send("server error")
                });
            }else{
                console.log("Email already used: ");
                console.log("email not excepted");
                res.status(200);
                res.send("email not excepted");
            }
        }).catch(err => {
            console.log(err);
            res.status(500);
            res.send("server error")
        });
    }
}
module.exports = register;