const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const checkAuth = require("../middleware/checkAuth");
const checkAuthClub = require("../middleware/checkAuthClub");
const checkAuthStudent = require("../middleware/checkAuthStudent");

const testControllers = require("../controllers/test.controllers");

const router = express.Router();

//Create a test
router.post("/create", checkAuthClub, testControllers.create);

//Apply for a test
router.post("/apply", checkAuthStudent, testControllers.apply);

//Attemt a test
router.post("/attempt", checkAuthStudent, testControllers.attempt);

//Get all applied tests
router.get("/allApplied", checkAuthStudent, testControllers.allApplied);

//Get all submitted tests
router.get("/allSubmitted", checkAuthStudent, testControllers.allSubmitted);

router.use("/question", require("./question.routes"));

module.exports = router;
