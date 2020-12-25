const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require("multer");

require("dotenv").config();

const Domain = require("../models/testDomain.model");
const Test = require("../models/test.model");
const Question = require("../models/question.model");
const Student = require("../models/student.model");

const { errorLogger } = require("../utils/logger");

// @desc Add a domain to a test
// @route POST /api/test/domain/add
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

  let flag = 0;

  await Test.findById(testId)
    .then(async (test) => {
      if (test.clubId != req.user.userId) {
        flag = 1;
      }
    })
    .catch((err) => {
      errorLogger.info(
        `System: ${req.ip} | ${req.method} | ${
          req.originalUrl
        } >> ${err.toString()}`
      );
      res.status(500).json({
        message: "Something went wrong",
        // error: err.toString(),
      });
    });

  if (flag == 1) {
    return res.status(403).json({
      message: "This is not your club!",
    });
  }
  let clubId = req.user.userId;
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
      errorLogger.info(
        `System: ${req.ip} | ${req.method} | ${
          req.originalUrl
        } >> ${err.toString()}`
      );
      res.status(500).json({
        message: "Something went wrong",
        // error: err.toString(),
      });
    });
};

// @desc Get all domains of a test
// @route GET /api/test/domain/all
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
      errorLogger.info(
        `System: ${req.ip} | ${req.method} | ${
          req.originalUrl
        } >> ${err.toString()}`
      );
      res.status(500).json({
        message: "Something went wrong",
        // error: err.toString(),
      });
    });
};

// @desc Get details of a domain
// @route GET /api/test/domain/details
const getDetailsOfDomain = async (req, res, next) => {
  const { domainId } = req.query;

  if (!domainId) {
    return res.status(400).json({
      message: "1 or more parameter(s) missing from req.query",
    });
  }

  await Domain.findById(domainId)
    .populate(
      "clubId testId",
      "-usersFinished -usersStarted -users -emailVerificationCode -emailVerificationCodeExpires -password "
    )
    .select(
      "-usersStarted -usersFinished -shortlisedInDomain -selectedInDomain"
    )
    .then(async (domain) => {
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
      });
    })
    .catch((err) => {
      errorLogger.info(
        `System: ${req.ip} | ${req.method} | ${
          req.originalUrl
        } >> ${err.toString()}`
      );
      res.status(500).json({
        message: "Something went wrong",
        // error: err.toString(),
      });
    });
};

// @desc Finalize a domain
// @route PATCH /api/test/domain/finalize
const finalizeDomain = async (req, res, next) => {
  const { domainId } = req.body;

  if (!domainId) {
    return res.status(400).json({
      message: "1 or more parameter(s) missing from req.query",
    });
  }
  const domain = await Domain.findById(domainId);
  if (domain.clubId != req.user.userId) {
    return res.status(402).json({
      message: "This is not your club!",
    });
  }
  await Domain.updateOne({ _id: domainId }, { published: true })
    .then(async () => {
      res.status(200).json({
        message: "Domain published successfully",
      });
    })
    .catch((err) => {
      errorLogger.info(
        `System: ${req.ip} | ${req.method} | ${
          req.originalUrl
        } >> ${err.toString()}`
      );
      res.status(500).json({
        message: "Something went wrong",
        // error: err.toString(),
      });
    });
};

// @desc Attempt a domain
// @route POST /api/test/domain/attempt
const attemptDomain = async (req, res, next) => {
  const { testId, domainId } = req.body;
  const studentId = req.user.userId;
  const now = Date.now();
  let startCount = 0;
  let submitCount = 0;
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
              startCount += 1;
            }
          }

          for (i in domain.usersFinished) {
            if (domain.usersFinished[i].studentId == studentId) {
              submitCount += 1;
            }
          }
          if (startCount >= 1 || submitCount >= 1) {
            return res.status(409).json({
              message: "You have already attempted this domain",
            });
          }

          await Domain.updateOne(
            { _id: domainId },
            { $push: { usersStarted: { studentId } } }
          )
            .then(async () => {
              await Student.updateOne(
                { _id: studentId, "tests.testId": testId },
                {
                  $push: { "tests.$.domains": { domainId, status: "Started" } },
                }
              )
                .then(async () => {
                  await Question.find({ testId, domainId })
                    .then(async (questions) => {
                      for (let question of questions) {
                        let obj = {};
                        obj.questionId = question._id;
                        obj.questionType = question.type;
                        obj.questionMarks = question.questionMarks;
                        obj.description = question.description;
                        if (question.media.type) {
                          obj.media = question.media;
                          obj.mediaURL = question.mediaURL;
                        }
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
                      console.log(err.toString());

                      errorLogger.info(
                        `System: ${req.ip} | ${req.method} | ${
                          req.originalUrl
                        } >> ${err.toString()}`
                      );

                      res.status(500).json({
                        message: "Something went wrong",
                        error: err.toString(),
                      });
                    });
                })
                .catch((err) => {
                  console.log(err.toString());

                  errorLogger.info(
                    `System: ${req.ip} | ${req.method} | ${
                      req.originalUrl
                    } >> ${err.toString()}`
                  );
                  res.status(500).json({
                    message: "Something went wrong",
                    error: err.toString(),
                  });
                });
            })
            .catch((err) => {
              console.log(err.toString());

              errorLogger.info(
                `System: ${req.ip} | ${req.method} | ${
                  req.originalUrl
                } >> ${err.toString()}`
              );
              res.status(500).json({
                message: "Something went wrong",
                error: err.toString(),
              });
            });
        })

        .catch((err) => {
          console.log(err.toString());

          errorLogger.info(
            `System: ${req.ip} | ${req.method} | ${
              req.originalUrl
            } >> ${err.toString()}`
          );
          res.status(500).json({
            message: "Something went wrong",
            error: err.toString(),
          });
        });
    })
    .catch((err) => {
      console.log(err.toString());

      errorLogger.info(
        `System: ${req.ip} | ${req.method} | ${
          req.originalUrl
        } >> ${err.toString()}`
      );
      res.status(500).json({
        message: "Something went wrong",
        error: err.toString(),
      });
    });
};

