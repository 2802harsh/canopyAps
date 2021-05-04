const express = require("express");
const tenantRouter = express.Router();
const {
    tenantDashboardGet,
    tenantLoginGet,
    tenantLoginPost,
    tenantPayRentPost,
    tenantRegisterGet,
    tenantRegisterPost
} = require("../controllers/tenantController");

tenantRouter.get("/register", tenantRegisterGet);
tenantRouter.post("/register", tenantRegisterPost);
tenantRouter.get("/login", tenantLoginGet);
tenantRouter.post("/login", tenantLoginPost);
tenantRouter.get("/dashboard", tenantDashboardGet);
tenantRouter.post("/payRent", tenantPayRentPost);

module.exports = tenantRouter;