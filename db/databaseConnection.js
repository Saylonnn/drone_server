require('dotenv').config();
const mysql = require('mysql2');


const pool = mysql.createPool({
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    database: 'chatapp'
});

module.exports = pool.promise();