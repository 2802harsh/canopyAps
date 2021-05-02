const { password , user } = require('./password');

const dbCreds = {
    host: "localhost",
    user: user,
    password: password,
    database: "canopy"
};

module.exports = dbCreds;