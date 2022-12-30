const mongoose = require("mongoose");

const contentSchema= mongoose.Schema({
nameis:String,
phonenumber: String,
emailId:String,
address: String
},
{timestamps:true});

const contentmodel = mongoose.model("otpappdetail",contentSchema);
module.exports= contentmodel;