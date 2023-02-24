const mongoose = require("mongoose");

const authRegisterSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: [true, "Name is required"],
    unique: true,
  },
  userEmail: {
    type: String,
    required: [true, "Quantity is required"],
  },
  password: {
    type: String,
    required: [true, "Total is required"],
  },
  role: {
    type: String,
    required: [true, "Role is required"],
  },
});

module.exports = mongoose.model("users", authRegisterSchema);
