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

const { errorLogger } = require("../utils/logger");

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

module.exports = {
  getAllClubs,
  getAllFeaturedClubs,
  getAllTestsOfAClub,
  getAllPublishedTestsOfAClub,
  getAllDomainsOfATest,
  getDomainByID,
};
