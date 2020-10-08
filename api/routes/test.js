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

//Attemt a test
router.post("/attempt", checkAuthStudent, async (req, res, next) => {
  const { testId } = req.body;
  const studetntId = req.user.userId;
  const now = Date.now();
  let flag = 0;
  let questionsArr = [];

  await Test.findById(testId)
    .then(async (test) => {
      //Check if user has already given the test
      for (i in test.usersStarted) {
        if (test.usersStarted[i].studentId == studetntId) {
          flag = 1;
        }
      }
      for (i in test.usersFinished) {
        if (test.usersFinished[i].studentId == studetntId) {
          flag = 1;
        }
      }
      if (flag === 1) {
        return res.status(409).json({
          message: "You have already given the quiz",
        });
      }

      //Check if quiz is over
      if (test.scheduledEndDate >= now) {
        return res.status(420).json({
          message: "Quiz is over",
        });
      }

      //Check if quiz hasn't started
      if (test.scheduledForDate < now) {
        return res.status(418).json({
          message: "Quiz hasn't started",
        });
      }

      await Test.updateOne(
        { _id: testId },
        {
          $pull: { users: { studentId } },
          $push: { usersStarted: { studentId } },
        }
      )
        .then(async () => {
          await Student.updateOne(
            { _id: studentId },
            { $set: { startedOn: now } }
          )
            .then(async () => {
              await Question.find({ testId })
                .then(async (questions) => {
                  for (let question of questions) {
                    let obj = {};
                    obj.questionId = question._id;
                    obj.questionType = question.type;
                    obj.questionMarks = question.questionMarks;
                    obj.description = question.description;
                    if (question.options.length >= 1) {
                      obj.options = [];

                      for (let option of question.options) {
                        let optionObj = {};
                        optionObj.optionId = option._id;
                        optionObj.text = option.option.text;
                        obj.options.push(optionObj);
                      }
                    }

                    questionsArr.push(obj);
                  }
                  res.status(200).json({
                    questionsArr,
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

//Get all applied tests
router.get("/allApplied", checkAuthStudent, async (req, res, next) => {
  const studentId = req.user.userId;

  await Student.findById(studentId)
    .then(async (student) => {
      for (i in student.tests) {
        if (!student.tests[i].startedOn) {
          testsArr.push(student.tests[i]);
        }
      }

      res.status(200).json({
        tests: testsArr,
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Something went wrong",
        error: err.toString(),
      });
    });
});

//Get all submitted tests
router.get("/allSubmitted", checkAuthStudent, async (req, res, next) => {
  const studentId = req.user.userId;

  await Student.findById(studentId)
    .then(async (student) => {
      for (i in student.tests) {
        if (student.tests[i].startedOn && !student.tests[i].submittedOn) {
          testsArr.push(student.tests[i]);
        }
      }

      res.status(200).json({
        tests: testsArr,
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
