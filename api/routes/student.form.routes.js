const express = require("express");

const useragentMiddleware = require("../middleware/useragent");

const recaptcha = require("../middleware/recaptcha");

const studentFormControllers = require("../controllers/student.form.controller");

const router = express.Router();

router.post("/add", useragentMiddleware,  studentFormControllers.addStudent);

router.get("/students", useragentMiddleware,  studentFormControllers.getStudents);

router.put("/edit", useragentMiddleware,  studentFormControllers.editStudent);

router.delete("/delete", useragentMiddleware,  studentFormControllers.deleteStudent);

module.exports = router;
