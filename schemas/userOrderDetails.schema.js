const mongoose = require("mongoose");

const orders = {
  orderId: String,
  itemName: String,
  itemImage: String,
  quantity: Number,
  step: String,
  stepCount: Number,
};

const userOrdersSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: [true, "Name is required"],
  },
  userEmail: {
    type: String,
    required: [true, "Quantity is required"],
  },
  orders: [orders],
});

module.exports = mongoose.model("UserOrders", userOrdersSchema);
