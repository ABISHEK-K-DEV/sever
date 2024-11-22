const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  eventType: { type: String, required: true },
  timestamp: { type: Date, required: true },
  sourceAppId: { type: String, required: true },
  dataPayload: { type: Object, default: {} },
  previousHash: { type: String, default: null },
  hash: { type: String, required: true },
});

module.exports = mongoose.model("Event", eventSchema);
