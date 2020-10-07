const mongoose = require("mongoose");

const clubSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String },
  type: { type: String },
  email: { type: String },
  mobileNumber: { type: Number },
  password: { type: String },

  emailVerificationCode: { type: Number },
  emailVerificationCodeExpires: { type: Number },
  isEmailVerified: { type: Boolean, default: false },

  mobileVerificationCode: { type: Number },
  mobileVerificationCodeExpires: { type: Number },
  isMobileVerified: { type: Boolean, default: false },

  featured: { type: Boolean },
});

module.exports = mongoose.model("Club", clubSchema);
