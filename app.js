const express = require('express')
const app = express()
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const session = require('express-session');
const e = require('express');

app.set('view engine', 'ejs');
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))
app.use(session({
    secret: 'mySecretKey',
    resave: false,
    saveUninitialized: true
}))


const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "shreyas12",
    database: "canopy"
});

con.connect((err) => {
    if (err) throw err;
    console.log("Connected!");
});

app.get('/', (req, res) => {
  res.render('index')
})

app.post('/logout', async (req, res) => {
    req.session.loggedIn = false;
    res.redirect('/');
})

// Owner
app.get('/owner/register', (req, res) => {
    res.render('ownerRegister')
})

app.post('/owner/register', async (req, res) => {
    let name = req.body.name;
    let contact = req.body.contact;
    let address = req.body.address;
    let password = req.body.password;
    let passwordHash = await bcrypt.hash(password, 10);
    let query = `INSERT INTO OwnerTable (OwnerName, OwnerContact, OwnerAddress, OwnerPassword) VALUES ("${name}", "${contact}", "${address}", "${passwordHash}");`;
    con.query(query, function (err, result) {
        if (err) throw err;
        console.log(result);
        res.redirect('/owner/login');
    });
})

app.get('/owner/login', (req, res) => {
    res.render('ownerLogin')
})

app.post('/owner/login', async (req, res) => {
    let contact = req.body.contact;
    let password = req.body.password;
    let query = `SELECT * FROM OwnerTable WHERE OwnerContact = ${contact};`;
    con.query(query, function (err, result, fields) {
        if (err) throw err;
        if(!result) res.redirect("/owner/login");
        bcrypt.compare(password, result[0].OwnerPassword).then((resu) => {
            if(resu) {
                req.session.loggedIn = true;
                req.session.userType = "Owner";
                req.session.user = result[0];
                res.redirect("/owner/dashboard");
            } else {
                res.redirect("/owner/login");
            }
        });
    });
})

app.get('/owner/dashboard', (req, res) => {
    if(req.session.loggedIn && req.session.userType == "Owner") {
        res.render('ownerDashboard', {user: req.session.user})
    }
    else
        res.redirect("/owner/login");
})

// Tenant
app.get('/tenant/register', (req, res) => {
    res.render('tenantRegister')
})

app.post('/tenant/register', async (req, res) => {
    let name = req.body.name;
    let contact = req.body.contact;
    let address = req.body.address;
    let password = req.body.password;
    let passwordHash = await bcrypt.hash(password, 10);
    let query = `INSERT INTO TenantTable (TenantName, TenantContact, TenantAddress, TenantPassword) VALUES ("${name}", "${contact}", "${address}", "${passwordHash}");`;
    con.query(query, function (err, result) {
        if (err) throw err;
        console.log(result);
        res.redirect('/tenant/login');
    });
})

app.get('/tenant/login', (req, res) => {
    res.render('tenantLogin')
})

app.post('/tenant/login', async (req, res) => {
    let contact = req.body.contact;
    let password = req.body.password;
    let query = `SELECT * FROM TenantTable WHERE TenantContact = ${contact};`;
    con.query(query, function (err, result, fields) {
        if (err) throw err;
        if(!result) res.redirect("/tenant/login");
        bcrypt.compare(password, result[0].TenantPassword).then((resu) => {
            if(resu) {
                req.session.loggedIn = true;
                req.session.userType = "Tenant";
                req.session.user = result[0];
                res.redirect("/tenant/dashboard");
            } else {
                res.redirect("/tenant/login");
            }
        });
    });
})

app.get('/tenant/dashboard', (req, res) => {
    if(req.session.loggedIn && req.session.userType == "Tenant") {
        res.render('tenantDashboard', {user: req.session.user})
    }
    else
        res.redirect("/tenant/login");
})

app.listen(3000, () => {
  console.log(`Apartment Management App listening at http://localhost:3000`)
})