const mongoose = require("mongoose");

const studentFormSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String },
  email: { type: String },
  registrationNumber: { type: String },
  phoneNumber: { type: Number }, 
  __v: false,
});

module.exports = mongoose.model("StudentForm", studentFormSchema);
