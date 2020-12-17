require("dotenv").config();
const mongoose = require("mongoose");

const StudentForm = require("../models/student.form.model");

// @desc Add Student to the student form
// @route POST /api/studentForm/add
const addStudent = async (req, res, next) => {
  const { name, registrationNumber, email, phoneNumber } = req.body;
  if (!name || !registrationNumber || !email || !phoneNumber) {
    return res.status(400).json({
      message: "1 or more parameter(s) missing from req.body",
    });
  }
  const existingStudent = await StudentForm.findOne({ email });
  if (existingStudent) {
    return res.status(409).json({
      message: "Student exists",
    });
  }
  const student = new StudentForm({
    _id: new mongoose.Types.ObjectId(),
    email,
    registrationNumber,
    phoneNumber,
    name,
  });

  await student
    .save()
    .then((result) => {
      return res.status(201).json({
        message: "Student successfully created",
        result,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        message: "Something went wrong",
        error: err.toString(),
      });
    });
};

// @desc Get all the studetns that filled the form
// @route GET /api/studentForm/students
const getStudents = async (req, res, next) => {
  const students = await StudentForm.find();
  if (students) {
    return res.status(200).json({
      message: "Students successfully found",
      students,
    });
  } else {
    return res.status(500).json({
      message: "Something went wrong",
      error: err.toString(),
    });
  }
};

// @desc Edit a student form
// @route PUT /api/studentForm/edit
const editStudent = async (req, res, next) => {
  const { studentId, student } = req.body;
  await StudentForm.updateOne(
    {
      _id: studentId,
    },
    {
      student,
    }
  )
    .then((result) => {
      return res.status(200).json({
        message: "Students successfully updated",
      });
    })
    .catch((err) => {
      return res.status(500).json({
        message: "Something went wrong",
        error: err.toString(),
      });
    });
};

// @desc Delete a student
// @route DELETE /api/studentForm/delete
const deleteStudent = async (req, res, next) => {
  const { studentId } = req.body;
  await StudentForm.deleteOne({
    _id: studentId,
  })
    .then((result) => {
      return res.status(200).json({
        message: "Student successfully deleted",
      });
    })
    .catch((err) => {
      return res.status(500).json({
        message: "Something went wrong",
        error: err.toString(),
      });
    });
};

module.exports = {
  addStudent,
  getStudents,
  editStudent,
  deleteStudent,
};
