const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require("multer");
const sgMail = require("@sendgrid/mail");

require("dotenv").config();

const Club = require("../models/club");
const Student = require("../models/student");
const Test = require("../models/test");
const Question = require("../models/question");

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
              const msg = {
                to: email,
                from: {
                  email: process.env.SENDGRID_EMAIL,
                  name: "CodeChef-VIT",
                },
                subject: `Common Entry Test - Email Verification`,
                text: `Use the following code to verify your email: ${emailVerificationCode}`,
                // html: EmailTemplates.tracker(
                //   users[i].name,
                //   companyArr[k].companyName,
                //   status
                // ),
              };

              await sgMail
                .send(msg)
                .then(async () => {
                  res.status(201).json({
                    message: "Signup successful",
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

      student.emailVerificationCode = Math.floor(
        100000 + Math.random() * 900000
      );
      student.emailVerificationCodeExpires =
        new Date().getTime() + 20 * 60 * 1000;

      await student
        .save()
        .then(async () => {
          const msg = {
            to: email,
            from: {
              email: process.env.SENDGRID_EMAIL,
              name: "CodeChef-VIT",
            },
            subject: `Common Entry Test - Email Verification`,
            text: `Use the following code to verify your email: ${student.emailVerificationCode}`,
            // html: EmailTemplates.tracker(
            //   users[i].name,
            //   companyArr[k].companyName,
            //   status
            // ),
          };
          await sgMail
            .send(msg)
            .then(async () => {
              res.status(200).json({
                message: "Email verification OTP Sent",
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
                res.status(500).json({
                  message: "Something went wrong",
                  error: err.toString(),
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
      res.status(500).json({
        message: "Something went wrong",
        error: err.toString(),
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

      if (!student[0].isEmailVerified) {
        return res.status(403).json({
          message: "Email not verified",
        });
      }
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
          const msg = {
            to: email,
            from: {
              email: process.env.SENDGRID_EMAIL,
              name: "CodeChef-VIT",
            },
            subject: `Common Entry Test - Forgot Password`,
            text: `Use the following code to reset your password: ${student.forgotPasswordCode}`,
            // html: EmailTemplates.tracker(
            //   users[i].name,
            //   companyArr[k].companyName,
            //   status
            // ),
          };
          await sgMail
            .send(msg)
            .then(async () => {
              res.status(200).json({
                message: "Forgot password code sent",
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
      res.status(500).json({
        message: "Something went wrong",
        error: err.toString(),
      });
    });
};

// @desc Update student's profile
// @route PATCH /api/student/profile
const updateProfile = async (req, res, next) => {
  const { name, registrationNumber, bio, branch } = req.body;
  const studentId = req.user.userId;

  await Student.updateOne(
    { _id: studentId },
    { $set: { name, registrationNumber, bio, branch } }
  )
    .then(async () => {
      res.status(200).json({
        message: "Updated",
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Something went wrong",
        error: err.toString(),
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
      res.status(500).json({
        message: "Something went wrong",
        error: err.toString(),
      });
    });
};

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
      res.status(500).json({
        message: "Something went wrong",
        error: err.toString(),
      });
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
};
