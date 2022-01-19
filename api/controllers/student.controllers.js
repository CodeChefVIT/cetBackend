const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require("multer");
const sgMail = require("@sendgrid/mail");
const nodemailer = require("nodemailer");
const AWS = require("aws-sdk");
require("dotenv").config();

const Club = require("../models/club.model");
const Student = require("../models/student.model");
const Test = require("../models/test.model");
const Question = require("../models/question.model");

const { errorLogger } = require("../utils/logger");

const {
  sendVerificationOTP,
  sendForgotPasswordMail,
  sendMobileOTP,
} = require("../utils/emailTemplates");

// @desc Student signup
// @route POST /api/student/signup
const signup = async (req, res) => {
  const { name, email, password, mobileNumber } = req.body;

  if (!name || !email || !password || !mobileNumber) {
    return res.status(400).json({
      message: "1 or more parameter(s) missing from req.body",
    });
  }

  await Student.find({ email })
    .then(async (students) => {
      if (students.length >= 1) {
        return res.status(409).json({
          message: "Email already registered",
        });
      }

      await bcrypt
        .hash(password, 10)
        .then(async (hash) => {
          const emailVerificationCode = Math.floor(
            100000 + Math.random() * 900000
          );

          const emailVerificationCodeExpires =
            new Date().getTime() + 20 * 60 * 1000;

          const student = new Student({
            _id: new mongoose.Types.ObjectId(),
            name,
            email,
            password: hash,
            mobileNumber,
            emailVerificationCode,
            emailVerificationCodeExpires,
          });

          await student
            .save()
            .then(async (result) => {
              const emailSent = sendSesOtp(email, emailVerificationCode);
              // let transporter = nodemailer.createTransport({
              //   service: "gmail",
              //   port: 465,

              //   auth: {
              //     user: process.env.NODEMAILER_EMAIL,
              //     pass: process.env.NODEMAILER_PASSWORD,
              //   },
              // });

              // let mailOptions = {
              //   subject: `Common Entry Test - Email Verification`,
              //   to: email,
              //   from: `CodeChef-VIT <${process.env.NODEMAILER_EMAIL}>`,
              //   html: sendVerificationOTP(emailVerificationCode),
              // };

              // transporter.sendMail(mailOptions, (error, response) => {
              //   if (error) {
              //     errorLogger.info(
              //       `System: ${req.ip} | ${req.method} | ${req.originalUrl
              //       } >> ${error.toString()} >> "Email not sent: ${mailOptions.to
              //       }`
              //     );
              //     return res.status(500).json({
              //       message: "Something went wrong",
              //       error: error.toString(),
              //     });
              //   } else {
              //     console.log("Email sent: ", mailOptions.to);
              //     res.status(201).json({
              //       message: "Signup successful",
              //     });
              //   }
              // });

              // const msg = {
              //   to: email,
              //   from: {
              //     email: process.env.SENDGRID_EMAIL,
              //     name: "CodeChef-VIT",
              //   },
              //   subject: `Common Entry Test - Email Verification`,
              //   text: `Use the following code to verify your email: ${emailVerificationCode}`,
              //   // html: EmailTemplates.tracker(
              //   //   users[i].name,
              //   //   companyArr[k].companyName,
              //   //   status
              //   // ),
              // };

              // await sgMail
              //   .send(msg)
              //   .then(async () => {
              res.status(201).json({
                message: "Signup successful",
              });
              //   })
              //   .catch((err) => {
              //     res.status(500).json({
              //       message: "Something went wrong",
              //       error: err.toString(),
              //     });
              //   });
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

// @desc Resend email verification OTP for students
// @route POST /api/student/email/resendOTP
const resendOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "1 or more parameter(s) missing from req.body",
    });
  }

  await Student.findOne({ email })
    .then(async (student) => {
      if (!student) {
        return res.status(404).json({
          message: "Invalid Email",
        });
      }

      emailVerificationCode = Math.floor(100000 + Math.random() * 900000);
      emailVerificationCodeExpires = new Date().getTime() + 20 * 60 * 1000;

      await Student.updateOne(
        { _id: student._id },
        {
          $set: {
            emailVerificationCode,
            emailVerificationCodeExpires,
          },
        }
      )
        .then(async () => {
          const emailSent = sendSesOtp(email, emailVerificationCode);
          // let transporter = nodemailer.createTransport({
          //   service: "gmail",
          //   port: 465,

          //   auth: {
          //     user: process.env.NODEMAILER_EMAIL,
          //     pass: process.env.NODEMAILER_PASSWORD,
          //   },
          // });

          // let mailOptions = {
          //   subject: `Common Entry Test - Email Verification`,
          //   to: email,
          //   from: `CodeChef-VIT <${process.env.NODEMAILER_EMAIL}>`,
          //   html: sendVerificationOTP(student.emailVerificationCode),
          // };

          // transporter.sendMail(mailOptions, (error, response) => {
          //   if (error) {
          //     errorLogger.info(
          //       `System: ${req.ip} | ${req.method} | ${req.originalUrl
          //       } >> ${error.toString()} >> "Email not sent: ${mailOptions.to}`
          //     );

          //     return res.status(500).json({
          //       message: "Something went wrong",
          //       error: error.toString(),
          //     });
          //   } else {
          //     console.log("Email sent: ", mailOptions.to);
          //     res.status(201).json({
          //       message: "Signup successful",
          //     });
          //   }
          // });
          // const msg = {
          //   to: email,
          //   from: {
          //     email: process.env.SENDGRID_EMAIL,
          //     name: "CodeChef-VIT",
          //   },
          //   subject: `Common Entry Test - Email Verification`,
          //   text: `Use the following code to verify your email: ${student.emailVerificationCode}`,
          //   // html: EmailTemplates.tracker(
          //   //   users[i].name,
          //   //   companyArr[k].companyName,
          //   //   status
          //   // ),
          // };
          // await sgMail
          //   .send(msg)
          //   .then(async () => {
          //     res.status(200).json({
          //       message: "Email verification OTP Sent",
          //     });
          //   })
          //   .catch((err) => {
          //     res.status(500).json({
          //       message: "Something went wrong",
          //       error: err.toString(),
          //     });
          //   });

          res.status(200).json({
            message: "Email verification OTP Sent",
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

// @desc Email verfication for students
// @route POST /api/student/email/verify
const verifyEmail = async (req, res) => {
  const { email, emailVerificationCode } = req.body;
  const now = Date.now();

  if (!email || !emailVerificationCode) {
    return res.status(400).json({
      message: "1 or more parameter(s) missing from req.body",
    });
  }

  await Student.findOne({ email })
    .then(async (student) => {
      if (student) {
        if (student.emailVerificationCode == emailVerificationCode) {
          if (student.emailVerificationCodeExpires > now) {
            await Student.updateOne(
              { _id: student._id },
              { isEmailVerified: true }
            )
              .then(async () => {
                res.status(200).json({
                  message: "Email successfully verified",
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
            return res.status(401).json({
              message: "Verification code expired",
            });
          }
        } else {
          return res.status(403).json({
            message: "Invalid verification code",
          });
        }
      } else {
        return res.status(404).json({
          message: "Invalid email",
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
};

// @desc Student login
// @route POST /api/student/login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "1 or more parameter(s) missing from req.body",
    });
  }

  await Student.find({ email })
    .then(async (student) => {
      if (student.length < 1) {
        return res.status(401).json({
          message: "Auth failed: Email not found",
        });
      }

      // if (!student[0].isEmailVerified) {
      //   return res.status(403).json({
      //     message: "Email not verified",
      //   });
      // }
      await bcrypt
        .compare(password, student[0].password)
        .then((result) => {
          if (result) {
            const token = jwt.sign(
              {
                userId: student[0]._id,
                userType: student[0].userType,
                email: student[0].email,
                name: student[0].name,
              },
              process.env.JWT_SECRET,
              {
                expiresIn: "30d",
              }
            );
            return res.status(200).json({
              studentDetails: {
                _id: student[0]._id,
                name: student[0].name,
                email: student[0].email,
              },
              token,
            });
          }
          return res.status(401).json({
            message: "Auth failed: Invalid password",
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

const sendEmailForMobileLogin = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Email missing from req.body",
    });
  }

  const student = await Student.find({ email })
    .then(async (student) => {
      if (student.length < 1) {
        return res.status(401).json({
          message: "Auth failed: Email not found",
        });
      }

      if (!student[0].isEmailVerified) {
        return res.status(403).json({
          message: "Email not verified",
        });
      }

      mobileOTP = Math.floor(100000 + Math.random() * 900000);
      mobileOTPExpires = new Date().getTime() + 20 * 60 * 1000;

      student[0].mobileOTP = mobileOTP;
      student[0].mobileOTPExpires = mobileOTPExpires;

      console.log(student[0]);
      await student[0].save().then(async () => {
        await sendSesMobileOtp(email, mobileOTP);

        res.status(200).json({
          message: "Email OTP for Mobile Login Sent",
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

const verifyMobileOTP = async (req, res) => {
  const { email, mobileOTP } = req.body;
  const now = Date.now();

  if (!email || !mobileOTP) {
    return res.status(400).json({
      message: "1 or more parameter(s) missing from req.body",
    });
  }

  await Student.findOne({ email })
    .then(async (student) => {
      if (student) {
        if (student.mobileOTP == mobileOTP) {
          if (student.mobileOTPExpires > now) {
            const token = jwt.sign(
              {
                userId: student._id,
                userType: student.userType,
                email: student.email,
                name: student.name,
              },
              process.env.JWT_SECRET,
              {
                expiresIn: "30d",
              }
            );
            return res.status(200).json({
              studentDetails: {
                _id: student._id,
                name: student.name,
                email: student.email,
              },
              token,
            });
          } else {
            return res.status(401).json({
              message: "Verification code expired",
            });
          }
        } else {
          return res.status(403).json({
            message: "Invalid verification code",
          });
        }
      } else {
        return res.status(404).json({
          message: "Invalid email",
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
};

// @desc Forgot password - Send OTP
// @route POST /api/student/forgotPassword/sendEmail
const sendForgotPasswordEmail = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "1 or more parameter(s) missing from req.body",
    });
  }

  await Student.findOne({ email })
    .then(async (student) => {
      if (!student) {
        return res.status(404).json({
          message: "Invalid Email",
        });
      }

      student.forgotPasswordCode = Math.floor(100000 + Math.random() * 900000);
      student.forgotPasswordCodeExpires = new Date().getTime() + 20 * 60 * 1000;

      await student
        .save()
        .then(async () => {
          const emailSent = sendSesForgotPassword(
            email,
            student.forgotPasswordCode
          );
          // let transporter = nodemailer.createTransport({
          //   service: "gmail",
          //   port: 465,

          //   auth: {
          //     user: process.env.NODEMAILER_EMAIL,
          //     pass: process.env.NODEMAILER_PASSWORD,
          //   },
          // });

          // let mailOptions = {
          //   subject: `Common Entry Test - Forgot Password`,
          //   to: email,
          //   from: `CodeChef-VIT <${process.env.NODEMAILER_EMAIL}>`,
          //   html: sendForgotPasswordMail(student.forgotPasswordCode),
          // };

          // transporter.sendMail(mailOptions, (error, response) => {
          //   if (error) {
          //     errorLogger.info(
          //       `System: ${req.ip} | ${req.method} | ${req.originalUrl
          //       } >> ${error.toString()} >> "Email not sent: ${mailOptions.to}`
          //     );
          //     return res.status(500).json({
          //       message: "Something went wrong",
          //       // error: error.toString(),
          //     });
          //   } else {
          //     res.status(200).json({
          //       message: "Forgot password email sent",
          //     });
          //   }
          // });
          // const msg = {
          //   to: email,
          //   from: {
          //     email: process.env.SENDGRID_EMAIL,
          //     name: "CodeChef-VIT",
          //   },
          //   subject: `Common Entry Test - Forgot Password`,
          //   text: `Use the following code to reset your password: ${student.forgotPasswordCode}`,
          //   // html: EmailTemplates.tracker(
          //   //   users[i].name,
          //   //   companyArr[k].companyName,
          //   //   status
          //   // ),
          // };
          // await sgMail
          //   .send(msg)
          //   .then(async () => {
          res.status(200).json({
            message: "Forgot password code sent",
          });
          //   })
          //   .catch((err) => {
          //     res.status(500).json({
          //       message: "Something went wrong",
          //       error: err.toString(),
          //     });
          //   });
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

// @desc Forgot password - Verify OTP
// @route POST /api/student/forgotPassword/verifyOTP
const resetPassword = async (req, res) => {
  const { email, forgotPasswordCode, newPassword } = req.body;

  if (!email || !forgotPasswordCode || !newPassword) {
    return res.status(400).json({
      message: "1 or more parameter(s) missing from req.body",
    });
  }

  const now = Date.now();

  await Student.findOne({ email })
    .then(async (student) => {
      if (student) {
        if (student.forgotPasswordCode == forgotPasswordCode) {
          if (student.forgotPasswordCodeExpires > now) {
            await bcrypt
              .hash(newPassword, 10)
              .then(async (hash) => {
                await Student.updateOne(
                  { _id: student._id },
                  { password: hash }
                )
                  .then(async () => {
                    res.status(200).json({
                      message: "Password reset successfully",
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
          } else {
            return res.status(401).json({
              message: "Verification code expired",
            });
          }
        } else {
          return res.status(403).json({
            message: "Invalid verification code",
          });
        }
      } else {
        return res.status(404).json({
          message: "Invalid email",
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
};

// @desc Update student's profile
// @route PATCH /api/student/profile
const updateProfile = async (req, res, next) => {
  const { name, registrationNumber, bio, branch, mobileNumber } = req.body;
  const studentId = req.user.userId;

  await Student.updateOne(
    { _id: studentId },
    { $set: { name, registrationNumber, bio, branch, mobileNumber } }
  )
    .then(async () => {
      res.status(200).json({
        message: "Updated",
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

// @desc Get student's profile
// @route GET /api/student/profile
const getProfile = async (req, res, next) => {
  const studentId = req.user.userId;

  await Student.findById(studentId)
    .select("name email mobileNumber registrationNumber bio branch")
    .then(async (student) => {
      res.status(200).json({
        student,
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

// @desc Get student's profile details --for everyone
// @route GET /api/student/details
const getStudentDetails = async (req, res, next) => {
  const { studentId } = req.query;

  if (!studentId) {
    return res.status(400).json({
      message: "1 or more parameter(s) missing from req.query",
    });
  }

  await Student.findById(studentId)
    .select("name email mobileNumber registrationNumber bio branch")
    .then(async (student) => {
      res.status(200).json({
        student,
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

// @desc Get student's dashboard
// @route GET /api/student/dashboard
const dashboard = async (req, res, next) => {
  const studentId = req.user.userId;

  await Student.findById(studentId)
    .select(
      "-password -isEmailVerified -isMobileVerified -emailVerificationCode -emailVerificationCodeExpires -__v"
    )
    .populate({
      path: "tests",
      populate: {
        path: "testId clubId domains",
        select:
          "roundNumber roundType instructions scheduledForDate scheduledEndDate graded bio email name type clubAvatar clubBanner clubImages socialMediaLink redirectURL",
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

const getRegisteredTimeline = async (req, res, next) => {
  const studentId = req.user.userId;
  try {
    const student = await Student.findById(studentId);
    let appliedClubs = student.clubs;
    if (appliedClubs.length == 0) {
      return res.status(400).send({
        message: "Not Registered for any clubs",
      });
    }
    let timeline = [];
    appliedClubs.forEach(async (club) => {
      console.log(club);
      let clubId = club.clubId;
      let appliedClub = await Club.findById(clubId);
      const clubName = appliedClub.name;
      await Test.find({ clubId, published: true }).then(async (tests) => {
        timeline.push({ clubName: clubName, tests: tests });
      });
    });
    return res.status(200).send(timeline);
  } catch (err) {
    errorLogger.info(
      `System: ${req.ip} | ${req.method} | ${
        req.originalUrl
      } >> ${err.toString()}`
    );
    res.status(500).json({
      message: "Something went wrong",
      // error: err.toString(),
    });
  }
};

function* entries(obj) {
  for (let key of Object.keys(obj)) {
    yield [key, obj[key]];
  }
}

const getTimeline = async (req, res, next) => {
  const studentId = req.user.userId;
  try {
    let timeline = [];

    let clubs = await Club.find({
      featured: true,
    });

    let megaResult = clubs.filter((club) => club.typeOfPartner == "Mega");
    let nanoResult = clubs.filter((club) => club.typeOfPartner == "Nano");
    let microResult = clubs.filter((club) => club.typeOfPartner == "Micro");
    let gigaResult = clubs.filter((club) => club.typeOfPartner == "Giga");

    let typeSortedClubs = gigaResult.concat(
      megaResult,
      microResult,
      nanoResult
    );

    //creating a map of date and tests on that date
    var dateTestMap = {};   

    for (let i = 0; i < typeSortedClubs.length; i++) {
      let clubId = typeSortedClubs[i]._id;
      console.log(clubId);
       const clubName = typeSortedClubs[i].name;
      await Test.find({ clubId, published: true }).then(async (tests) => {
        // iterating all tests and getting their start date
        tests.forEach((test) => {

          var startDate = test.scheduledForDate;
          // checking if current test date already present in map or not

          // adding club name in test object
          const testObj = test.toObject()
          testObj.clubName = clubName
          if (startDate in dateTestMap) {
            dateTestMap[startDate].push(testObj);
          } else {
            // if not present then initialize 
            dateTestMap[startDate] = [testObj];
          }
        });
      
        //  timeline.push({ clubName: clubName, tests: tests });
      });
    }

    // now mapping keys(currenty dates) with values(tests) 
    for (let [key, value] of entries(dateTestMap)) {
      timeline.push({ date: key, tests: value });
    }

    return res.status(200).send(timeline);
  } catch (err) {
    errorLogger.info(
      `System: ${req.ip} | ${req.method} | ${
        req.originalUrl
      } >> ${err.toString()}`
    );
    res.status(500).json({
      message: "Something went wrong",
      // error: err.toString(),
    });
  }
};

const applyClub = async (req, res, next) => {
  const studentId = req.user.userId;
  const { clubId } = req.body;
  const appliedOn = Date.now();
  let flag = 0;

  try {
    let student = await Student.findById(studentId);
    let appliedClubs = student.clubs;
    appliedClubs.forEach((club) => {
      let id = club.clubId;
      if (id == clubId) {
        flag = 1;
      }
    });
    if (flag == 0) {
      student.clubs.push({ clubId, appliedOn });
      await student.save();
      res.status(200).send({ message: "Club Applied" });
    } else {
      res.status(400).send({ message: "Club Already Applied" });
    }
  } catch (err) {
    errorLogger.info(
      `System: ${req.ip} | ${req.method} | ${
        req.originalUrl
      } >> ${err.toString()}`
    );
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

const getAppliedClubs = async (req, res, next) => {
  const studentId = req.user.userId;
  let detailedClubs = [];
  try {
    await Student.findById(studentId).then(async (student) => {
      let appliedClubs = student.clubs;
      appliedClubs.forEach(async (club) => {
        let appliedClub = await Club.findById(club.clubId);
        detailedClubs.push(appliedClub);
        return res.status(200).send(detailedClubs);
      });
    });
  } catch (err) {
    errorLogger.info(
      `System: ${req.ip} | ${req.method} | ${
        req.originalUrl
      } >> ${err.toString()}`
    );
    res.status(500).json({
      message: "Something went wrong",
      // error: err.toString(),
    });
  }
};

const sendSesOtp = (mailto, code) => {
  const SES_CONFIG = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "ap-south-1",
  };

  const AWS_SES = new AWS.SES(SES_CONFIG);
  let params = {
    Source: "contact@codechefvit.com",
    Destination: {
      ToAddresses: [mailto],
    },
    ReplyToAddresses: [],
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: sendVerificationOTP(code),
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: `Hello,!`,
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
};

const sendSesMobileOtp = (mailto, code) => {
  const SES_CONFIG = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "ap-south-1",
  };

  const AWS_SES = new AWS.SES(SES_CONFIG);
  let params = {
    Source: "contact@codechefvit.com",
    Destination: {
      ToAddresses: [mailto],
    },
    ReplyToAddresses: [],
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: sendMobileOTP(code),
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: `Hello!`,
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
};

const sendSesForgotPassword = (mailto, code) => {
  const SES_CONFIG = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "ap-south-1",
  };

  const AWS_SES = new AWS.SES(SES_CONFIG);
  let params = {
    Source: "contact@codechefvit.com",
    Destination: {
      ToAddresses: [mailto],
    },
    ReplyToAddresses: [],
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: sendForgotPasswordMail(code),
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: `C`,
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
};

module.exports = {
  signup,
  resendOTP,
  verifyEmail,
  login,
  sendForgotPasswordEmail,
  resetPassword,
  updateProfile,
  getProfile,
  getStudentDetails,
  dashboard,
  applyClub,
  getAppliedClubs,
  sendEmailForMobileLogin,
  verifyMobileOTP,
  getRegisteredTimeline,
  getTimeline,
};
