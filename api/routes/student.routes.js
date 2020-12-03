const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const studentControllers = require("../controllers/student.controllers");

const checkAuth = require("../middleware/checkAuth");
const checkAuthClub = require("../middleware/checkAuthClub");
const checkAuthStudent = require("../middleware/checkAuthStudent");

const router = express.Router();

//Student signup
router.post("/signup", studentControllers.signup);

//Student email verification
router.post("/email/verify", studentControllers.verifyEmail);

//Student login
router.post("/login", studentControllers.login);

//Update student's profile
router.patch("/profile", checkAuthStudent, studentControllers.updateProfile);

//Get a student's profile
router.get("/profile", checkAuthStudent, studentControllers.getProfile);

module.exports = router;
