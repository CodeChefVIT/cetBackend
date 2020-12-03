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
  } = req.body;

  if (!testId || !domainName) {
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
  const studetntId = req.user.userId;
  const now = Date.now();
  let flag = 0;
  let questionsArr = [];

  await Test.findById(testId)
    .then(async (test) => {
      //Check if test is over
      if (test.scheduledEndDate >= now) {
        return res.status(420).json({
          message: "Test is over",
        });
      }

      //Check if test hasn't started
      if (test.scheduledForDate < now) {
        return res.status(418).json({
          message: "Test hasn't started yet",
        });
      }

      await Domain.findById(domainId)
        .then(async (domain) => {
          //Check if the student has already attempted this domain
          for (i in domain.usersStarted) {
            if (domain.usersStarted[i].studentId == studetntId) {
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
              message: "You have already given the test",
            });
          }

          await Domain.updateOne(
            { _id: domainId },
            { $push: { usersStarted: { studentId } } }
          );
        })
        .then(async () => {
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

module.exports = {
  addDomain,
  getAllDomainsOfATest,
  attemptDomain,
};
