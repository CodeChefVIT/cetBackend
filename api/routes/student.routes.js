const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const studentControllers = require("../controllers/student.controllers");

const recaptcha = require("../middleware/recaptcha");


const checkAuth = require("../middleware/checkAuth");
const checkAuthClub = require("../middleware/checkAuthClub");
const checkAuthStudent = require("../middleware/checkAuthStudent");

const router = express.Router();

//Student signup
router.post("/signup", studentControllers.signup);

//Resend email verication OTP
router.post("/email/resendOTP", studentControllers.resendOTP);

//Student email verification
router.post("/email/verify", studentControllers.verifyEmail);

//Student login
router.post("/login", studentControllers.login);

//Forgot password - Send OTP
router.post(
  "/forgotPassword/sendEmail",

  studentControllers.sendForgotPasswordEmail
);

//Forgot password - Verify OTP
router.post("/forgotPassword/verifyOTP", studentControllers.resetPassword);

//Update student's profile
router.patch("/profile", checkAuthStudent, studentControllers.updateProfile);

//Get a student's profile
router.get("/profile", checkAuthStudent, studentControllers.getProfile);

router.post("/apply", checkAuthStudent, studentControllers.applyClub);

router.get("/applied", checkAuthStudent, studentControllers.getAppliedClubs);

router.get("/profile", checkAuthStudent, studentControllers.getProfile);

//Get a student's details
router.get("/details", studentControllers.getStudentDetails);

//Get student's dashboard
router.get("/dashboard", checkAuthStudent, studentControllers.dashboard);

module.exports = router;
