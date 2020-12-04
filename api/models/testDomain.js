const mongoose = require("mongoose");

const testDomainSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test" },
  clubId: { type: mongoose.Schema.Types.ObjectId, ref: "Club" },

  domainName: { type: String },
  domainDescription: { type: String },
  domainInstructions: { type: String },
  domainDuration: { type: Number },
  domainMarks: { type: Number },

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

module.exports = mongoose.model("Domain", testDomainSchema);
