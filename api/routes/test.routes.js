const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const recaptcha = require("../middleware/recaptcha");

const checkAuth = require("../middleware/checkAuth");
const checkAuthClub = require("../middleware/checkAuthClub");
const checkAuthStudent = require("../middleware/checkAuthStudent");

const testControllers = require("../controllers/test.controllers");
const { submit } = require("../controllers/test.controllers");

const router = express.Router();

//Create a test
router.post("/create", recaptcha,checkAuthClub, testControllers.create);

//Get details of a test by testId
router.get("/details", checkAuth, testControllers.getTestDetails);

//Apply for a test
router.post("/apply", checkAuthStudent,recaptcha, testControllers.apply);

//Attemt a test
router.post("/attempt", checkAuthStudent,recaptcha, testControllers.attempt);

//Submit test
router.post("/submit", checkAuthStudent, recaptcha, testControllers.submit);

//Get all applied tests
router.get("/allApplied", checkAuthStudent, testControllers.allApplied);

//Get all submitted tests
router.get("/allSubmitted", checkAuthStudent, testControllers.allSubmitted);

//Add users to a test
router.post("/addStudents", checkAuthClub, recaptcha, testControllers.addStudents);

//Publish a test
router.patch("/publish", checkAuthClub, recaptcha, testControllers.publish);

//Get all tests of a club -- admin only
router.get(
  "/allTestsOfAClub",
  checkAuthClub,
  testControllers.getAllTestOfAClub
);

//Get all published tests of a club
router.get(
  "/allPublishedTestsOfAClub",
  testControllers.getAllPublishedTestsOfAClub
);

//Update test details
router.patch("/details", checkAuthClub, recaptcha, testControllers.updateTest);

//Delete a test
router.delete("/delete", checkAuthClub, testControllers.deleteTest);

router.use("/domain", require("./testDomain.routes"));

module.exports = router;
