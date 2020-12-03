const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const checkAuth = require("../middleware/checkAuth");
const checkAuthClub = require("../middleware/checkAuthClub");
const checkAuthStudent = require("../middleware/checkAuthStudent");

const testDomainControllers = require("../controllers/testDomain.controllers");

const router = express.Router();

//Add a test domain
router.post("/add", checkAuthClub, testDomainControllers.addDomain);

//Get all domains of a test
router.get("/all", checkAuth, testDomainControllers.getAllDomainsOfATest);

router.use("/question", require("./question.routes"));

module.exports = router;
