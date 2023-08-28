require("dotenv").config();
const jwt = require("jsonwebtoken");

const createJWT = (user) => {
  let token;
  token = jwt.sign(
    { userId: user._id, name: user.name, role: user.role },
    process.env.JWT_SECRET_KEY,
    { expiresIn: process.env.TOKEN_EXPIRY }
  );
  return token;
};

const verifyJWT = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET_KEY);
};

// const destroyJWT = (token) => {
//   jwt.destroy(token);
// };

module.exports = {
  createJWT,
  verifyJWT,
};
