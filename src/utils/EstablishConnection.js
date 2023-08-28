const mongoose = require("mongoose");

const establishConnection = (URI) => {
  return mongoose.connect(URI);
};

module.exports = establishConnection;
