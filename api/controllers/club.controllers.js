const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require("multer");
const sgMail = require("@sendgrid/mail");
const nodemailer = require("nodemailer");
const AWS = require("aws-sdk");

require("dotenv").config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const { errorLogger } = require("../utils/logger");

const Club = require("../models/club.model");

const {
  sendVerificationOTP,
  sendWelcomeMail,
} = require("../utils/emailTemplates");

// @desc Create Clubs for DEVS
// @route POST /api/club/create
const create = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      message: "1 or more parameter(s) missing from req.body",
    });
  }
  await Club.find({
    email,
  })
    .then(async (clubs) => {
      if (clubs.length >= 1) {
        return res.status(402).json({
          message: "Email already exists",
          club: clubs[0],
        });
      } else {
        const club = new Club({
          _id: new mongoose.Types.ObjectId(),
          email,
        });
        await club
          .save()
          .then((result) => {
            console.log(result);
            return res.status(201).json({
              message: "Club successfully created",
              result,
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

// @desc Send welcome emails
// @route POST /api/club/sendWelcomeEmail
const sendWelcomeEmail = async (req, res) => {
  if (process.env.NODE_ENV == "development") {
    const { email } = req.body;
    let transporter = nodemailer.createTransport({
      service: "gmail",
      port: 465,

      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });

    let mailOptions = {
      subject: `Common Entry Test - Email Whitelisted`,
      to: email,
      from: `CodeChef-VIT <${process.env.NODEMAILER_EMAIL}>`,
      html: sendWelcomeMail(),
    };

    transporter.sendMail(mailOptions, (error, response) => {
      if (error) {
        console.log("Email not sent: ", mailOptions.to);
        console.log(error.toString());

        return res.status(500).json({
          message: "Something went wrong",
          error: error.toString(),
        });
      } else {
        console.log("Email sent: ", mailOptions.to);
        res.status(200).json({
          message: "Email sent",
        });
      }
    });
  } else {
    return res.status(401).json({
      message: "Cannot perform this action",
    });
  }
};

// @desc Signup for clubs
// @route POST /api/club/signup
const signup = async (req, res) => {
  const { name, email, password, type, username } = req.body;

  if (!name || !email || !password || !type || !username) {
    return res.status(400).json({
      message: "1 or more parameter(s) missing from req.body",
    });
  }

  await Club.find({ email })
    .then(async (clubs) => {
      if (clubs.length < 1) {
        return res.status(401).json({
          message: "Email not in database",
        });
      }

      await bcrypt
        .hash(password, 10)
        .then(async (hash) => {
          await Club.findOneAndUpdate(
            {
              _id: clubs[0]._id,
            },
            {
              $set: {
                name,
                password: hash,
                type,
                username,
              },
            }
          )
            .then(async (club) => {
              club.emailVerificationCode = Math.floor(
                100000 + Math.random() * 900000
              );
              club.emailVerificationCodeExpires =
                new Date().getTime() + 20 * 60 * 1000;
              const emailSent = sendSesOtp(email, club.emailVerificationCode);
              // let transporter = nodemailer.createTransport({
              //   service: "gmail",

              //   host: 'smtp.gmail.com',
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
              //   html: sendVerificationOTP(club.emailVerificationCode),
              // };

              // const msg = {
              //   to: email,
              // from: {
              // email: process.env.SENDGRID_EMAIL,
              // name: "CodeChef-VIT",
              // },
              //   subject: `Common Entry Test - Email Verification`,
              //   text: `Use the following code to verify your email: ${club.emailVerificationCode}`,
              //   // html: EmailTemplates.tracker(
              //   //   users[i].name,
              //   //   companyArr[k].companyName,
              //   //   status
              //   // ),
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

              // await sgMail
              //   .send(msg)
              //   .then(async () => {

              await club
                .save()
                .then(async (result) => {
                  res.status(201).json({
                    message: "Signup successful",
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

// @desc Resend email verification OTP for club
// @route POST /api/club/email/resendOTP
const resendOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "1 or more parameter(s) missing from req.body",
    });
  }

  await Club.findOne({
    email,
  })
    .then(async (club) => {
      if (!club) {
        return res.status(404).json({
          message: "Invalid Email",
        });
      }

      club.emailVerificationCode = Math.floor(100000 + Math.random() * 900000);
      club.emailVerificationCodeExpires = new Date().getTime() + 20 * 60 * 1000;

      await club
        .save()
        .then(async () => {
          const emailSent = sendSesOtp(email, club.emailVerificationCode);
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
          //   html: sendVerificationOTP(club.emailVerificationCode),
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
          //     res.status(201).json({
          //       message: "Email verification OTP Sent",
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
          //   text: `Use the following code to verify your email: ${club.emailVerificationCode}`,
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
            message: "Email verification OTP Sent",
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
        error: err.toString(),
      });
    });
};

// @desc Email verfication for clubs
// @route POST /api/club/email/verify
const verifyEmail = async (req, res) => {
  const { email, emailVerificationCode } = req.body;
  const now = Date.now();

  if (!email || !emailVerificationCode) {
    return res.status(400).json({
      message: "1 or more parameter(s) missing from req.body",
    });
  }

  await Club.findOne({
    email,
  })
    .then(async (club) => {
      if (club) {
        if (club.emailVerificationCode == emailVerificationCode) {
          if (club.emailVerificationCodeExpires > now) {
            await Club.updateOne(
              {
                _id: club._id,
              },
              {
                isEmailVerified: true,
              }
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

// @desc Login for clubs
// @route POST /api/club/login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "1 or more parameter(s) missing from req.body",
    });
  }

  await Club.find({
    email,
  })
    .then(async (club) => {
      if (club.length < 1) {
        return res.status(401).json({
          message: "Auth failed: Email not found",
        });
      }

      if (!club[0].isEmailVerified) {
        return res.status(403).json({
          message: "Email not verified",
        });
      }

      await bcrypt
        .compare(password, club[0].password)
        .then((result) => {
          if (result) {
            const token = jwt.sign(
              {
                userType: "Club",
                userId: club[0]._id,
                email: club[0].email,
                name: club[0].name,
                username: club[0].username,
              },
              process.env.JWT_SECRET,
              {
                expiresIn: "30d",
              }
            );
            return res.status(200).json({
              clubDetails: {
                _id: club[0]._id,
                userType: club[0].userType,
                name: club[0].name,
                email: club[0].email,
                username: club[0].username,
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

// @desc Update club's profile
// @route PATCH /api/club/profile
const updateProfile = async (req, res, next) => {
  const {
    name,
    type,
    bio,
    website,
    socialMediaLinks,
    mobileNumber,
    username,
    redirectURL,
  } = req.body;
  const clubId = req.user.userId;

  await Club.updateOne(
    {
      _id: clubId,
    },
    {
      $set: {
        name,
        type,
        bio,
        website,
        socialMediaLinks,
        mobileNumber,
        username,
        redirectURL,
      },
    }
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

// @desc Get club's profile -- Only for club admin
// @route GET /api/club/profile
const getSelfProfile = async (req, res, next) => {
  const clubId = req.user.userId;

  await Club.findById(clubId)
    .select(
      "name email type bio featured website username clubAvatar clubBanner clubImages socialMediaLinks mobileNumber typeOfPartner redirectURL"
    )
    .then(async (club) => {
      res.status(200).json({
        club,
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

// @desc Get club's details
// @route GET /api/club/details
const getClubDetails = async (req, res, next) => {
  const { clubId } = req.query;

  if (!clubId) {
    return res.status(400).json({
      message: "1 or more parameter(s) missing from req.body",
    });
  }

  await Club.findById(clubId)
    .select(
      "name email type bio featured website username clubAvatar clubBanner clubImages socialMediaLinks mobileNumber typeOfPartner redirectURL"
    )
    .then(async (club) => {
      res.status(200).json({
        club,
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

// @desc Get club's details via username
// @route GET /api/club/details/username
const getClubDetailsUsername = async (req, res, next) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({
      message: "1 or more parameter(s) missing from req.query",
    });
  }

  await Club.findOne({ username })
    .select(
      "name email type bio featured website username clubAvatar clubBanner clubImages socialMediaLinks mobileNumber typeOfPartner redirectURL"
    )
    .then(async (club) => {
      res.status(200).json({
        club,
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

// @desc Feature or unfeature a club for recruitments
// @route PATCH /api/club/feature
const feature = async (req, res, next) => {
  const { featured } = req.body;
  const clubId = req.user.userId;

  await Club.updateOne(
    {
      _id: clubId,
    },
    {
      $set: {
        featured,
      },
    }
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

// @desc Get all featured clubs
// @route GET /api/club/allFeatured
const getAllFeaturedClubs = async (req, res) => {
  await Club.find({
    featured: true,
  })
    .select(
      "name email type bio featured website username clubAvatar clubBanner clubImages socialMediaLinks mobileNumber typeOfPartner redirectURL"
    )
    .then(async (clubs) => {
      res.status(200).json({
        clubs,
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

//
const uploadProfilePicture = async (req, res, next) => {
  const clubId = req.user.userId;
  const clubAvatar = req.file.location;

  await Club.updateOne(
    {
      _id: clubId,
    },
    {
      $set: {
        clubAvatar,
      },
    }
  )
    .then(async (result) => {
      res.status(201).json({
        message: "Posted profile image",
        avatarURL: clubAvatar,
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

const uploadBanner = async (req, res, next) => {
  const clubId = req.user.userId;
  const clubBanner = req.file.location;

  await Club.updateOne(
    {
      _id: clubId,
    },
    {
      $set: {
        clubBanner,
      },
    }
  )
    .then(async (result) => {
      res.status(201).json({
        message: "Posted profile image",
        bannerURL: clubBanner,
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

const uploadImages = async (req, res, next) => {
  const clubId = req.user.userId;
  const clubBanner = req.file.location;

  await Club.updateOne(
    {
      _id: clubId,
    },
    {
      $push: {
        clubBanner,
      },
    }
  )
    .then(async (result) => {
      res.status(201).json({
        message: "Posted profile image",
        bannerURL: clubBanner,
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
        Data: `Common Entry Test - Email Verification`,
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
  create,
  sendWelcomeEmail,
  signup,
  resendOTP,
  verifyEmail,
  login,
  updateProfile,
  getSelfProfile,
  getClubDetails,
  getClubDetailsUsername,
  feature,
  getAllFeaturedClubs,
  uploadProfilePicture,
  uploadBanner,
  uploadImages,
};
