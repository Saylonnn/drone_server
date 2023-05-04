const db = require('../db/droneDatabaseConnection');
const argon2 = require("argon2");

const TOKEN_LENGTH = 256;
const MIN_TAG_LENGTH = 6;

function getRandomString(length) {
    var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    var charLength = chars.length;
    var result = '';
    for ( var i = 0; i < length; i++ ) {
        result += chars.charAt(Math.floor(Math.random() * charLength));
    }
    return result
}
function registerDrone(req, res, next){
    const tag = req.headers["tag"];
    const generated_Token = getRandomString(128);
    console.log(generated_Token);

    if(tag === undefined){
        res.status(401);
        res.send("invalid tag");
        console.log("no tag transmitted");
    } else if(tag.length < 6) {
        res.status(401);
        res.send("invalid tag, min length 6 char");
        console.log("invalid tag length");
    } else{
        db.execute('Select tag from drones where tag like ?', [tag])
            .then(result => {
                if (result[0][0] === undefined) {
                    console.log("generating hash");
                    argon2.hash(generated_Token, {type: argon2.argon2id})
                        .then(result => {
                            console.log("hash", result);
                            db.execute('Insert into drone_app.drones (tag, token_hash) values (?,?)', [tag, result])
                                .then(result => {
                                    next();
                                })
                                .catch(err => {
                                    console.log(err);
                                    res.status(500);
                                    res.send("server error");
                                });
                        })
                        .catch(error => {
                            console.log(err);
                            res.status(500);
                            res.send("server error");
                        });
                }else{
                    console.log("Tag already in use");
                    res.status(401);
                    res.send("Tag already in use");
                }

            })
            .catch(err => {
                console.log(err);
                res.status(500);
                res.send("server error");
            });
    }
};

module.exports = registerDrone();