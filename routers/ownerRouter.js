const express = require("express");
const ownerRouter = express.Router();
const {
    ownerBuildingGet,
    ownerBuildingPost,
    ownerBuildingPut,
    ownerApartmentsGet,
    ownerApartmentPut,
    ownerDashboard,
    ownerLoginGet,
    ownerLoginPost,
    ownerRegisterGet,
    ownerRegisterPost
} = require("../controllers/ownerController");

ownerRouter.get("/register", ownerRegisterGet);
ownerRouter.post("/register", ownerRegisterPost);
ownerRouter.get("/login", ownerLoginGet);
ownerRouter.post("/login", ownerLoginPost);
ownerRouter.get("/dashboard", ownerDashboard);
ownerRouter.get("/addBuilding", ownerBuildingGet);
ownerRouter.post("/addBuilding", ownerBuildingPost);
// ownerRouter.route("/updateBuilding/:id")
ownerRouter.put("/updateBuilding/:id", ownerBuildingPut);
ownerRouter.route("/buildings/:buildingid")
    .get(ownerApartmentsGet)
    .post(ownerApartmentPut);

module.exports = ownerRouter;
