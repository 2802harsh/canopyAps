const express = require("express");
const app = express();
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const session = require("express-session");
const con = require("./db.js");
const ownerRouter = require("./routers/ownerRouter");
const tenantRouter = require("./routers/tenantRouter");

app.set("view engine", "ejs");
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(
  session({
    secret: "mySecretKey",
    resave: false,
    saveUninitialized: true,
  })
);

app.use("/static", express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/logout", async (req, res) => {
  req.session.loggedIn = false;
  res.redirect("/");
});

app.use("/owner", ownerRouter);
app.use("/tenant", tenantRouter);

app.listen(3000, () => {
  console.log(`Apartment Management App listening at http://localhost:3000`);
});
