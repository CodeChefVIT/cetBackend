const mongoose = require("mongoose");

const clubSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  userType: { type: String, default: "Club" },
  inviteCode: { type: String },
  accountCreated: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },

  name: { type: String },
  type: { type: String },
  email: { type: String },
  mobileNumber: { type: Number },
  password: { type: String },

  bio: { type: String },
  website: { type: String },
  clubAvatar: { type: String },
  clubBanner: { type: String },
  clubImages: [{ imageURL: { type: String } }],
  socialMediaLinks: [
    {
      socialMediaName: { type: String },
      socialMediaURL: { type: String },
    },
  ],

  emailVerificationCode: { type: Number },
  emailVerificationCodeExpires: { type: Number },
  isEmailVerified: { type: Boolean, default: false },

  mobileVerificationCode: { type: Number },
  mobileVerificationCodeExpires: { type: Number },
  isMobileVerified: { type: Boolean, default: false },
});

module.exports = mongoose.model("Club", clubSchema);