// @desc Submit answers for a domain
// @route POST /api/test/domain/submit
const submitDomain = async (req, res, next) => {
  const { submissions, domainId, testId, clubId, timeTaken } = req.body;
  const studentId = req.user.userId;

  if (!submissions || !domainId || !timeTaken) {
    return res.status(400).json({
      message: "1 or more parameter(s) missing from req.body",
    });
  }

  let studentAnswers = [];
  let answerObj = {};
  var score = 0;
  var now = Date.now();
  var corrected = false;
  var autoCorrectCount = 0;
  let submitCount = 0;

  await Domain.findById(domainId)
    .then(async (domain) => {
      //Check if the student has already attempted this domain
      for (i in domain.usersFinished) {
        if (domain.usersFinished[i].studentId == studentId) {
          submitCount++;
          break;
        }
      }
    })
    .catch((err) => {
      errorLogger.info(
        `System: ${req.ip} | ${req.method} | ${
          req.originalUrl
        } >> ${err.toString()}`
      );
      res.status(500).json({
        message: "Something went wrong",
        // error: err.toString(),
      });
    });

  if (submitCount >= 1) {
    return res.status(409).json({
      message: "You have already attempted this domain",
    });
  }

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
      answerObj.answers = response.answers;
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
      answerObj.answers = response.answers;
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
      await Student.updateOne(
        { _id: studentId, "tests.testId": testId },
        {
          $push: { "tests.$.domains": { domainId, status: "Submitted" } },
        }
      )

        /// TODO - then catch
        .then(async () => {
          const domain = await Domain.findById(domainId);
          if (domain) {
            console.log(domain);
          }
          res.status(200).json({
            message: "Domain submitted",
          });
        })
        .catch((err) => {
          errorLogger.info(
            `System: ${req.ip} | ${req.method} | ${
              req.originalUrl
            } >> ${err.toString()}`
          );
          res.status(500).json({
            message: "Something went wrong",
            // error: err.toString(),
          });
        });
    })
    .catch((err) => {
      errorLogger.info(
        `System: ${req.ip} | ${req.method} | ${
          req.originalUrl
        } >> ${err.toString()}`
      );
      res.status(500).json({
        message: "Something went wrong",
        // error: err.toString(),
      });
    });
};

// @desc Get all submissions of a domain
// @route GET /api/test/domain/allSubmissions
const getAllSubmissionsOfADomain = async (req, res, next) => {
  const { domainId } = req.query;

  if (!domainId) {
    return res.status(400).json({
      message: "1 or more parameter(s) missing from req.query",
    });
  }
  if (!mongoose.Types.ObjectId.isValid(domainId)) return res.status(401);

  await Domain.findById(domainId)
    // .populate(
    //   "clubId testId",
    //   "name email type roundNumber roundType instructions scheduledForDate scheduledEndDate graded"
    // )
    .populate({
      path: "clubId testId usersFinished shortlisedInDomain",
      select:
        "name email type roundNumber roundType instructions scheduledForDate scheduledEndDate graded responses",
      populate: {
        path: "studentId responses",
        select:
          "name email mobileNumber timeTaken submittedOn answers questionType questionMarks corrected scoredQuestionMarks",
        populate: { path: "questionId", select: "description options" },
      },
    })
    .then(async (domain) => {
      if (domain.clubId._id != req.user.userId) {
        return res.status(403).json({
          message: "This is not your club!",
        });
      }
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
        usersFinished: domain.usersFinished,
        shortlisedInDomain: domain.shortlisedInDomain,
      });
    })
    .catch((err) => {
      errorLogger.info(
        `System: ${req.ip} | ${req.method} | ${
          req.originalUrl
        } >> ${err.toString()}`
      );
      res.status(500).json({
        message: "Something went wrong",
        error: err.toString(),
      });
    });
};

