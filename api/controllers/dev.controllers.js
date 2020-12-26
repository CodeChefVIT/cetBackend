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

const sendSESMailCubeStudents = async (req, res) => {
  // let studentsArr = [
  //   {
  //     _id: "5fdf12435ded065d81796695",
  //     name: "GANESH R",
  //     email: "ganesh.r2020@vitstudent.ac.in",
  //     "domains missed": "Speed-Cuber",
  //   },
  //   {
  //     _id: "5fdf07225ded065d8179667a",
  //     name: "SOMA MANTHIRAVEL",
  //     email: "soma.manthiravel2020@vitstudent.ac.in",
  //     "domains missed": "Speed-Cuber",
  //   },
  //   {
  //     _id: "5fdf32b7743a0965f6a160b1",
  //     name: "ANMOL GUPTA",
  //     email: "anmol.gupta2020@vitstudent.ac.in",
  //     "domains missed": "Speed-Cuber, Management, Cubing Enthusiast",
  //   },
  //   {
  //     _id: "5fdf3dd2743a0965f6a160dd",
  //     name: "SIDHARTH PIDAPARTY",
  //     email: "sidharth.pidaparty2020@vitstudent.ac.in",
  //     "domains missed": "Speed-Cuber, Management",
  //   },
  //   {
  //     _id: "5fdf41e9743a0965f6a160ec",
  //     name: "VARAD RAUT",
  //     email: "varadraut.j2020@vitstudent.ac.in",
  //     "domains missed": "Speed-Cuber, Management, Cubing Enthusiast, Design",
  //   },
  //   {
  //     _id: "5fdf45c5743a0965f6a1610e",
  //     name: "PRADEEP SUDAKAR",
  //     email: "pradeep.sudakar2020@vitstudent.ac.in",
  //     "domains missed": "Speed-Cuber",
  //   },
  //   {
  //     _id: "5fdf01565ded065d81796664",
  //     name: "SASWATA GHOSH",
  //     email: "saswata.ghosh2020@vitstudent.ac.in",
  //     "domains missed": "Speed-Cuber, Management",
  //   },
  //   {
  //     _id: "5fdf4eed743a0965f6a16154",
  //     name: "ARUN K",
  //     email: "arun.k2020@vitstudent.ac.in",
  //     "domains missed": "Speed-Cuber, Management, Cubing Enthusiast",
  //   },
  //   {
  //     _id: "5fdf56d1743a0965f6a16174",
  //     name: "TEJAS SHAH",
  //     email: "tejas.shah2020@vitstudent.ac.in",
  //     "domains missed": "Speed-Cuber, Management, Cubing Enthusiast",
  //   },
  //   {
  //     _id: "5fdeee7849613f4c0eb50d70",
  //     name: "Vaida Jai Raghuram Karthik 18BCE0413",
  //     email: "jai.raghuramkarthik2018@vitstudent.ac.in",
  //     "domains missed": "Management",
  //   },
  //   {
  //     _id: "5fdf263af0e4af641e7aca6c",
  //     name: "VENKAT SATHWIK",
  //     email: "venkat.sathwik2019@vitstudent.ac.in",
  //     "domains missed": "Management, Cubing Enthusiast",
  //   },
  //   {
  //     _id: "5fdef47b49613f4c0eb50d78",
  //     name: "DRUMIL HASMUKH PANCHAL 20BEE0128",
  //     email: "drumilhasmukh.panchal2020@vitstudent.ac.in",
  //     "domains missed": "Cubing Enthusiast",
  //   },
  //   {
  //     _id: "5fdf4857743a0965f6a16121",
  //     name: "ARHIT BOSE",
  //     email: "arhitbose.tagore2020@vitstudent.ac.in",
  //     "domains missed": "Cubing Enthusiast",
  //   },
  //   {
  //     _id: "5fdf4e26743a0965f6a1614d",
  //     name: "JOHANN KYLE",
  //     email: "johannkyle.pinto2020@vitstudent.ac.in",
  //     "domains missed": "Cubing Enthusiast",
  //   },
  // {
  //   _id: "5fdf543b743a0965f6a16173",
  //   name: "JIYA GARG",
  //   email: "jiya.garg2020@vitstudent.ac.in",
  //   "domains missed": "Cubing Enthusiast",
  // },
  // ];

  let testStudentsArr = [
    {
      _id: "5fdf543b743a0965f6a16173",
      name: "Rajat Sablok",
      email: "rajat.main06@gmail.com",
      "domains missed": "Cubing Enthusiast",
    },
    {
      _id: "5fdf543b743a0965f6a16173",
      name: "Shivam Mehta",
      email: "nousernameidea@gmail.com",
      "domains missed": "Speed-Cuber",
    },
    {
      _id: "5fdf543b743a0965f6a16173",
      name: "Rajat",
      email: "rajat.sablok2018@vitstudent.ac.in",
      "domains missed": "Speed-Cuber, Management",
    },
  ];
  const SES_CONFIG = {
    accessKeyId: global.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: global.env.AWS_SECRET_ACCESS_KEY,
    region: "ap-south-1",
  };

  const AWS_SES = new AWS.SES(SES_CONFIG);

  for (student of testStudentsArr) {
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
            Data: sendVerificationOTP(domainsMissed),
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: `Updates for C.U.B.E. VIT's Recruitments`,
        },
      },
    };

    AWS_SES.sendEmail(params)
      .promise()
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });
  }
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
      path: "clubId testId usersFinished",
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
};
