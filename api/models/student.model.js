const mongoose = require("mongoose");

const studentSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  userType: { type: String, default: "Student" },

  token: { type: String },
  googleId: { type: String },

  name: { type: String },
  registrationNumber: { type: String },
  email: { type: String },
  mobileNumber: { type: Number },
  password: { type: String },

  bio: { type: String },
  branch: { type: String },
  loginCount: { type: Number, default: 0 },

  emailVerificationCode: { type: Number },
  emailVerificationCodeExpires: { type: Number },
  isEmailVerified: { type: Boolean, default: true },

  mobileOTP: { type: Number },
  mobileOTPExpires: { type: Number },
  // isMobileVerified: { type: Boolean, default: false },

  forgotPasswordCode: { type: Number },
  forgotPasswordCodeExpires: { type: Number },
  clubs:[
    {
      clubId: { type: mongoose.Schema.Types.ObjectId, ref: "Club" },
      appliedOn: { type: Number },
    }
  ],
  tests: [
    {
      testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test" },
      clubId: { type: mongoose.Schema.Types.ObjectId, ref: "Club" },
      domains: [
        {
          _id: false,
          domainId: { type: mongoose.Schema.Types.ObjectId, ref: "Domain" },
          status: { type: String },
        },
      ],
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
