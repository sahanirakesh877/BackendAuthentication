const mongoose = require("mongoose");
require('dotenv').config();

const ConnectDB = async () => {
  try {
    await mongoose.connect(process.env.DataBase)
    console.log("Connected to MongoDB succesfully");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = ConnectDB; // If you want to export this function
