const db = require('../db/droneDatabaseConnection');
const argon2 = require("argon2");

async function verify(hash, password){
    const correct = await argon2.verify(hash, password).catch(error => console.log(err));
    return correct;
}

function authorizeDrone(req, res, next){
    var tag = req.headers["tag"];
    var token = req.headers["token"]
    console.log("tag: " + tag + " token: " + token);
    if (token === undefined || tag === undefined){
        res.status(401);
        res.send("invalid credentials");
        console.log("empty credential field");
    }else{
        db.execute('Select hash from users where email like ?', [tag])
            .then(result => {
                if (result[0][0] !== undefined){
                    argon2.verify(result[0][0]["token_hash"], toke)
                        .then(result => {
                            console.log("argon verify result: ", result);
                            if(result){
                                next();
                            }else{
                                res.status(401);
                                res.send("invalid credentials");
                            }
                        })
                        .catch(err => {
                            console.log(err);
                            res.status(500);
                            res.send("server error");
                        });
                }else{
                    console.log("no matching entry");
                    res.status(401);
                    res.status("invalid credentials");
                }
            })
            .catch(err => {
                console.log(err);
                res.status(500);
                res.send("server error");
            })
    }
};

module.exports = authorizeDrone;