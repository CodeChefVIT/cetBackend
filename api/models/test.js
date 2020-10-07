const mongoose = require("mongoose");

const testSchhema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  clubId: { type: mongoose.Schema.Types.ObjectId, ref: "Club" },

  instructions: { type: String },
  duration: { type: Number },
  maxMarks: { type: Number },
  scheduledForDate: { type: Number },
  scheduledEndDate: { type: Number },

  users: [
    {
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
      marks: { type: Number, default: 0 },
      corrected: { type: Boolean },
      responses: [],
    },
  ],
  usersStarted: [
    {
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
      marks: { type: Number, default: 0 },
      corrected: { type: Boolean, default: false },
      responses: [],
    },
  ],
  usersFinished: [
    {
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
      responses: [],
      marks: { type: Number, default: 0 },
      timeTaken: { type: Number },
      corrected: { type: Boolean },
      submittedOn: { type: Number },
    },
  ],
});

module.exports = mongoose.model("Test", testSchhema);
