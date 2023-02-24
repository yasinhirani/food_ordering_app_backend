const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: [true, "order id is required"]
  },
  userName: {
    type: String,
    required: [true, "userName is required"],
  },
  userEmail: {
    type: String,
    required: [true, "email is required"],
  },
  itemName: {
    type: String,
    required: [true, "Name is required"],
  },
  itemImage: {
    type: String,
    required: [true, "Image is required"],
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
  },
  total: {
    type: Number,
    required: [true, "Total is required"],
  },
  step: {
    type: String,
    required: [true, "Current step is required"],
  },
  stepCount: {
    type: Number,
    required: [true, "Current step is required"],
  },
});

module.exports = mongoose.model("Orders", orderSchema);