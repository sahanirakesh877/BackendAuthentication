const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  googleId:{
    type: String,
    required: true,
  }
});

const userSchema = mongoose.model("userprofile", usersSchema);
module.exports = userSchema;
