const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require("multer");

require("dotenv").config();

const Club = require("../models/club.model");
const Student = require("../models/student.model");
const Test = require("../models/test.model");
const Question = require("../models/question.model");
const Domain = require("../models/testDomain.model");
const { response } = require("express");

// @desc Add a question to a test
// @route GET /api/question/add
const addQuestion = async (req, res, next) => {
  const {
    testId,
    domainId,
    type,
    questionMarks,
    description,
    options,
  } = req.body;

  const clubId = req.user.userId;

  if (!req.file) {
    const question = new Question({
      _id: new mongoose.Types.ObjectId(),
      testId,
      clubId,
      domainId,
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
  } else {
    const url = req.file.location;
    const arr = url.split(".");
    const ext = arr[arr.length - 1];

    // if(ext == "png"|| ext=="jpg" || "")

    const question = new Question({
      _id: new mongoose.Types.ObjectId(),
      testId,
      clubId,
      domainId,
      type,
      questionMarks,
      description,
      options,
      media: {
        url,
        ext,
      },
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
  }
};

// @desc Add multiple questions to a test
// @route GET /api/question/addMultiple
const addMultipleQuestions = async (req, res, next) => {
  const { testId, domainId, questions } = req.body;

  if (!testId || !domainId) {
    return res.status(400).json({
      message: "1 or more parameter(s) missing from req.query",
    });
  }

  //find domain => make domainMarks+=marks

  await Question.insertMany(questions)
    .then(async (result) => {
      await Question.find({ testId, domainId })
        .then(async (ques) => {
          let marks = 0;
          for (question of ques) {
            marks += question.questionMarks;
          }
          await Domain.updateOne({ _id: domainId }, { domainMarks: marks })
            .then(async () => {
              res.status(200).json({
                message: "Questions added",
                result,
              });
            })
            .catch((err) => {
              res.status(500).json({
                message: "Some error occurred",
                error: err.toString(),
              });
            });
        })
        .catch((err) => {
          res.status(500).json({
            message: "Some error occurred",
            error: err.toString(),
          });
        });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Some error occurred",
        error: err.toString(),
      });
    });
};

// @desc Get all questions of a domain of a test -- accessible only to club
// @route GET /api/question/all
const getAllQuestions = async (req, res, next) => {
  const { testId, domainId } = req.query;

  if (!testId) {
    return res.status(400).json({
      message: "1 or more parameter(s) missing from req.query",
    });
  }
  await Domain.findById(domainId)
    .populate(
      "clubId testId",
      "name email type roundNumber roundType instructions scheduledForDate scheduledEndDate graded"
    )
    .then(async (domain) => {
      await Question.find({ testId, domainId })
        .then(async (questions) => {
          res.status(200).json({
            clubDetails: domain.clubId,
            testDetails: domain.testId,
            domainDetails: {
              _id: domain._id,
              domainName: domain.domainName,
              domainDescription: domain.domainDescription,
              domainInstructions: domain.domainInstructions,
              domainDuration: domain.domainDuration,
              domainMarks: domain.domainMarks,
            },
            questions,
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
};

// @desc Add marks for a question for a student
// @route POST /api/test/domain/question/marks
const addMarks = async (req, res, next) => {
  const { studentId, questionId, marks, domainId } = req.body;

  // await Domain.updateOne(
  //   {
  //     _id: domainId,
  //     // "usersFinished.studentId": studentId,
  //   },
  //   {
  //     $set: { "usersFinished.$[i].responses.$[j].scoredQuestionMarks": marks },
  //   },
  //   {
  //     arrayFilters: [
  //       { "i.studentId": studentId },
  //       { "j.questionId": questionId },
  //     ],
  //   }
  // )
  //   .then(async (check) => {
  //     res.status(200).json({
  //       check,
  //       message: "Marks added",
  //     });
  //   })
  //   .catch((err) => {
  //     res.status(500).json({
  //       message: "Something went wrong",
  //       error: err.toString(),
  //     });
  //   });
};

const updateMarks = async (req, res, next) => {
  const { studentId, questionId, marks, domainId } = req.body;

  let flag = 0;

  let domain = await Domain.findOne({ _id: domainId });

  if (!domain) {
    return res.status(418).json({
      message: "Invalid parameters",
    });
  }

  for (student of domain.usersFinished) {
    if (student.studentId.equals(studentId)) {
      for (sub of student.responses) {
        if (sub.questionId.equals(questionId)) {
          sub.scoredQuestionMarks = marks;
          sub.corrected = true;
          await domain
            .save()
            .then(async (result) => {
              await Domain.updateOne({ _id: domainId }, result)
                .then(() => {
                  flag = 1;
                })
                .catch((err) => {
                  return res.status(500).json({
                    message: "Something went wrong",
                    error: err.toString(),
                  });
                });
            })
            .catch((err) => {
              return res.status(500).json({
                message: "Something went wrong",
                error: err.toString(),
              });
            });

          break;
        }
      }
      if (flag == 1) break;
    }
  }

  if (flag == 1) {
    return res.status(200).json({
      message: "Updated",
    });
  } else {
    return res.status(418).json({
      message: "Invalid parameters",
    });
  }
};

module.exports = {
  addQuestion,
  addMultipleQuestions,
  getAllQuestions,
  addMarks,
  updateMarks,
};
