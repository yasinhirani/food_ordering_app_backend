require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Orders = require("./schemas/orders.schema");
const userOrders = require("./schemas/userOrderDetails.schema");
const Auth = require("./schemas/authRegister.schema");
const generateAccessToken = require("./token/generateAccessToken");

const app = express();

const port = 8080 | process.env.PORT;
const uri = process.env.MONGODB_CONNECT_URI;

app.use(express.json());
app.use(cors());

const connectDb = async () => {
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

connectDb().then(() => {
  console.log("connected");
});

const validateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];
  if (!token) {
    return res.status(401).send({ message: "Your are unauthorized" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
    if (err) {
      return res.status(403).send({ message: err });
    }
    req.user = data;
    next();
  });
};

/**
 * Auth Apis
 */

app.post("/api/register", async (req, res) => {
  const { userName, userEmail, password } = req.body;
  const hashPassword = await bcrypt.hash(password, 10).then((hash) => hash);
  const authRegister = new Auth({
    userName: userName,
    userEmail: userEmail,
    password: hashPassword,
    role: "user",
  });
  const UserOrders = new userOrders({
    userEmail: userEmail,
    userName: userName,
    orders: [],
  });
  authRegister
    .save()
    .then(() => {
      UserOrders.save();
      res.status(201).send({
        success: true,
        message: "Registered successfully, please login to continue",
      });
    })
    .catch((err) => {
      if (err.code === 11000) {
        res.send({ success: false, message: "Email address already exists" });
      } else {
        res.send({
          success: false,
          message:
            "There was a issue while registering you, please try after some time",
        });
      }
    });
});

app.post("/api/login", async (req, res) => {
  connectDb();
  const user = Auth;
  const isAvailable = await user.find({ userEmail: req.body.userEmail });
  if (isAvailable.length > 0) {
    const match = await bcrypt.compare(
      req.body.password,
      isAvailable[0].password
    );
    if (match) {
      res.status(200).send({
        success: true,
        message: "Login successful",
        authData: {
          userEmail: isAvailable[0].userEmail,
          userName: isAvailable[0].userName,
          role: isAvailable[0].role,
          access_token: generateAccessToken(
            req.body.userEmail,
            isAvailable[0].role
          ),
        },
      });
    } else {
      res.status(200).send({ success: false, message: "Invalid Credentials" });
    }
  } else {
    res.status(200).send({ success: false, message: "User not found" });
  }
});

/**
 * Other Apis
 */

app.get("/api/getAllOrders", validateToken, async (req, res) => {
  connectDb();
  if (req.user.role === "admin") {
    const orders = Orders;
    await orders
      .find({})
      .sort("-time")
      .exec((err, data) => {
        res.send(data);
      });
  }
});

app.post("/api/addOrders", validateToken, async (req, res) => {
  connectDb();
  if (req.body.items.length > 1) {
    const addOrders = Orders;
    const addUserOrders = userOrders;
    await addOrders.insertMany(req.body.items);
    await addUserOrders.updateOne(
      { userEmail: req.user.email },
      {
        $push: {
          orders: req.body.items,
        },
      }
    );
    res.json({
      success: true,
      message: "Order Placed Successfully",
    });
  } else {
    const addOrders = new Orders(req.body.items[0]);
    const addUserOrders = userOrders;
    await addOrders.save();
    await addUserOrders.updateOne(
      { userEmail: req.user.email },
      {
        $push: {
          orders: req.body.items,
        },
      }
    );
    res.json({
      success: true,
      message: "Order Placed Successfully",
    });
  }
});

app.post("/api/updateStep", validateToken, async (req, res) => {
  if (req.user.role === "admin") {
    connectDb();
    const updateOrder = Orders;
    const updateUserOrder = userOrders;
    const updateOrderStep = await updateOrder.updateOne(
      { userEmail: req.body.userEmail, orderId: req.body.orderId },
      { step: req.body.step, stepCount: req.body.stepCount }
    );
    const updateUserOrderStep = await updateUserOrder.updateOne(
      { userEmail: req.body.userEmail, "orders.orderId": req.body.orderId },
      {
        $set: {
          "orders.$.step": req.body.step,
          "orders.$.stepCount": req.body.stepCount,
        },
      }
    );
    res.json({ admin: updateOrderStep, user: updateUserOrderStep });
  }
});

app.get("/api/getUserOrders", validateToken, async (req, res) => {
  const UserOrders = userOrders;
  const orders = await UserOrders.find({ userEmail: req.user.email });
  if (orders.length > 0) {
    res.send({ success: true, message: "", orders: orders[0].orders });
  }
});

app.listen(port);
