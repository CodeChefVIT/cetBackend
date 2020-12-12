const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const clubControllers = require("../controllers/club.controllers");

const checkAuthClub = require("../middleware/checkAuthClub");

const router = express.Router();

//Create Club
router.post('/create', clubControllers.create)

//Club signup
router.post("/signup", clubControllers.signup);

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

//Feature or unfeature a club for recruitments
router.patch("/feature", checkAuthClub, clubControllers.feature);

//Get all featured clubs
router.get("/allFeatured", clubControllers.getAllFeaturedClubs);

module.exports = router;
