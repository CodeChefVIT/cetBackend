const mongoose = require("mongoose");

const clubSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  userType: { type: String, default: "Club" },

  accountCreated: { type: Boolean },
  name: { type: String },
  type: { type: String },
  email: { type: String },
  mobileNumber: { type: Number },
  inviteCode: { type: String },
  password: { type: String },
  bio: { type: String },
  website: { type: String },

  emailVerificationCode: { type: Number },
  emailVerificationCodeExpires: { type: Number },
  isEmailVerified: { type: Boolean, default: false },

  mobileVerificationCode: { type: Number },
  mobileVerificationCodeExpires: { type: Number },
  isMobileVerified: { type: Boolean, default: false },

  featured: { type: Boolean, default: false },
});

module.exports = mongoose.model("Club", clubSchema);
