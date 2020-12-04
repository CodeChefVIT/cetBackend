const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require("multer");

require("dotenv").config();

const Domain = require("../models/testDomain");
const Test = require("../models/test");
const Question = require("../models/question");
const Student = require("../models/student");
const student = require("../models/student");

const addDomain = async (req, res, next) => {
  const {
    testId,
    domainName,
    domainDescription,
    domainInstructions,
    domainDuration,
  } = req.body;

  if (!testId || !domainName || !domainDuration) {
    return res.status(400).json({
      message: "1 or more parameter(s) missing from req.body",
    });
  }

  const clubId = req.user.userId;

  const domain = new Domain({
    _id: new mongoose.Types.ObjectId(),
    testId,
    clubId,
    domainName,
    domainDescription,
    domainInstructions,
    domainDuration,
  });

  await domain
    .save()
    .then(async (result) => {
      res.status(201).json({
        message: "Domain successfully added",
        domainInfo: result,
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Something went wrong",
        error: err.toString(),
      });
    });
};

const getAllDomainsOfATest = async (req, res, next) => {
  const { testId } = req.query;

  if (!testId) {
    return res.status(400).json({
      message: "1 or more parameter(s) missing from req.query",
    });
  }

  await Domain.find({ testId })
    .select("-__v")
    .then(async (domains) => {
      res.status(200).json({
        domains,
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Something went wrong",
        error: err.toString(),
      });
    });
};

const attemptDomain = async (req, res, next) => {
  const { testId, domainId } = req.body;
  const studentId = req.user.userId;
  const now = Date.now();
  let flag = 0;
  let questionsArr = [];

  if (!testId || !domainId) {
    return res.status(400).json({
      message: "1 or more parameter(s) missing from req.body",
    });
  }

  await Test.findById(testId)
    .populate("clubId", "name email type")
    .then(async (test) => {
      //Check if test hasn't started
      if (test.scheduledForDate > now) {
        return res.status(418).json({
          message: "Test hasn't started yet",
        });
      }

      //Check if test is over
      if (test.scheduledEndDate <= now) {
        return res.status(420).json({
          message: "Test is over",
        });
      }

      await Domain.findById(domainId)
        .then(async (domain) => {
          //Check if the student has already attempted this domain
          for (i in domain.usersStarted) {
            if (domain.usersStarted[i].studentId == studentId) {
              flag = 1;
            }
          }

          for (i in test.usersFinished) {
            if (test.usersFinished[i].studentId == studentId) {
              flag = 1;
            }
          }
          if (flag === 1) {
            return res.status(409).json({
              message: "You have already attempted this domain",
            });
          }

          await Domain.updateOne(
            { _id: domainId },
            { $push: { usersStarted: { studentId } } }
          )
            .then(async () => {
              // await Student.updateOne(
              //   { _id: studentId, "tests.testId": testId },
              //   { $push: { "tests.$.domains": domainId }, $set: {} }
              // );
              await Question.find({ testId, domainId })
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
                    clubDetails: test.clubId,
                    testDetails: {
                      _id: test._id,
                      roundNumber: test.roundNumber,
                      roundType: test.roundType,
                      instructions: test.instructions,
                      scheduledForDate: test.scheduledForDate,
                      scheduledEndDate: test.scheduledEndDate,
                      graded: test.graded,
                    },
                    domainDetails: {
                      _id: domain._id,
                      domainName: domain.domainName,
                      domainDescription: domain.domainDescription,
                      domainInstructions: domain.domainInstructions,
                      domainDuration: domain.domainDuration,
                      domainMarks: domain.domainMarks,
                    },
                    questions: questionsArr,
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
};

const submitDomain = async (req, res, next) => {
  const { submissions, domainId, testId, clubId, timeTaken } = req.body;
  const studentId = req.user.userId;

  let studentAnswers = [];
  let answerObj = {};
  var score = 0;
  var now = Date.now();
  var corrected = false;
  var autoCorrectCount = 0;

  for (i = 0; i < submissions.length; i++) {
    answerObj = {};
    let response = submissions[i]; //currentQuestionDetails
    let question = await Question.findById(response.questionId);

    if (question.type == "singleCorrect") {
      let numOptions = question.options.length;
      let correctAnswer;
      let scoredQuestionMarks = 0;

      for (let j = 0; j < numOptions; j++) {
        if (question.options[j].option.isCorrect) {
          correctAnswer = question.options[j]._id.toString();
        }
      }

      if (response.answers[0] == correctAnswer) {
        score += question.questionMarks;
        scoredQuestionMarks = question.questionMarks;
      }

      answerObj.questionId = question._id;
      answerObj.questionType = question.type;
      answerObj.correctAnswer = correctAnswer;
      answerObj.questionMarks = question.questionMarks;
      answerObj.answers = response.answers[0];
      answerObj.scoredQuestionMarks = scoredQuestionMarks;
      answerObj.corrected = true;

      studentAnswers.push(answerObj);
    } else if (question.type == "multipleCorrect") {
      let numOptions = question.options.length;
      let correctAnswersArr = [];
      let scoredQuestionMarks = 0;

      for (let j = 0; j < numOptions; j++) {
        if (question.options[j].option.isCorrect) {
          correctAnswersArr.push(question.options[j]._id.toString());
        }
      }

      let correct = true;
      if (response.answers.length === correctAnswersArr.length) {
        for (let j = 0; j < response.answers.length; j++) {
          if (!correctAnswersArr.includes(response.answers[j])) {
            correct = false;
          }
        }
      } else {
        correct = false;
      }

      if (correct) {
        score += question.questionMarks;
        scoredQuestionMarks = question.questionMarks;
      }

      answerObj.questionId = question._id;
      answerObj.questionType = question.type;
      answerObj.correctAnswer = correctAnswersArr;
      answerObj.questionMarks = question.questionMarks;
      answerObj.answers = response.answers;
      answerObj.scoredQuestionMarks = scoredQuestionMarks;
      answerObj.corrected = true;

      studentAnswers.push(answerObj);
    } else {
      //now the question type is shortAnswer or longAnswer

      answerObj.questionId = question._id;
      answerObj.questionType = question.type;
      answerObj.questionMarks = question.questionMarks;
      answerObj.answers = response.answers[0];
      answerObj.scoredQuestionMarks = 0;
      answerObj.corrected = false;

      studentAnswers.push(answerObj);
    }
  }

  for (i = 0; i < submissions.length; i++) {
    let response = submissions[i]; //currentQuestionDetails
    let question = await Question.findById(response.questionId);

    if (
      question.type == "singleCorrect" ||
      question.type == "multipleCorrect"
    ) {
      autoCorrectCount += 1;
    }
  }

  if (autoCorrectCount == submissions.length) {
    corrected = true;
  }

  await Domain.updateOne(
    { _id: domainId },
    {
      $pull: { usersStarted: { studentId } },
      $push: {
        usersFinished: {
          studentId,
          responses: studentAnswers,
          marks: score,
          timeTaken,
          corrected,
          submittedOn: now,
        },
      },
    }
  )
    .then(async () => {
      // await Student.updateOne(
      //   { _id: studentId, "tests.testId": testId },
      //   { $set: { "tests.$.submittedOn": now } }
      // )
      //   .then(async () => {
      res.status(200).json({
        message: "Domain submitted",
      });
      // })
      // .catch((err) => {
      //   res.status(500).json({
      //     message: "Something went wrong",
      //     error: err.toString(),
      //   });
      // });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Something went wrong",
        error: err.toString(),
      });
    });
};

module.exports = {
  addDomain,
  getAllDomainsOfATest,
  attemptDomain,
  submitDomain,
};
