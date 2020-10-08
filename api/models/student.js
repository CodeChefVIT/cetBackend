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

  tests: [
    {
      testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test" },
      clubId: { type: mongoose.Schema.Types.ObjectId, ref: "Club" },
      responses: [],
      timeTaken: { type: Number },
      corrected: { type: Boolean },
      marks: { type: Number },
      appliedOn: { type: Number },
      startedOn: { type: Number },
      submittedOn: { type: Number },
    },
  ],
});

module.exports = mongoose.model("Student", studentSchema);
