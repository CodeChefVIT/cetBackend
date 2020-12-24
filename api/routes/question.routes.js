const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const questionControllers = require("../controllers/question.controllers");

const recaptcha = require("../middleware/recaptcha");

const checkAuth = require("../middleware/checkAuth");
const checkAuthClub = require("../middleware/checkAuthClub");
const checkAuthStudent = require("../middleware/checkAuthStudent");

const { uploadQuestionMedia } = require("../middleware/s3UploadClient");

const router = express.Router();

//Add a question to a test
router.post(
  "/add",
  checkAuthClub,
  recaptcha, 
  uploadQuestionMedia.single("media"),
  questionControllers.addQuestion
);

//Add multiple questions to a test
router.post(
  "/addMultiple",
  checkAuthClub,
  recaptcha, 
  questionControllers.addMultipleQuestions
);

//Get all questions of a test -- to be viewed only by club
router.get("/all", checkAuthClub, questionControllers.getAllQuestions);

//Add marks
router.post("/marks", checkAuthClub, recaptcha,  questionControllers.updateMarks);

//Delete a question
router.delete("/delete", checkAuthClub, recaptcha, questionControllers.deleteQuestion);
const Question = require("../models/question.model");

// router.patch("/changes", async (req, res) => {
//   await Question.find()
//     .then(async (questions) => {
//       for (question of questions) {
//         // console.log(question);
//         await Question.updateOne(
//           { _id: question._id },
//           { $set: { mediaURL: question.media.url } }
//         )
//           .then(async () => {})
//           .catch();
//       }
//       res.status(200).json({ message: "Done" });
//     })
//     .catch();
// });

module.exports = router;
