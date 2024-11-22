const crypto = require("crypto");

exports.calculateHash = (event) => {
  return crypto.createHash("sha256").update(JSON.stringify(event)).digest("hex");
};
