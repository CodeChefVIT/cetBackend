const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const clubControllers = require("../controllers/club.controllers");

const recaptcha = require("../middleware/recaptcha");

const checkAuthClub = require("../middleware/checkAuthClub");

const {
  uploadClubAvatar,
  uploadClubBanner,
} = require("../middleware/s3UploadClient");

const router = express.Router();

//Create Club
router.post("/create", clubControllers.create);

//Send welcome email
router.post("/sendWelcomeEmail", clubControllers.sendWelcomeEmail);

//Club signup
// router.post("/signup", clubControllers.signup);

//Club email verification
router.post("/email/verify", clubControllers.verifyEmail);

//Resend email verication OTP
router.post("/email/resendOTP", clubControllers.resendOTP);

//Club login
router.post("/login", clubControllers.login);

//Update club's profile
router.patch("/profile", checkAuthClub, clubControllers.updateProfile);

//Get club's profile -- Only for club admin
router.get("/profile", checkAuthClub, clubControllers.getSelfProfile);

//Get club's details
router.get("/details", clubControllers.getClubDetails);

//Get Club's details username
router.get("/details/username", clubControllers.getClubDetailsUsername);

//Feature or unfeature a club for recruitments
router.patch("/feature", checkAuthClub, clubControllers.feature);

//Get all featured clubs
router.get("/allFeatured", clubControllers.getAllFeaturedClubs);

//Upload club avatar
router.put(
  "/avatar",
  checkAuthClub,

  uploadClubAvatar.single("avatar"),
  clubControllers.uploadProfilePicture
);

//Upload club banner
router.put(
  "/banner",
  checkAuthClub,

  uploadClubBanner.single("banner"),
  clubControllers.uploadBanner
);
const Club = require("../models/club.model");

// router.patch("/changes", async (req, res) => {
//   await Club.updateOne(
//     { _id: "5fde0fca6ddabc5e08a3f567" },
//     { $set: { numOfTestsPublished: 1 } }
//   ).then(res.send("done"));
// });

module.exports = router;
