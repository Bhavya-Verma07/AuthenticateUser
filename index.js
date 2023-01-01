const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();
app.use(cors());
const CONTENT_MODEL = require("./model/contactschema");
const otpservice = require("./controller/otpservice");
// const userapis = require("./controller/users");
const connectdb = require("./connectors/dbConnection");
const path = require("path");
app.use(express.json()); //to enable accepting body from frontend

app.use("/api/otp", otpservice);
// app.use("/api/user", userapis);

app.post("/api/savedata", async (req, res) => {
  try {
    const { nameis, phonenumber, address, emailId } = req.body;
    const checkuser = await CONTENT_MODEL.findOne({ phonenumber });
    if (checkuser) {
      return res.json({
        success: false,
        error: "User already exist with this phone number",
      });
    }
    const newContent = new CONTENT_MODEL({
      nameis,
      phonenumber,
      address,
      emailId,
    });
    await newContent.save();
    return res.json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ success: false });
  }
});

app.get("/api/gettingotpdata", async (req, res) => {
  try {
    const otpdata = await CONTENT_MODEL.find({}).sort({
      createdAt: -1,
    });
    return res.json({ data: otpdata, success: true });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, error: error.message });
  }
});

app.delete("/api/deleteData/:id", async (req, res) => {
  try {
    // const deleteData = await CONTENT_MODEL.findOneAndDelete({});
    // const deleteData = req.params.id;
    const deleteData = await CONTENT_MODEL.findByIdAndDelete( req.params.id);
    return res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
    // res.status(500).send(error);
  }
});

const port = process.env.PORT || 5000; // process.env.PORT gives the port of hosted application, which is automatically defined by deployment platform

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
  app.get("*", (req, res) => {
    res.sendFile(
      path.resolve(__dirname + "/client/build/index.html"),
      function (err) {
        if (err) {
          console.log(err);
        }
      }
    );
  });
}

connectdb().then(() => {
  app.listen(port, () => console.log(`server is running at ${port}`));
});
