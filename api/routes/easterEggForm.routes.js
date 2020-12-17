const express = require("express");

// const useragentMiddleware = require("../middleware/useragent");

// const recaptcha = require("../middleware/recaptcha");

const easterEggFormControllers = require("../controllers/easterEggForm.controllers");

const router = express.Router();

router.get("/generateOTP", easterEggFormControllers.generateOTP);

router.post("/form", easterEggFormControllers.form);

module.exports = router;
