const mongoose = require("mongoose");
// console.log( process.env.TWILIO_ACCOUNT_ID);
// console.log( process.env.MONGODB_URL);
const connectdb = async ()=> {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("mongodb connected");
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectdb;