// @desc Get a student's submission of a domain
// @route GET /api/test/domain/studentSubmission
const getStudentDomainSubmission = async (req, res, next) => {
  const { domainId, studentId } = req.query;

  if (!domainId || !studentId) {
    return res.status(400).json({
      message: "1 or more parameter(s) missing from req.body",
    });
  }

  let submission = [];
  await Domain.findOne({ _id: domainId })
    .populate({
      path: "clubId testId usersFinished",
      select:
        "name email type roundNumber roundType instructions scheduledForDate scheduledEndDate graded responses",
      populate: {
        path: "studentId responses",
        select: "name email mobileNumber timeTaken submittedOn",
        populate: { path: "questionId", select: "description options" },
      },
    })
    .then(async (domain) => {
      if (domain.clubId._id != req.user.userId) {
        return res.status(403).json({
          message: "This is not your club!",
        });
      }
      for (i in domain.usersFinished) {
        if (domain.usersFinished[i].studentId._id.equals(studentId)) {
          submission = domain.usersFinished[i].responses;
        }
      }
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
        submission,
      });
    })
    .catch((err) => {
      errorLogger.info(
        `System: ${req.ip} | ${req.method} | ${
          req.originalUrl
        } >> ${err.toString()}`
      );
      res.status(500).json({
        message: "Something went wrong",
        // error: err.toString(),
      });
    });
};

// @desc Shortlist students in a domain
// @route PATCH /api/test/domain/shortlist
const shortlistStudent = async (req, res, next) => {
  const { domainId, studentId, remark } = req.body;
  let flag = 0;
  let clubFlag = 0;

  await Domain.findById(domainId)
    .then(async (domain) => {
      if (domain.clubId != req.user.userId) {
        clubFlag = 1;
      }
      for (student of domain.shortlisedInDomain) {
        if (student.studentId.equals(studentId)) {
          student.remark = remark;
          await domain.save();
          flag = 1;
          break;
        }
      }
    })
    .catch((err) => {
      errorLogger.info(
        `System: ${req.ip} | ${req.method} | ${
          req.originalUrl
        } >> ${err.toString()}`
      );
      res.status(500).json({
        message: "Something went wrong",
        // error: err.toString(),
      });
    });

  if (clubFlag == 0) {
    if (flag == 0) {
      console.log("f");
      await Domain.updateOne(
        { _id: domainId },
        { $push: { shortlisedInDomain: { studentId, remark } } }
      )
        .then(async () => {
          res.status(200).json({
            message: "Shortlisted",
          });
        })
        .catch((err) => {
          errorLogger.info(
            `System: ${req.ip} | ${req.method} | ${
              req.originalUrl
            } >> ${err.toString()}`
          );
          res.status(500).json({
            message: "Something went wrong",
            // error: err.toString(),
          });
        });
    } else {
      res.status(200).json({
        message: "Shortlisted",
      });
    }
  } else {
    return res.status(403).json({
      message: "This is not your club!",
    });
  }
};

// @desc Delete a shortlisted student
// @route PATCH /api/test/domain/shortlist/removeStudent
const removeShortlistedStudent = async (req, res, next) => {
  const { domainId, studentId } = req.body;
  const domain = await Domain.findById(domainId);
  if (domain.clubId != req.user.userId) {
    return res.status(403).json({
      message: "This is not your club!",
    });
  }
  await Domain.updateOne(
    { _id: domainId },
    { $pull: { shortlisedInDomain: { studentId } } }
  )
    .then(async () => {
      res.status(200).json({
        message: "Removed",
      });
    })
    .catch((err) => {
      errorLogger.info(
        `System: ${req.ip} | ${req.method} | ${
          req.originalUrl
        } >> ${err.toString()}`
      );
      res.status(500).json({
        message: "Something went wrong",
        // error: err.toString(),
      });
    });
};
// @desc Publish shortlisted results
// @route GET /api/test/domain/shortlist/publish
const publishShortlisted = async (req, res, next) => {
  const { domainId, testId } = req.body;
  const domain = await Domain.findById(domainId);
  if (domain.clubId != req.user.userId) {
    return res.status(402).json({
      message: "This is not your club!",
    });
  }
  if (!domain) {
    res.status(500).json({
      message: "Something went wrong",
      error: err.toString(),
    });
  }
  const totalStudents = domain.usersFinished;
  const shortlistStudents = domain.shortlisedInDomain;
  const totalStudentsId = [];
  const shortlistedStudentId = [];
  for (let student of totalStudents) {
    totalStudentsId = [...totalStudentsId, student.studentId];
  }
  for (let student of shortlistStudents) {
    shortlistedStudentId = [...shortlistedStudentId, student.studentId];
  }
  const notShortlistedStudentsId = totalStudentsId.filter(
    (n) => !shortlistedStudentId.includes(n)
  );
  ///////////////////////////////////////////////////////SEND EMAILS///////////////////////////////////////
  for (let studentId of shortlistedStudentId) {
    await Student.updateOne(
      { _id: studentId, "tests.testId": testId },
      {
        $push: { "tests.$.domains": { domainId, status: "Shortlisted" } },
      }
    );
  }
  for (let studentId of notShortlistedStudentsId) {
    await Student.updateOne(
      { _id: studentId, "tests.testId": testId },
      {
        $push: { "tests.$.domains": { domainId, status: "Not Shortlisted" } },
      }
    );
  }

  res.status(200).json({
    message: "Done",
  });
};

