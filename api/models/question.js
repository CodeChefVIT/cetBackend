const mongoose = require("mongoose");

const questionSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test" },
  clubId: { type: mongoose.Schema.Types.ObjectId, ref: "Club" },
  domainId: { type: mongoose.Schema.Types.ObjectId, ref: "Domain" },

  type: { type: String },
  questionMarks: { type: Number },

  description: { type: String },
  options: [
    {
      option: {
        text: { type: String },
        isCorrect: { type: Boolean, default: false },
      },
    },
  ],
});

module.exports = mongoose.model("Question", questionSchema);
