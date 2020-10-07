const mongoose = require("mongoose");

const testSchhema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  clubId: { type: mongoose.Schema.Types.ObjectId, ref: "Club" },

  instructions: { type: String },
  duration: { type: Number },
  maxMarks: { type: Number },
  scheduledForDate: { type: Number },
  scheduledEndDate: { type: Number },
});

module.exports = mongoose.model("Test", testSchhema);