// @desc Update domain details
// @route PATCH /api/test/domain/details
const updateDomainDetails = async (req, res, next) => {
  const {
    testId,
    domainId,
    domainName,
    domainDescription,
    domainInstructions,
    domainDuration,
  } = req.body;
  const domain = await Domain.findById(domainId);

  if (domain.clubId != req.user.userId) {
    return res.status(403).json({
      message: "This is not your club!",
    });
  }
  await Test.findById(testId)
    .then(async (test) => {
      // if (test.scheduledForDate <= Date.now()) {
      //   return res.status(409).json({
      //     message: "You can't update the domain since it has already started",
      //   });
      // } else {
      await Domain.updateOne(
        { _id: domainId },
        {
          $set: {
            domainName,
            domainDescription,
            domainInstructions,
            domainDuration,
          },
        }
      )
        .then(async () => {
          res.status(200).json({
            message: "Domain details updated",
          });
        })
        .catch((err) => {
          errorLogger.info(
            `System: ${req.ip} | ${req.method} | ${
              req.originalUrl
            } >> ${err.toString()}`
          );

          return res.status(500).json({
            message: "Something went wrong",
            // error: err.toString(),
          });
        });
      // }
    })
    .catch((err) => {
      errorLogger.info(
        `System: ${req.ip} | ${req.method} | ${
          req.originalUrl
        } >> ${err.toString()}`
      );

      return res.status(500).json({
        message: "Something went wrong",
        // error: err.toString(),
      });
    });
};

// @desc Delete a domain
// @route DELETE /api/test/domain/delete
const deleteDomain = async (req, res, next) => {
  const { testId, domainId } = req.body;
  const domain = await Domain.findById(domainId);

  if (domain.clubId != req.user.userId) {
    return res.status(403).json({
      message: "This is not your club!",
    });
  } else {
    await Question.deleteMany({ domainId })
      .then(async () => {
        await Student.updateOne(
          // {},
          // {
          //   $pull: { "tests.$[].domains": { domainId } },
          // },
          {},
          { $pull: { "tests.$[].domains": { domainId } } },
          { multi: true }
        )
          .then(async () => {
            await Domain.deleteOne({ _id: domainId })
              .then(async () => {
                res.status(200).json({
                  message: "Domain deleted successfully",
                });
              })
              .catch((err) => {
                errorLogger.info(
                  `System: ${req.ip} | ${req.method} | ${
                    req.originalUrl
                  } >> ${err.toString()}`
                );

                return res.status(500).json({
                  message: "Something went wrong",
                  error: err.toString(),
                });
              });
          })
          .catch((err) => {
            errorLogger.info(
              `System: ${req.ip} | ${req.method} | ${
                req.originalUrl
              } >> ${err.toString()}`
            );

            return res.status(500).json({
              message: "Something went wrong",
              error: err.toString(),
            });
          });
      })
      .catch((err) => {
        errorLogger.info(
          `System: ${req.ip} | ${req.method} | ${
            req.originalUrl
          } >> ${err.toString()}`
        );

        return res.status(500).json({
          message: "Something went wrong",
          // error: err.toString(),
        });
      });
  }
};

module.exports = {
  addDomain,
  getAllDomainsOfATest,
  getDetailsOfDomain,
  finalizeDomain,
  attemptDomain,
  submitDomain,
  getAllSubmissionsOfADomain,
  getStudentDomainSubmission,
  shortlistStudent,
  removeShortlistedStudent,
  publishShortlisted,
  updateDomainDetails,
  deleteDomain,
};
