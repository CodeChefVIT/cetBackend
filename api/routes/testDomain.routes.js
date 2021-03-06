const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");


const recaptcha = require("../middleware/recaptcha");

const checkAuth = require("../middleware/checkAuth");
const checkAuthClub = require("../middleware/checkAuthClub");
const checkAuthStudent = require("../middleware/checkAuthStudent");

const testDomainControllers = require("../controllers/testDomain.controllers");

const router = express.Router();

//Add a test domain
router.post("/add", checkAuthClub, testDomainControllers.addDomain);

//Get all domains of a test
router.get("/all", checkAuth, testDomainControllers.getAllDomainsOfATest);

//Get details of a domain
router.get("/details", testDomainControllers.getDetailsOfDomain);

//Attempt a domain
router.post("/attempt", checkAuthStudent, testDomainControllers.attemptDomain);

//Submit a domain
router.post("/submit", checkAuthStudent, testDomainControllers.submitDomain);

//Get all submissions of a domain
router.get(
  "/allSubmissions",
  checkAuthClub,
  testDomainControllers.getAllSubmissionsOfADomain
);

//Get a student's submission of a domain
router.get(
  "/studentSubmission",
  checkAuthClub,
  testDomainControllers.getStudentDomainSubmission
);

//Shortlist a student
router.patch(
  "/shortlist",
  checkAuthClub,
  testDomainControllers.shortlistStudent
);

//Remove a shortlisted student
router.patch(
  "/removeShortlistedStudent",
  checkAuthClub,
  testDomainControllers.removeShortlistedStudent
);

//Publish Shortlisted result
router.patch(
  "/publishShortlist",
  checkAuthClub,
  testDomainControllers.publishShortlisted
);

//Update domain details
router.patch(
  "/details",
  checkAuthClub,
  testDomainControllers.updateDomainDetails
);

//Delete a domain
router.delete("/delete", checkAuthClub, testDomainControllers.deleteDomain);

router.use("/question", require("./question.routes"));

module.exports = router;
