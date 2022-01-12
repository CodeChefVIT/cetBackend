const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require("multer");
var moment = require('moment');  

require("dotenv").config();

const Club = require("../models/club.model");
const Student = require("../models/student.model");
const Test = require("../models/test.model");
const Question = require("../models/question.model");
const Domain = require("../models/testDomain.model");

const { errorLogger } = require("../utils/logger");
const { debug } = require("request");

// @desc Create a test
// @route POST /api/test/create
const create = async (req, res, next) => {
  const {
    roundNumber,
    roundType,
    instructions,
    scheduledForDate,
    scheduledEndDate,
    clubId,
  } = req.body;

  if (
    !roundNumber ||
    !roundType ||
    !instructions ||
    !scheduledForDate ||
    !scheduledEndDate
  ) {
    return res.status(400).json({
      message: "1 or more parameter(s) missing from req.body",
    });
  }
  if (clubId != req.user.userId) {
    return res.status(403).json({
      message: "This is not your club!",
    });
  }
  // const clubId = req.user.userId;

  const test = new Test({
    _id: new mongoose.Types.ObjectId(),
    clubId,
    roundNumber,
    roundType,
    instructions,
    scheduledForDate: moment(scheduledForDate).format(),
    scheduledEndDate: moment(scheduledEndDate).format(),
  });

  await test
    .save()
    .then(async (result) => {
      res.status(201).json({
        message: "Test created",
        testDetails: result,
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

// @desc Get a test by ID
// @route GET /api/test/details?testId=
const getTestDetails = async (req, res, next) => {
  const { testId } = req.query;

  if (!testId) {
    return res.status(400).json({
      message: "1 or more parameter(s) missing from req.query",
    });
  }

  await Test.findById(testId)
    .then(async (test) => {
      res.status(200).json({
        test,
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

// @desc Apply for a test
// @route GET /api/test/apply
const apply = async (req, res, next) => {
  const { testId, clubId } = req.body;
  const studentId = req.user.userId;
  const appliedOn = moment(Date.now()).format();
  let flag = 0;

  if (!testId || !clubId) {
    return res.status(400).json({
      message: "1 or more parameter(s) missing from req.body",
    });
  }

  await Test.findById(testId)
    .then(async (test) => {
      //Check if a user has already applied for the test
      for (i in test.users) {
        if (test.users[i].studentId == studentId) {
          flag = 1;
        }
      }

      if (flag === 1) {
        return res.status(420).json({
          message: "You have already applied for the test",
        });
      }
      console.log(test);
      //Check if a user has already given a test
      for (i in test.usersStarted) {
        console.log(wth+"-------"+studentId);
        if (test.usersStarted[i].studentId == studentId) {
          flag = 2;
        }
      }
      for (i in test.usersFinished) {
        if (test.usersFinished[i].studentId == studentId) {
          flag = 2;
        }
      }
      if (flag === 2) {
        return res.status(409).json({
          message: "You have already given the test",
        });
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

  await Test.updateOne(
    {
      _id: testId,
    },
    {
      $push: {
        users: {
          studentId,
        },
      },
    }
  )
    .then(async () => {
      await Student.updateOne(
        {
          _id: studentId,
        },
        {
          $push: {
            tests: {
              testId,
              clubId,
              appliedOn,
              status: "Applied",
            },
          },
        }
      )
        .then(async () => {
          res.status(200).json({
            message: "Applied successfully",
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

// @desc Attempt a test
// @route GET /api/test/attempt
const attempt = async (req, res, next) => {
  const { testId } = req.body;
  const studentId = req.user.userId;
  const now = moment(Date.now()).format();
  let flag = 0;
  let appliedFlag = 0;
  if (!testId) {
    return res.status(400).json({
      message: "1 or more parameter(s) missing from req.body",
    });
  }

  await Test.findById(testId)
    .populate("clubId", "name email type")
    .then(async (test) => {
      //Check if user has already given the test
      // for (i in test.usersStarted) {
      //   if (test.usersStarted[i].studentId == studentId) {
      //     flag = 1;
      //   }
      // }
      for (i in test.usersFinished) {
        if (test.usersFinished[i].studentId == studentId) {
          return res.status(409).json({
            message: "You have already given the test",
          });
        }
      }

      //Check if a user didn't apply for a test
      for (i in test.users) {
        if (test.users[i].studentId == studentId) {
          appliedFlag = 1;
          break;
        }
      }

      if (appliedFlag === 0) {
        // return res.status(430).json({
        //   message: "You have not applied for the test",
        // });

        await Test.updateOne(
          {
            _id: testId,
          },
          {
            $push: {
              users: {
                studentId,
              },
            },
          }
        )
          .then(async () => {
            await Student.updateOne(
              {
                _id: studentId,
              },
              {
                $push: {
                  tests: {
                    testId,
                    clubId: test.clubId._id,
                    appliedOn: moment(Date.now()).format(),
                    status: "Applied",
                  },
                },
              }
            )
              .then(async () => {
                // res.status(200).json({
                //   message: "Applied successfully",
                // });
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
      }

      //Check if test hasn't started
      var rn = Date.now()
      var d = new Date(rn);
      d.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
      test.scheduledForDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
      console.log(test.scheduledForDate)
      console.log(d)
      console.log(rn)
      if (d < test.scheduledForDate) {
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

      await Test.updateOne(
        {
          _id: testId,
        },
        {
          $pull: {
            users: {
              studentId,
            },
          },
          $push: {
            usersStarted: {
              studentId,
            },
          },
        }
      )
        .then(async () => {
          await Student.updateOne(
            {
              _id: studentId,
              "tests.testId": testId,
            },
            // { $set: { startedOn: now, status: "Started" } }
            {
              $set: {
                "tests.$.status": "Started",
                "tests.$.startedOn": moment(now).format(),
              },
              // $set: { startedOn: now },
            }
          )
            .then(async () => {
              await Domain.find({
                testId,
              })
                .select(
                  "-__v -usersStarted -usersFinished -shortlisedInDomain -selectedInDomain"
                )
                .then(async (domains) => {
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
                    domains,
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

// @desc Submit a test
// @route POST /api/test/submit
const submit = async (req, res, next) => {
  const { testId } = req.body;
  const studentId = req.user.userId;
  console.log(testId);
  const now = moment(Date.now()).format();

  if (!testId) {
    return res.status(400).json({
      message: "1 or more parameter(s) missing from req.body",
    });
  }

  await Test.updateOne(
    {
      _id: testId,
    },
    {
      $pull: {
        usersStarted: {
          studentId,
        },
      },
      $push: {
        usersFinished: {
          studentId,
          submittedOn: now,
        },
      },
    }
  )
    .then(async () => {
      await Student.updateOne(
        {
          _id: studentId,
          "tests.testId": testId,
        },
        {
          $set: {
            "tests.$.status": "Submitted",
            "tests.$.submittedOn": now,
          },
        }
      )
        .then(async () => {
          res.status(200).json({
            message: "Submitted test successfully",
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

// @desc Get all applied tests
// @route GET /api/test/allApplied
// Not tested
const allApplied = async (req, res, next) => {
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

// @desc Get all submitted tests
// @route GET /api/test/allSubmitted
// Not tested
const allSubmitted = async (req, res, next) => {
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

// @desc Add students to a test and its subsequent domains
// @route POST /api/test/addStudents
const addStudents = async (req, res, next) => {
  const { studentsArray, testId, clubId } = req.body;

  if (!studentsArray || !testId || !clubId) {
    return res.status(400).json({
      message: "1 or more parameter(s) missing from req.body",
    });
  }
  const test = await Test.findById(testId);

  if (test.clubId != req.user.userId) {
    return res.status(403).json({
      message: "This is not your club!",
    });
  } else {
    let studentsIdArray = [];
    const appliedOn = moment(Date.now()).format();

    for (let studentEmail of studentsArray) {
      let student = await Student.findOneAndUpdate(
        {
          email: studentEmail,
        },
        {
          $push: {
            tests: {
              testId,
              clubId,
              appliedOn,
              status: "Added/Promoted",
            },
          },
        }
      );
      if (student) {
        let object = {
          studentId: student.id,
          marks: 0,
          corrected: false,
          responses: [],
        };
        studentsIdArray = [...studentsIdArray, object];
      }
    }
    await Test.findOneAndUpdate(
      { _id: testId },
      { $addToSet: { users: studentsIdArray } }
    )
      .then((result) => {
        return res.status(200).json({
          message: "Student array added",
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

// @desc Publish a test
// @route PATCH /api/test/publish
const publish = async (req, res, next) => {
  const { testId } = req.body;

  if (!testId) {
    return res.status(400).json({
      message: "1 or more parameter(s) missing from req.query",
    });
  }
  const test = await Test.findById(testId);

  if (test.clubId != req.user.userId) {
    return res.status(403).json({
      message: "This is not your club!",
    });
  }
  await Test.findOneAndUpdate({ _id: testId }, { published: true })
    .then(async (test) => {
      await Club.updateOne(
        { _id: test.clubId },
        { $inc: { numOfTestsPublished: 1 } }
      )
        .then(async () => {
          res.status(200).json({
            message: "Published succesfully",
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

// @desc Get all tests of a club -- admin only
// @route GET /api/test/allTestsOfAClub
const getAllTestOfAClub = async (req, res, next) => {
  // const { clubId } = req.query;
  const clubId = req.user.userId;

  await Test.find({ clubId })
    .select("-usersFinished -usersStarted -users")
    .then(async (tests) => {
      // if (tests[0].clubId != req.user.userId) {
      //   return res.status(403).json({
      //     message: "This is not your club!",
      //   });
      // }
      res.status(200).json({
        tests,
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
};

// @desc Get all published tests of a club
// @route PATCH /api/test/allPublishedTestsOfAClub
const getAllPublishedTestsOfAClub = async (req, res, next) => {
  const { clubId } = req.query;

  if (!clubId) {
    return res.status(400).json({
      message: "1 or more parameter(s) missing from req.query",
    });
  }

  await Test.find({ clubId, published: true })
    .then(async (tests) => {
      for (let i = 0; i < tests.length; i++) {
        if (Date.now() >= tests[i].scheduledEndDate) {
          tests.splice(i, 1);
        }
      }
      res.status(200).json({
        tests,
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
};

// @desc Update test details
// @route PATCH /api/test/details
const updateTest = async (req, res, next) => {
  const {
    testId,
    roundNumber,
    roundType,
    instructions,
    scheduledForDate,
    scheduledEndDate,
    graded,
  } = req.body;

  await Test.findById(testId)
    .then(async (test) => {
      if (test.clubId != req.user.userId) {
        return res.status(403).json({
          message: "This is not your club!",
        });
      }
      if (moment(test.scheduledForDate).isBefore(moment()) || moment(test.scheduledForDate).isSame(moment())) {
        return res.status(409).json({
          message: "You can't update the test since it has already started",
        });
      } else {
        await Test.updateOne(
          { _id: testId },
          {
            $set: {
              roundNumber,
              roundType,
              instructions,
              scheduledForDate,
              scheduledEndDate,
              graded,
            },
          }
        )
          .then(async () => {
            res.status(200).json({
              message: "Test details updated",
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

// @desc Delete a test
// @route DELETE /api/test/delete
const deleteTest = async (req, res, next) => {
  const { testId } = req.body;
  const test = await Test.findById(testId);

  if (test.clubId != req.user.userId) {
    return res.status(403).json({
      message: "This is not your club!",
    });
  }
  await Question.deleteMany({ testId })
    .then(async () => {
      await Domain.deleteMany({ testId })
        .then(async () => {
          await Student.updateMany(
            {},
            { $pull: { tests: { testId } } },
            { multi: true }
          )
            .then(async () => {
              await Test.deleteOne({ _id: testId })
                .then(async () => {
                  res.status(200).json({
                    message: "Test deleted successfully",
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

module.exports = {
  create,
  getTestDetails,
  apply,
  attempt,
  submit,
  allApplied,
  allSubmitted,
  addStudents,
  publish,
  getAllTestOfAClub,
  getAllPublishedTestsOfAClub,
  updateTest,
  deleteTest,
};
