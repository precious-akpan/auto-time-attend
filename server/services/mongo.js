const mongoose = require("mongoose");
require('dotenv').config();
const MONGO_URI = process.env.MONGODB;


mongoose.connection.on('open', () => {
    console.log("MongoDB connection established");
})

mongoose.connection.on('error', (err) => {
    console.log(err);
})
function mongoConnect() {
    mongoose.connect(MONGO_URI);
}

function mongoDisconnect() {
  mongoose.disconnect();
}

module.exports = {
  mongoConnect,
  mongoDisconnect,
};
