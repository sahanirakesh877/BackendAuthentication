const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
  googleId: {
    type: String,
  },
  displayName: {
    type: String,
  },
  email: {
    type: String,
  },
  image: {
    type: String,
  },
});

const googleSchema = mongoose.model("googleLogin", usersSchema);
module.exports = googleSchema;
