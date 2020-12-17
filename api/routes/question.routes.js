const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const questionControllers = require("../controllers/question.controllers");

const checkAuth = require("../middleware/checkAuth");
const checkAuthClub = require("../middleware/checkAuthClub");
const checkAuthStudent = require("../middleware/checkAuthStudent");

const router = express.Router();

//Add a question to a test
router.post("/add", checkAuthClub, questionControllers.addQuestion);

//Add multiple questions to a test
router.post(
  "/addMultiple",
  checkAuthClub,
  questionControllers.addMultipleQuestions
);

//Get all questions of a test -- to be viewed only by club
router.get("/all", checkAuthClub, questionControllers.getAllQuestions);

//Add marks
router.post("/marks", checkAuthClub, questionControllers.updateMarks);

module.exports = router;
