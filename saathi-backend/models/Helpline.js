const mongoose = require("mongoose");

const helplineSchema = new mongoose.Schema({
  name: String,
  number: String,
  category: String,
  image: String,
  description: String,
});

module.exports = mongoose.model("Helpline", helplineSchema);
