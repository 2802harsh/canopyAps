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
  if (!(name && contact && address && password))
    return res.redirect("/owner/register");
  let passwordHash = await bcrypt.hash(password, 10);
  let query = `INSERT INTO OwnerTable (OwnerName, OwnerContact, OwnerAddress, OwnerPassword) VALUES ("${name}", "${contact}", "${address}", "${passwordHash}");`;
  con.query(query, function (err, result) {
    if (err) {
      console.log(err);
      return res.redirect("/owner/register");
    }
    res.redirect("/owner/login");
  });
};

let ownerLoginGet = (req, res) => {
  res.render("ownerLogin");
};

let ownerLoginPost = async (req, res) => {
  let contact = req.body.contact;
  let password = req.body.password;
  if (!(contact && password)) return res.redirect("/owner/login");
  let query = `SELECT * FROM OwnerTable WHERE OwnerContact = ${contact};`;
  con.query(query, function (err, result, fields) {
    if (err) {
      console.log(err);
      return res.redirect("/owner/login");
    }
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
    let query1 = `SELECT * FROM BuildingTable WHERE OwnerId = ${req.session.user.Id};`;
    con.query(query1, function (err, result, fields) {
      if (err) {
        throw err;
      }
      let query2 = `SELECT
                        B.*, A.*
                    FROM
                        BuildingTable AS B
                    INNER JOIN
                        (SELECT 
                            AP.*, P.Id AS PaymentId, P.Date AS PaymentDate, T.TenantName 
                        FROM 
                            ApartmentTable AS AP 
                        INNER JOIN PaymentTable AS P ON AP.Id = P.ApartmentId
                        INNER JOIN TenantTable AS T ON AP.TenantId = T.Id) AS A
                    ON B.Id = A.BuildingId
                    WHERE B.OwnerId = ${req.session.user.Id}
                    ORDER BY PaymentDate DESC
                    LIMIT 5`;
      con.query(query2, function (err, resu) {
        console.log(result);
        res.render("ownerDashboard", {
          user: req.session.user,
          buildings: result,
          recentPayments: resu,
        });
      });
    });
  } else res.redirect("/owner/login");
};

let ownerBuildingGet = (req, res) => {
  if (req.session.loggedIn && req.session.userType == "Owner") {
    let query = `SELECT * FROM TenantTable;`;
    con.query(query, function (err, result, fields) {
      if (err) {
        throw err;
      }
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
      if (err) {
        console.log(err);
        return res.redirect("/owner/addBuilding");
      }
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
        if (err) {
          console.log(err);
          return res.redirect("/owner/addBuilding");
        }
        console.log(resu);
        res.redirect("/owner/dashboard");
      });
    });
  } else res.redirect("/owner/login");
};

let ownerBuildingPut = async (req, res) => {
  if (req.session.loggedIn && req.session.userType == "Owner") {
    let buildingId = req.params.id;
    let buildingName = req.body.name;
    let address = req.body.address;
    let floors = req.body.floors;
    let query = `UPDATE 
                        BuildingTable
                    SET 
                        BuildingName = "${buildingName}", Address = "${address}", Floors = "${floors}"
                    WHERE
                        Id = ${buildingId};
                    `;
    con.query(query, function (err, result) {
      if (err) {
        console.log(err);
        return res.redirect("/owner/dashboard");
      }
      res.redirect("/owner/dashboard");
    });
  } else {
    res.redirect("/owner/login");
  }
};

let ownerApartmentsGet = async (req, res) => {
  if (req.session.loggedIn && req.session.userType == "Owner") {
    let buildingId = req.params.buildingid;
    let query = `SELECT
                        A.Id AS ApartmentId, A.FlatNumber, A.Rent, A.StartDate, A.TenantId, A.LastPaymentDate, T.TenantName
                    FROM
                        (SELECT
                            AP.*, P.Date AS LastPaymentDate
                        FROM
                            ApartmentTable AS AP
                        LEFT JOIN
                            (SELECT Id, ApartmentId, TenantId, MAX(Date) Date FROM PaymentTable GROUP BY TenantId, ApartmentId) AS P
                        ON
                            AP.Id = P.ApartmentId ) AS A
                    INNER JOIN
                        TenantTable as T
                    ON
                        A.TenantId = T.Id
                    WHERE
                        A.BuildingId = ${buildingId}
                    `;
    con.query(query, function (err, result) {
      if (err) {
        throw err;
      }
      let query2 = `SELECT 
                            * 
                          FROM TenantTable`;
      con.query(query2, function (error, result2) {
        let query3 = `SELECT 
                                * 
                            FROM 
                                BuildingTable
                            WHERE
                                Id = ${buildingId}`;
        con.query(query3, function (error, result3) {
          // res.send({result,result2,result3});
          res.render("ownerApartments", {
            user: req.session.user,
            apartments: result,
            tenants: result2,
            building: result3,
          });
        });
      });
    });
  } else {
    res.redirect("/owner/login");
  }
};

let ownerApartmentPut = async (req, res) => {
  if (req.session.loggedIn && req.session.userType == "Owner") {
    let buildingId = req.params.buildingid;
    let apartmentId = req.body.apartmentId || null;
    let tenantId = req.body.tenantId;
    let flatNumber = req.body.flatNumber;
    let rent = req.body.rent;
    let startDate = req.body.startDate;
    let query;
    if (apartmentId === null) {
      query = `
                    INSERT INTO
                        ApartmentTable (BuildingId, FlatNumber, TenantId, Rent, StartDate)
                    VALUES
                        ( "${buildingId}", "${flatNumber}", "${tenantId}", "${rent}", "${startDate}")
                    `;
    } else {
      query = `UPDATE
                        ApartmentTable
                    SET 
                        FlatNumber = "${flatNumber}", TenantId = "${tenantId}", Rent = "${rent}", StartDate = "${startDate}"
                    WHERE
                        Id = ${apartmentId}`;
    }
    console.log(query);
    con.query(query, function (err, result) {
      if (err) {
        console.log(err);
        return res.redirect("/owner/dashboard");
      }
      res.redirect(`/owner/buildings/${buildingId}`);
    });
  } else {
    res.redirect("/owner/login");
  }
};

module.exports = {
  ownerBuildingGet,
  ownerBuildingPost,
  ownerBuildingPut,
  ownerApartmentsGet,
  ownerApartmentPut,
  ownerDashboard,
  ownerLoginGet,
  ownerLoginPost,
  ownerRegisterGet,
  ownerRegisterPost,
};
