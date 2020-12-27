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

router.patch("/removeFinished", devControllers.removeUsersFinished);

router.get("/findByEmail", devControllers.findUserByEmail);

router.get("/getTotalUsersStarted", devControllers.getTotalUsersStarted);

router.get(
  "/getAllShortlistedStudentsOfClub",
  devControllers.getAllShortlistedStudentsOfClub
);

router.post("/sendShortlistEmail", devControllers.sendShortlistEmail);

const Club = require("../models/club.model");
// router.patch("/changepass", async (req, res) => {
//   await bcrypt.hash(password, 10).then(async (hash) => {
//     await Club.findOneAndUpdate(
//       { _id: clubId },
//       {
//         $set: { password: hash },
//       }
//     )
//       .then(() => {
//         res.status(200).json({ message: "Done" });
//         console.log("done");
//       })
//       .catch((err) => {
//         res.status(500).json({ message: err.toString() });
//         console.log(err.toString());
//       });
//   });
// });

router.get(
  "/getShortlistedStudentsOfADomain",
  devControllers.getShortlistedStudentsOfADomain
);

module.exports = router;
