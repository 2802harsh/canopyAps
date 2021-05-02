const password = require('./password');
const dbCreds = {
    host: "localhost",
    user: "root",
    password: password,
    database: "canopy"
};

module.exports = dbCreds;