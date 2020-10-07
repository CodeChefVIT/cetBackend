const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const Club = require("../models/club");
const Student = require("../models/student");
const Test = require("../models/test");
const Question = require("../models/question");

const checkAuth = require("../middleware/checkAuth");
const checkAuthClub = require("../middleware/checkAuthClub");
const checkAuthStudent = require("../middleware/checkAuthStudent");

const router = express.Router();

//Add a question to a test
router.post("/add", checkAuthClub, async (req, res, next) => {
  const {
    testId,
    clubId,
    domain,
    type,
    questionMarks,
    description,
    options,
  } = req.body;

  const question = new Question({
    _id: new mongoose.Types.ObjectId(),
    testId,
    clubId,
    domain,
    type,
    questionMarks,
    description,
    options,
  });

  await question
    .save()
    .then(async () => {
      res.status(201).json({
        message: "Question added",
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Something went wrong",
        error: err.toString(),
      });
    });
});

//Get all questions of a test -- to be viewed only by club
router.get("/all", checkAuthClub, async (req, res, next) => {
  const { testId } = req.body;

  await Question.find({ testId })
    .then(async (questions) => {
      res.status(200).json({
        questions,
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Something went wrong",
        error: err.toString(),
      });
    });
});

module.exports = router;
