const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const Club = require("../models/club");
const Student = require("../models/student");

const checkAuth = require("../middleware/checkAuth");
const checkAuthClub = require("../middleware/checkAuthClub");
const checkAuthStudent = require("../middleware/checkAuthStudent");

const router = express.Router();

//Student signup
router.post("/signup", async (req, res) => {
  const { name, email, password, mobileNumber } = req.body;

  if (!name || !email || !password || !mobileNumber) {
    return res.status(400).json({
      message: "1 or more parameter(s) missing from req.body",
    });
  }

  await Student.find({ email })
    .then(async (clubs) => {
      if (clubs.length >= 1) {
        return res.status(409).json({
          message: "Email already registered",
        });
      }

      await bcrypt
        .hash(password, 10)
        .then(async (hash) => {
          const student = new Student({
            _id: new mongoose.Types.ObjectId(),
            name,
            email,
            password: hash,
            mobileNumber,
          });

          await Student.save()
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
});

//Student login
router.post("/login", async (req, res) => {
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
});

//Update student's profile
router.patch("/profile", checkAuthStudent, async (req, res, next) => {
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
});

//Get a student's profile
router.get("/profile", checkAuthStudent, async (req, res, next) => {
  const studentId = req.user.userId;

  await Student.findById(studentId)
    .select("-password")
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
});

module.exports = router;
