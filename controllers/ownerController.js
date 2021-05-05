const mysql = require("mysql");
const bcrypt = require("bcrypt");
const session = require("express-session");
const con = require("../db.js");

let ownerRegisterGet = (req, res) => {
  res.render("ownerRegister");
};

let ownerRegisterPost = async (req, res) => {
  let name = req.body.name;
  let contact = req.body.contact;
  let address = req.body.address;
  let password = req.body.password;
  let passwordHash = await bcrypt.hash(password, 10);
  let query = `INSERT INTO OwnerTable (OwnerName, OwnerContact, OwnerAddress, OwnerPassword) VALUES ("${name}", "${contact}", "${address}", "${passwordHash}");`;
  con.query(query, function (err, result) {
    if (err) throw err;
    console.log(result);
    res.redirect("/owner/login");
  });
};

let ownerLoginGet = (req, res) => {
  res.render("ownerLogin");
};

let ownerLoginPost = async (req, res) => {
  let contact = req.body.contact;
  let password = req.body.password;
  let query = `SELECT * FROM OwnerTable WHERE OwnerContact = ${contact};`;
  con.query(query, function (err, result, fields) {
    if (err) throw err;
    if (result.length == 0) {
      return res.redirect("/owner/login");
    }
    bcrypt.compare(password, result[0].OwnerPassword).then((resu) => {
      if (resu) {
        req.session.loggedIn = true;
        req.session.userType = "Owner";
        req.session.user = result[0];
        res.redirect("/owner/dashboard");
      } else {
        res.redirect("/owner/login");
      }
    });
  });
};

let ownerDashboard = (req, res) => {
  if (req.session.loggedIn && req.session.userType == "Owner") {
    let query = `SELECT * FROM BuildingTable WHERE OwnerId = ${req.session.user.Id};`;
    con.query(query, function (err, result, fields) {
      if (err) throw err;
      res.render("ownerDashboard", {
        user: req.session.user,
        buildings: result,
      });
    });
  } else res.redirect("/owner/login");
};

let ownerBuildingGet = (req, res) => {
  if (req.session.loggedIn && req.session.userType == "Owner") {
    let query = `SELECT * FROM TenantTable;`;
    con.query(query, function (err, result, fields) {
      if (err) throw err;
      res.render("ownerAddBuilding", {
        tenants: result,
        user: req.session.user,
      });
    });
  } else res.redirect("/owner/login");
};

let ownerBuildingPost = async (req, res) => {
  if (req.session.loggedIn && req.session.userType == "Owner") {
    let name = req.body.name;
    let floors = req.body.floors;
    let address = req.body.address;
    let ownerid = req.session.user.Id;
    let query = `INSERT INTO BuildingTable (BuildingName, Address, OwnerId, Floors) VALUES ("${name}", "${address}", "${ownerid}", "${floors}");`;
    con.query(query, function (err, result) {
      if (err) throw err;
      console.log(result);
      let tot = req.body.apartments;
      let values = [];
      for (let i = 1; i <= tot; i++) {
        let buildingid = result.insertId;
        let flatnumber = req.body[`flatnumber${i}`];
        let tenantid = req.body[`tenantid${i}`];
        let rent = req.body[`rent${i}`];
        let startdate = req.body[`startdate${i}`];
        values.push([buildingid, flatnumber, tenantid, rent, startdate]);
      }
      let queryAp = `INSERT INTO ApartmentTable (BuildingId, FlatNumber, TenantId, Rent, StartDate) VALUES ?`;
      con.query(queryAp, [values], function (err, resu) {
        if (err) throw err;
        console.log(resu);
        res.redirect("/owner/dashboard");
      });
    });
  } else res.redirect("/owner/login");
};

let ownerBuildingPut = async (req, res) => {
    if(req.session.loggedIn && req.session.userType == "Owner") {
        let buildingId = req.body.buildingId;
        let buildingName = req.body.name;
        let address = req.body.address;
        let floors = req.body.floors;
        let query = `UPDATE 
                        BuildingTable
                    SET 
                        BuildingName = "${buildingName}", Address = "${address}", Floors = "${floors}"
                    WHERE
                        Id = ${buildingId};
                    `
        con.query(query, function (err, result) {
            if (err) throw err;
            console.log(result);
            res.send(result);
        });
    }
    else{
        res.redirect("/owner/login");
    }
}

module.exports = {
    ownerBuildingGet,
    ownerBuildingPost,
    ownerBuildingPut,
    ownerDashboard,
    ownerLoginGet,
    ownerLoginPost,
    ownerRegisterGet,
    ownerRegisterPost
}
