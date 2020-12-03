const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require("multer");

require("dotenv").config();

const Domain = require("../models/testDomain");

const addDomain = async (req, res, next) => {
  const {
    testId,
    domainName,
    domainDescription,
    domainInstructions,
  } = req.body;

  if (!testId || !domainName) {
    return res.status(400).json({
      message: "1 or more parameter(s) missing from req.body",
    });
  }

  const clubId = req.user.userId;

  const domain = new Domain({
    _id: new mongoose.Types.ObjectId(),
    testId,
    clubId,
    domainName,
    domainDescription,
    domainInstructions,
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
      res.status(500).json({
        message: "Something went wrong",
        error: err.toString(),
      });
    });
};

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
      res.status(500).json({
        message: "Something went wrong",
        error: err.toString(),
      });
    });
};

module.exports = {
  addDomain,
  getAllDomainsOfATest,
};
