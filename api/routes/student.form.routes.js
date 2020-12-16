const express = require("express");

const useragentMiddleware = require("../middleware/useragent");

const recaptcha = require("../middleware/recaptcha");

const studentFormControllers = require("../controllers/student.form.controller");

const router = express.Router();

router.post("/add", useragentMiddleware, recaptcha, studentFormControllers.addStudent);

router.get("/students", useragentMiddleware, recaptcha, studentFormControllers.getStudents);

router.put("/edit", useragentMiddleware, recaptcha, studentFormControllers.editStudent);

router.delete("/delete", useragentMiddleware, recaptcha, studentFormControllers.deleteStudent);

module.exports = router;
