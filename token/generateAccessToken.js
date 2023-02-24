const jwt = require("jsonwebtoken");

const generateAccessToken = (email, role) => {
  const token = jwt.sign(
    { email: email, role: role },
    process.env.ACCESS_TOKEN_SECRET
  );
  return token;
};
module.exports = generateAccessToken;
