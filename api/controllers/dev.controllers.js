const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require("multer");
const AWS = require("aws-sdk");
const jsonexport = require("jsonexport");
const fs = require("fs");

require("dotenv").config();

const Club = require("../models/club.model");
const Student = require("../models/student.model");
const Test = require("../models/test.model");
const Question = require("../models/question.model");
const Domain = require("../models/testDomain.model");

const { errorLogger } = require("../utils/logger");

const SES_CONFIG = {
  accessKeyId: global.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: global.env.AWS_SECRET_ACCESS_KEY,
  region: "ap-south-1",
};

const AWS_SES = new AWS.SES(SES_CONFIG);

const {
  sendVerificationOTP,
  sendWelcomeMail,
  shortlistedMgmt,
  shortlistedCC,
  shortlistedFrontend,
  shortlistedApp,
  shortlistedBackend,
  shortlistedML,
  shortlistedCloud,
} = require("../utils/emailTemplates");
const { domain } = require("process");

const getAllClubs = async (req, res, next) => {
  await Club.find()
    .select("-password")
    .then(async (clubs) => {
      res.status(200).json({
        clubs,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err.toString,
      });
    });
};

const getAllFeaturedClubs = async (req, res) => {
  await Club.find({
    featured: true,
  })
    .select(
      "name email type bio featured website username clubAvatar clubBanner clubImages socialMediaLinks mobileNumber typeOfPartner redirectURL numOfTestsPublished"
    )
    .then(async (clubs) => {
      let megaResult = clubs.filter((club) => club.typeOfPartner == "Mega");
      let nanoResult = clubs.filter((club) => club.typeOfPartner == "Nano");
      let microResult = clubs.filter((club) => club.typeOfPartner == "Micro");
      let gigaResult = clubs.filter((club) => club.typeOfPartner == "Giga");
      let typeSortedClubs = gigaResult.concat(
        megaResult,
        microResult,
        nanoResult
      );

      res.status(200).json({
        clubs: typeSortedClubs,
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

const getAllTestsOfAClub = async (req, res) => {
  const { clubId } = req.query;

  await Test.find({ clubId })
    .populate("clubId", "name email")
    .then(async (tests) => {
      res.status(200).json({
        tests,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err.toString,
      });
    });
};

const getAllPublishedTestsOfAClub = async (req, res, next) => {
  const { clubId } = req.query;

  if (!clubId) {
    return res.status(400).json({
      message: "1 or more parameter(s) missing from req.query",
    });
  }

  await Test.find({ clubId, published: true })
    .then(async (tests) => {
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

const getAllDomainsOfATest = async (req, res, next) => {
  const { testId } = req.query;

  await Domain.find({ testId })
    .then(async (domains) => {
      res.status(200).json({
        domains,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err.toString,
      });
    });
};

const getDomainByID = async (req, res) => {
  const { domainId } = req.query;

  await Domain.findById(domainId)
    .then(async (domain) => {
      res.status(200).json(domain);
    })
    .catch((err) => {
      res.status(500).json({
        error: err.toString,
      });
    });
};

const clearEntriesFromDomainByStudentID = async (req, res) => {
  const { domainId, studentsArr, testId } = req.body;

  for (studentId of studentsArr) {
    // console.log(studentId);
    await Test.updateOne(
      { _id: testId },
      {
        $pull: { usersFinished: { studentId } },
        $pull: { usersStarted: { studentId } },
      }
    )
      .then(async () => {
        await Domain.updateOne(
          { testId },
          {
            // $pull: { usersFinished: { studentId } },
            $pull: { usersStarted: { studentId } },
          }
        )
          .then(async (sdasd) => {
            // console.log(sdasd);
            await Student.updateOne(
              { _id: studentId },
              {
                $pull: { tests: { testId } },
              }
            )
              .then((msg) => {
                // console.log(msg);
              })
              .catch((err) => {
                res.status(500).json({
                  error: err.toString(),
                });
              });
          })
          .catch((err) => {
            res.status(500).json({
              error: err.toString,
            });
          });
      })
      .catch((err) => {
        res.status(500).json({
          error: err.toString,
        });
      });
  }
  res.status(200).json({ message: "Done" });
};

const studentTestDashboard = async (req, res, next) => {
  const { studentId } = req.body;

  await Student.findById(studentId)
    .select(
      "-password -isEmailVerified -isMobileVerified -emailVerificationCode -emailVerificationCodeExpires -__v"
    )
    .populate({
      path: "tests",
      populate: {
        path: "testId clubId domains",
        select:
          "roundNumber roundType instructions scheduledForDate scheduledEndDate graded bio email name type clubAvatar clubBanner clubImages socialMediaLinks redirectURL",
        populate: {
          path: "domainId",
          select:
            "domainName domainDescription domainInstructions domainDuration status",
        },
      },
    })
    .then(async (student) => {
      res.status(200).json({
        studentDetails: {
          _id: student._id,
          name: student.name,
          email: student.email,
          mobileNumber: student.mobileNumber,
          bio: student.bio,
          branch: student.branch,
          registrationNumber: student.registrationNumber,
        },
        tests: student.tests,
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

const getDetailsOfMultipleStudents = async (req, res) => {
  const { studentsArr } = req.body;
  let studentsFinalArray = [];
  for (studentId of studentsArr) {
    await Student.findById(studentId)
      .select("name email mobileNumber")
      .then(async (student) => {
        studentsFinalArray.push(student);
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
  }
  console.log(studentsFinalArray.length);
  res.status(200).json({
    studentsFinalArray,
  });
};

const sendShortlistEmail = async (req, res) => {
  const { studentsArr } = req.body;

  const SES_CONFIG = {
    accessKeyId: global.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: global.env.AWS_SECRET_ACCESS_KEY,
    region: "ap-south-1",
  };

  const AWS_SES = new AWS.SES(SES_CONFIG);

  for (student of studentsArr) {
    // console.log(student.studentId.email);
    let params = {
      Source: "contact@codechefvit.com",
      Destination: {
        ToAddresses: [student.email],
      },
      ReplyToAddresses: [],
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: shortlistedCloud(),
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: `Shortlisted for Round 2 - CodeChef-VIT Recruitments`,
        },
      },
    };

    AWS_SES.sendEmail(params)
      .promise()
      .then(() => {
        console.log(`Mail sent:  ${params.Destination.ToAddresses}`);
        // return true;
      })
      .catch(() => {
        console.log(`Mail not sent:  ${params.Destination.ToAddresses}`);
        // return false;
      });
  }
  res.status(200).json({ message: "Done" });
};

const sendWelcomeEmail = async (req, res) => {
  const { emailArray } = req.body;

  const SES_CONFIG = {
    accessKeyId: global.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: global.env.AWS_SECRET_ACCESS_KEY,
    region: "ap-south-1",
  };

  const AWS_SES = new AWS.SES(SES_CONFIG);

  let params = {
    Source: "contact@codechefvit.com",
    Destination: {
      ToAddresses: emailArray,
    },
    ReplyToAddresses: [],
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: sendWelcomeMail(),
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: `Common Entry Test - Email Whitelisted`,
      },
    },
  };

  AWS_SES.sendEmail(params)
    .promise()
    .then(() => {
      res.status(200).json({ message: "Emails Sent" });
    })
    .catch(() => {
      res.status(500).json({ message: "Something went wrong" });
    });
};

const whitelistEmails = async (req, res) => {
  const { clubsArray } = req.body;

  for (club of clubsArray) {
    await Club.find({ email: club.email })
      .then(async (clubs) => {
        if (clubs.length >= 1) {
          console.log("Club already exists: ", clubs[0].email);
        } else {
          let newClub = new Club({
            _id: new mongoose.Types.ObjectId(),
            email: club.email,
            typeOfPartner: club.typeOfPartner,
          });
          await newClub
            .save()
            .then((result) => {
              console.log("Club created successfully: ", result.email);

              let params = {
                Source: "contact@codechefvit.com",
                Destination: {
                  ToAddresses: [club.email],
                },
                ReplyToAddresses: [],
                Message: {
                  Body: {
                    Html: {
                      Charset: "UTF-8",
                      Data: sendWelcomeMail(),
                    },
                  },
                  Subject: {
                    Charset: "UTF-8",
                    Data: `Common Entry Test - Email Whitelisted`,
                  },
                },
              };

              AWS_SES.sendEmail(params)
                .promise()
                .then(() => {
                  console.log(
                    "Email sent to: ",
                    params.Destination.ToAddresses[0]
                  );
                })
                .catch((err) => {
                  console.log(err.toString());
                });
            })
            .catch((err) => {
              console.log(err.toString());
            });
        }
      })
      .catch((err) => {
        console.log(err.toString());
      });
  }
  res.status(200).json({
    message: "Done",
  });
};

const getAllSubmissionsOfDomain = async (req, res) => {
  const { domainId } = req.query;

  await Domain.findById(domainId)
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
      res.status(200).json(domain);
    })
    .catch((err) => {
      res.status(500).json({
        error: err.toString,
      });
    });
};

const getNumSubmissionOfAllDomains = async (req, res) => {
  const { testId } = req.query;

  await Domain.find({ testId })
    // .populate({
    //   path: "usersFinished testId",
    //   select: "responses",
    //   populate: {
    //     path: "studentId responses",
    //     select:
    //       "name email mobileNumber timeTaken submittedOn answers questionType questionMarks corrected scoredQuestionMarks",
    //     populate: { path: "questionId", select: "description options" },
    //   },
    // })
    .populate("testId", "roundType")
    .then(async (domains) => {
      // console.log(domains);
      // console.log(domains);
      console.log(domains[0].testId.roundType);
      for (i in domains) {
        console.log(domains[i].domainName, domains[i].usersFinished.length);
      }

      // for (domain of domains) {
      //   jsonexport(domain.usersFinished, async function (err, csv) {
      //     if (err) return console.error(err);
      //     // console.log(csv);
      //     await fs.writeFileSync(`${domain.domainName}.csv`, csv);
      //   });
      // }
      // for (i in domains) {
      //   if (i == 0) {
      //     console.log("domains[0].usersFinished");
      //     jsonexport(domains[0].usersFinished, function (err, csv) {
      //       if (err) return console.error(err);
      //       // console.log(csv);
      //       fs.writeFileSync(`${domains[0].name}.csv`, csv);
      //     });
      //   }
      // }
      res.status(200).json({
        message: "Done",
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err.toString(),
      });
    });
};

const getNumSubmissionOfAllDomainsofMultipleTests = async (req, res) => {
  const { testIdArr } = req.body;
  let studentIdsArr = [];
  let uniqueArr = [];
  console.log("-----------------------------");
  for (testId of testIdArr) {
    await Domain.find({ testId })
      .populate("testId", "roundType")
      .then(async (domains) => {
        console.log(domains[0].testId.roundType);
        for (i in domains) {
          console.log(domains[i].domainName, domains[i].usersFinished.length);
          for (j in domains[i].usersFinished) {
            studentIdsArr.push(domains[i].usersFinished[j].studentId);
          }
        }
        console.log("-----------------------------");
        uniqueArr = [...new Set(studentIdsArr)];
      })
      .catch((err) => {
        res.status(500).json({
          error: err.toString(),
        });
      });
  }
  res.status(200).json({
    message: "Done",
    studentIdsArr,
    uniqueArr,
  });
};

const removeUsersFinished = async (req, res, next) => {
  const { domainId, studentId } = req.body;
  await Domain.updateOne(
    { _id: domainId },
    {
      $pull: { usersFinished: { studentId } },
      $pull: { usersStarted: { studentId } },
    }
  )
    .then((result) => {
      console.log(result);
      return res.status(200).json({ message: "done" });
    })
    .catch((err) => {
      return res.status(500).json({
        err: err.toString(),
      });
    });
};

const findUserByEmail = async (req, res, next) => {
  const student = await Student.findOne({ email: req.body.email });
  if (!student) {
    return res.status(404).json({
      message: "Student not found",
    });
  } else {
    return res.status(200).json({ student });
  }
};

const getTotalUsersStarted = async (req, res) => {
  const { testIdArr } = req.body;
  let studentIdsArr = [];

  console.log("-----------------------------");
  for (testId of testIdArr) {
    await Domain.find({ testId })
      .populate("testId", "roundType")
      .then(async (domains) => {
        console.log(domains[0].testId.roundType);
        for (i in domains) {
          console.log(domains[i].domainName, domains[i].usersStarted.length);
          for (j in domains[i].usersStarted) {
            studentIdsArr.push(domains[i].usersStarted[j].studentId);
          }
        }
        console.log("-----------------------------");
        uniqueArr = [...new Set(studentIdsArr)];
      })
      .catch((err) => {
        // res.status(500).json({
        //   error: err.toString(),
        // });
        console.log(err.toString);
      });
  }
  res.status(200).json({
    message: "Done",
    studentIdsArr,
    uniqueArr,
  });
};

const getShortlistedStudentsOfADomain = async (req, res) => {
  const { domainId } = req.query;

  await Domain.findById(domainId)
    .populate(
      "shortlisedInDomain.studentId testId",
      "name registrationNumber email mobileNumber roundType"
    )
    // .populate({
    //   path: ""
    // })
    .then(async (domain) => {
      // console.log(domain.testId);
      res.status(200).json({
        testName: domain.testId.roundType,
        domainName: domain.domainName,
        shortlistedInDomain: domain.shortlisedInDomain,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err.toString(),
      });
    });
};

const getAllShortlistedStudentsOfClub = async (req, res) => {
  const { clubId } = req.query;

  let studentArr = [];

  await Test.find({ clubId })
    .then(async (tests) => {
      for (test of tests) {
        await Domain.find({ testId: test._id })
          .populate(
            "shortlisedInDomain.studentId testId",
            "name registrationNumber email mobileNumber roundType"
          )
          .then(async (domains) => {
            for (let domain of domains) {
              // if (domain.shortlisedInDomain) {
              // console.log("adasd");
              for (let student of domain.shortlisedInDomain) {
                // console.log(student);
                // console.log(domain.shortlisedInDomain);
                let studentObj = {};
                studentObj.studentId = student.studentId._id;
                studentObj.name = student.studentId.name;
                studentObj.email = student.studentId.email;
                studentObj.registrationNumber =
                  student.studentId.registrationNumber;
                studentObj.mobileNumber = student.studentId.mobileNumber;
                studentObj.domainName = domain.domainName;
                studentObj.testName = domain.testId.roundType;
                studentObj.testRemark = student.remark;

                // console.log(studentObj);
                studentArr.push(studentObj);
              }
              // }
            }
            // console.log(domain);
          })
          .catch((err) => {
            console.log(err.toString());
            // res.status(500).json({
            //   error: err.toString(),
            // });
          });
      }
      res.status(200).json(studentArr);
    })
    .catch((err) => {
      res.status(500).json({
        error: err.toString(),
      });
    });
};

const getShortlistedStudentsMultipleDomains = async (req, res) => {
  const { domainIdsArr } = req.body;
  let studentArr = [];
  for (let domain of domainIdsArr) {
    // console.log(domain);

    await Domain.findById(domain)
      .populate(
        "shortlisedInDomain.studentId testId",
        "name registrationNumber email mobileNumber roundType"
      )
      .then(async (domain) => {
        // console.log(domain);
        // for (let domain of domains) {
        for (let student of domain.shortlisedInDomain) {
          let studentObj = {};
          studentObj.studentId = student.studentId._id;
          studentObj.name = student.studentId.name;
          studentObj.email = student.studentId.email;
          studentObj.registrationNumber = student.studentId.registrationNumber;
          studentObj.mobileNumber = student.studentId.mobileNumber;
          studentObj.domainName = domain.domainName;
          studentObj.testName = domain.testId.roundType;
          studentObj.testRemark = student.remark;

          studentArr.push(studentObj);
        }
        // }
      })
      .catch((err) => {
        console.log(err.toString());
        // res.status(500).json({
        //   error: err.toString(),
        // });
      });
  }
  res.status(200).json(studentArr);
};

module.exports = {
  getAllClubs,
  getAllFeaturedClubs,
  getAllTestsOfAClub,
  getAllPublishedTestsOfAClub,
  getAllDomainsOfATest,
  getDomainByID,
  clearEntriesFromDomainByStudentID,
  studentTestDashboard,
  getDetailsOfMultipleStudents,
  whitelistEmails,
  getAllSubmissionsOfDomain,
  getNumSubmissionOfAllDomains,
  getNumSubmissionOfAllDomainsofMultipleTests,
  removeUsersFinished,
  findUserByEmail,
  getTotalUsersStarted,
  getShortlistedStudentsOfADomain,
  getAllShortlistedStudentsOfClub,
  sendShortlistEmail,
  getShortlistedStudentsMultipleDomains,
};
