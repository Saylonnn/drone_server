const db = require("../db/databaseConnection");
const argon2 = require("argon2");

async function verify(hash, password){
    const correct = await argon2.verify(hash, password).catch(error => console.log(err));
    return correct;
}

function isAuthorized(req, res, next) {
    console.log("-----------------------------------------");

    var email = req.headers["email"];
    var password = req.headers["password"];

    console.log("email: "+ email + " password: "+password);
    if (email === undefined || password === undefined){
        res.status(200);
        res.send("no password or email");
        console.log("empty field");
    }else{
        db.execute('Select hash from users where email like ?', [email])
            .then(result => {
                if (result[0][0] !== undefined){
                    argon2.verify(result[0][0]["hash"], password)
                        .then(result => {
                            console.log("argon verify")
                            console.log("verify result: ", result)
                            if (result){
                                next();
                            }else{
                                res.status(200);
                                res.send("password or email incorrect");
                            }
                        })
                        .catch(err => {
                            console.log(err);
                            res.status(500);
                            res.send("server error");
                        });
                }else{
                    console.log("no password for ", email);
                    res.status(200);
                    res.send("password or email incorrect");
                }
            })
            .catch(err => {
                console.log(err);
                res.status(500);
                res.send("server error");
            });
    }
}
module.exports = isAuthorized;