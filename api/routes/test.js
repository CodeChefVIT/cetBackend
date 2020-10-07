const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const Club = require("../models/club");
const Student = require("../models/student");
const Test = require("../models/test");

const checkAuth = require("../middleware/checkAuth");
const checkAuthClub = require("../middleware/checkAuthClub");
const checkAuthStudent = require("../middleware/checkAuthStudent");

const router = express.Router();

//Create a test
router.post("/add", checkAuthClub, async (req, res, next) => {
  const {
    clubId,
    instructions,
    duration,
    maxMarks,
    scheduledForDate,
    scheduledEndDate,
  } = req.body;

  const test = new Test({
    _id: new mongoose.Types.ObjectId(),
    clubId,
    instructions,
    duration,
    maxMarks,
    scheduledForDate,
    scheduledEndDate,
  });

  await test
    .save()
    .then(async (result) => {
      res.status(201).json({
        message: "Test created",
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Something went wrong",
        error: err.toString(),
      });
    });
});

//Apply for a test
router.post("/apply", checkAuthStudent, async (req, res, next) => {
  const { testId, clubId } = req.body;
  const studentId = req.user.userId;
  const appliedOn = Date.now();

  await Test.updateOne({ _id: testId }, { $push: { users: { studentId } } })
    .then(async () => {
      await Student.updateOne(
        { _id: studentId },
        { $push: { test: { testId, clubId, appliedOn } } }
      )
        .then(async () => {
          res.status(200).json({
            message: "Applied",
          });
        })
        .catch((err) => {
          res.status(500).json({
            message: "Something went wrong",
            error: err.toString(),
          });
        });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Something went wrong",
        error: err.toString(),
      });
    });
});

router.use("/question", require("./question"));

module.exports = router;
