const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const Club = require("../models/club");

const checkAuthClub = require("../middleware/checkAuthClub");

const router = express.Router();

//Club signup
router.post("/signup", async (req, res) => {
  const { name, email, password, type } = req.body;

  if (!name || !email || !password || !type) {
    return res.status(400).json({
      message: "1 or more parameter(s) missing from req.body",
    });
  }

  await Club.find({ email })
    .then(async (clubs) => {
      if (clubs.length < 1) {
        return res.status(403).json({
          message: "Email not in database",
        });
      }

      await bcrypt
        .hash(password, 10)
        .then(async (hash) => {
          await Club.updateOne(
            { _id: clubs[0]._id },
            { $set: { name, password: hash, type } }
          )
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

//Club login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "1 or more parameter(s) missing from req.body",
    });
  }

  await Club.find({ email })
    .then(async (club) => {
      if (club.length < 1) {
        return res.status(401).json({
          message: "Auth failed: Email not found",
        });
      }
      await bcrypt
        .compare(password, club[0].password)
        .then((result) => {
          if (result) {
            const token = jwt.sign(
              {
                userId: club[0]._id,
                email: club[0].email,
                name: club[0].name,
              },
              process.env.JWT_SECRET,
              {
                expiresIn: "30d",
              }
            );
            return res.status(200).json({
              clubDetails: {
                _id: user[0]._id,
                name: user[0].name,
                email: user[0].email,
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

//Update club profile
router.patch("/profile", checkAuthClub, async (req, res, next) => {
  const { name, type } = req.body;
  const clubId = req.user.userId;

  await Club.updateOne({ _id: clubId }, { $set: { name, type } })
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

//Feature or unfeature a club for recruitments
router.patch("/feature", checkAuthClub, async (req, res, next) => {
  const { featured } = req.body;
  const clubId = req.user.userId;

  await Club.updateOne({ _id: clubId }, { $set: { featured } })
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

//Get all featured clubs
router.get("/allFeatured", async (req, res) => {
  await Club.find({ featured })
    .then(async (clubs) => {
      res.status(200).json({
        clubs,
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
