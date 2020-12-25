const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const devControllers = require("../controllers/dev.controllers");
const recaptcha = require("../middleware/recaptcha");

const checkAuth = require("../middleware/checkAuth");
const checkAuthClub = require("../middleware/checkAuthClub");
const checkAuthStudent = require("../middleware/checkAuthStudent");

const { uploadQuestionMedia } = require("../middleware/s3UploadClient");

const router = express.Router();

router.get("/allClubs", devControllers.getAllClubs);

router.get("/allFeaturedClubs", devControllers.getAllFeaturedClubs);

router.get("/allTestsOfAClub", devControllers.getAllTestsOfAClub);

router.get(
  "/allPublishedTestsOfAClub",
  devControllers.getAllPublishedTestsOfAClub
);

router.get("/allDomainsOfATest", devControllers.getAllDomainsOfATest);

router.get("/domainByID", devControllers.getDomainByID);

router.patch(
  "/clearEntriesFromDomainByStudentID",
  devControllers.clearEntriesFromDomainByStudentID
);

router.get("/studentTestDashboard", devControllers.studentTestDashboard);

router.get(
  "/multipleStudentDetails",
  devControllers.getDetailsOfMultipleStudents
);

// router.post("/sendWelcomeEmail", devControllers.sendWelcomeEmail);

router.post("/whitelistEmails", devControllers.whitelistEmails);

router.get(
  "/allSubmissionsOfADomain",
  devControllers.getAllSubmissionsOfDomain
);

router.get(
  "/getNumSubmissionOfAllDomains",
  devControllers.getNumSubmissionOfAllDomains
);

router.get(
  "/getNumSubmissionOfAllDomainsofMultipleTests",
  devControllers.getNumSubmissionOfAllDomainsofMultipleTests
);

module.exports = router;
