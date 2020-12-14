const mongoose = require("mongoose");

const studentSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  userType: { type: String, default: "Student" },

  name: { type: String },
  registrationNumber: { type: String },
  email: { type: String },
  mobileNumber: { type: Number },
  password: { type: String },

  bio: { type: String },
  branch: { type: String },

  emailVerificationCode: { type: Number },
  emailVerificationCodeExpires: { type: Number },
  isEmailVerified: { type: Boolean, default: false },

  mobileVerificationCode: { type: Number },
  mobileVerificationCodeExpires: { type: Number },
  isMobileVerified: { type: Boolean, default: false },

  forgotPasswordCode: { type: Number },
  forgotPasswordCodeExpires: { type: Number },

  tests: [
    {
      testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test" },
      clubId: { type: mongoose.Schema.Types.ObjectId, ref: "Club" },
      // domains: [
      //   {
      //     domainId: { type: mongoose.Schema.Types.ObjectId, ref: "Domain" },
      //     domainStartedOn: { type: Number },
      //     domainSubmittedOn: { type: Number },
      //     domainTimeTaken: { type: Number },
      //   },
      // ],
      status: { type: String },
      appliedOn: { type: Number },
      startedOn: { type: Number },
      submittedOn: { type: Number },
      timeTaken: { type: Number },
      corrected: { type: Boolean },
    },
  ],
});

module.exports = mongoose.model("Student", studentSchema);