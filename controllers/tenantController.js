const mysql = require('mysql');
const bcrypt = require('bcrypt');
const session = require('express-session');
const con = require('../db.js');

let tenantRegisterGet = (req, res) => {
    res.render('tenantRegister')
}

let tenantRegisterPost = async (req, res) => {
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
}

let tenantLoginGet = (req, res) => {
    res.render('tenantLogin')
}

let tenantLoginPost = async (req, res) => {
    let contact = req.body.contact;
    let password = req.body.password;
    let query = `SELECT * FROM TenantTable WHERE TenantContact = ${contact};`;
    con.query(query, function (err, result, fields) {
        if (err) throw err;
        if(result.length == 0) {
            return res.redirect("/tenant/login");
        } 
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
}

let tenantDashboardGet = (req, res) => {
    if(req.session.loggedIn && req.session.userType == "Tenant") {
        let tenantId = req.session.user.Id;
        let query = `SELECT 
                        AP.*, B.BuildingName, B.Address 
                    FROM 
                        (SELECT
                            A.*, P.Date AS LastDate
                        FROM
                            ApartmentTable AS A
                        INNER JOIN
                            (SELECT Id, ApartmentId, TenantId, MAX(Date) Date FROM PaymentTable GROUP BY TenantId, ApartmentId) AS P
                        ON
                            A.Id = P.ApartmentId
                        WHERE
                            A.TenantId = ${tenantId}) AS AP
                    INNER JOIN
                        BuildingTable AS B
                    ON
                        AP.BuildingId = B.Id
                    WHERE
                        TenantId = ${tenantId}
                    `;
        con.query(query, function (err, result, fields) {
            if (err) throw err;
            res.render('tenantDashboard', {user: req.session.user, rentedaps: result});
        });
    }
    else
        res.redirect("/tenant/login");
}


let tenantPayRentPost = (req,res) => {
    if(req.session.loggedIn && req.session.userType == "Tenant") {
        let buildingId = req.body.buildingId;
        let apartmentId = req.body.apartmentId;
        let tenantId = req.body.tenantId;
        let rent = req.body.rent;
        let date = new Date().toISOString().split("T")[0];
        let query = `INSERT INTO PaymentTable (Date, BuildingId, ApartmentId, TenantId, PaidRent) VALUES ("${date}", "${buildingId}", "${apartmentId}", "${tenantId}", "${rent}");`
        con.query(query, function (err, result, fields) {
            if (err) throw err;
            res.redirect('/tenant/dashboard');
        });
    }
    else
        res.redirect("/tenant/login");
}

module.exports = {
    tenantDashboardGet,
    tenantLoginGet,
    tenantLoginPost,
    tenantPayRentPost,
    tenantRegisterGet,
    tenantRegisterPost
}