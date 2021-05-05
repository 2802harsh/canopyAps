const mysql = require('mysql');
const { password , user } = require('./password');

const dbCreds = {
    host: "localhost",
    user: user,
    password: password,
    database: "canopy"
};

const con = mysql.createConnection(dbCreds);

con.connect((err) => {
    if (err) {
        console.log(err);
    }
    console.log("Connected!");
});

module.exports = con;