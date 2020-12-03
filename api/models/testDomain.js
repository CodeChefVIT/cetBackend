const mongoose = require("mongoose");

const testDomainSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test" },
  clubId: { type: mongoose.Schema.Types.ObjectId, ref: "Club" },

  domainName: { type: String },
  domainDescription: { type: String },
  domainInstructions: { type: String },
});

module.exports = mongoose.model("Domain", testDomainSchema);
