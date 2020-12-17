const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require("multer");

require("dotenv").config();

const Club = require("../models/club.model");
const Student = require("../models/student.model");
const Test = require("../models/test.model");
const Question = require("../models/question.model");
const Domain = require("../models/testDomain.model");
const EasterEggForm = require("../models/easterEggForm.model");

// @desc Generate an OTP
// @route GET /api/easterEgg/gererateOTP
const generateOTP = async (req, res, next) => {
  let digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < 6; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  res.status(200).json({
    otp: OTP,
  });
};

// @desc Form for easter egg
// @route POST /api/easterEgg/form
const form = async (req, res, next) => {
  const { name, registrationNumber, email, phoneNumber, otp } = req.body;

  if (!name || !registrationNumber || !email || !phoneNumber || !otp) {
    return res.status(400).json({
      message: "1 or more parameter(s) missing from req.body",
    });
  }

  const existingStudent = await EasterEggForm.findOne({ email });

  if (existingStudent) {
    return res.status(409).json({
      message: "Student exists",
    });
  }
  const student = new EasterEggForm({
    _id: new mongoose.Types.ObjectId(),
    email,
    registrationNumber,
    phoneNumber,
    name,
    otp,
  });

  await student
    .save()
    .then((result) => {
      return res.status(201).json({
        message: "Easter egg form successfully submitted",
      });
    })
    .catch((err) => {
      return res.status(500).json({
        message: "Something went wrong",
        error: err.toString(),
      });
    });
};

module.exports = { generateOTP, form };
