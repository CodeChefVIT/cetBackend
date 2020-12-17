const express = require("express");

// const useragentMiddleware = require("../middleware/useragent");

// const recaptcha = require("../middleware/recaptcha");

const easterEggFormControllers = require("../controllers/easterEggForm.controllers");

const router = express.Router();

//Generate an OTP and save in database
router.get("/generateOTP", easterEggFormControllers.generateOTP);

//Submit easter egg form
router.post("/form", easterEggFormControllers.form);

module.exports = router;
