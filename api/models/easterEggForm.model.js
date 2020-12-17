const mongoose = require("mongoose");

const easterEggFormSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String },
  email: { type: String },
  registrationNumber: { type: String },
  phoneNumber: { type: Number },
  otp: { type: Number },
  __v: false,
});

module.exports = mongoose.model("EasterEggForm", easterEggFormSchema);
