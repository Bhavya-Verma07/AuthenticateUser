const router = require("express").Router();
const {phone} = require("phone");

const client = require("twilio")(
  process.env.TWILIO_ACCOUNT_ID,
  process.env.TWILIO_AUTH_TOKEN
);

// console.log( process.env.TWILIO_ACCOUNT_ID);

router.get("/hello", async (req, res) => {
  try {
    return res.json({ message: "hello from otp router" });
  } catch (error) {
    return res.json(400).json({ success: false, error: error.message });
  }
});

// api for requesting otp to phone number coming from frontend
router.post("/requestotp", async (req, res) => {
  try {
    const { phonenumber, channel } = req.body; // this line is used to accept frontend data
    // console.log(`otp sent on ${phonenumber} through ${channel}`);

    const check = phone(phonenumber, { strictDetection: true });

    if (!check.isValid) return res.json({ error: "Invalid Phone Number" });

    client.verify
      .services(process.env.TWILIO_SERVICE_ID)
      .verifications.create({
        to: phonenumber,
        channel: channel,
      })
      .then((verification) => {
        res.send(
          JSON.stringify({ success: true, status: verification.status })
        );
      })
      .catch((err) => {
        console.log(err);
        if (err.code === 60200) res.json({ error: "Invalid Parameter" });
        else if (err.code === 60203)
          res.json({ error: "Max Send attempts reached" });
        else if (err.code === 60212)
          res.json({
            error: "Too many concurrent requests for phone number",
          });
        else res.json({ error: "Server Issue, Try Again Later!" });
      });
    // return res.json({ success: true,
    // message: `otp sent on ${phonenumber} through ${channel}`
    // });
  } catch (error) {
    return res.json({ success: false, error: error.message });
  }
});

// api for verifying otp to phone number coming from frontend, otp also comes
router.post("/verifyotp", async (req, res) => {
  try {
    const { phonenumber, otp } = req.body;

    if (!phonenumber) return res.json({ error: "Phone Number Missing" });
    if (!otp) return res.json({ error: "OTP Missing" });

    client.verify
        .services(process.env.TWILIO_SERVICE_ID)
        .verificationChecks.create({ to: phonenumber, code: otp })
        .then((verification_check) => {
          res.send(JSON.stringify({ status: verification_check.status }));
        })
        .catch((err) => {
          console.log(err);
          if (err.code === 60200) res.json({ error: "Invalid Parameter" });
          else if (err.code === 60202)
            res.json({ error: "Max check attempts reached" });
          else if (err.code === 60201)
            res.json({ error: "Invalid verification code" });
          else if (err.code === 60212)
            res.json({
              error: "Too many concurrent requests for phone number",
            });
          else if (err.code === 20404)
            res.json({ error: "OTP haven't sent yet!" });
          else res.json({ error: "Server Issue, Try Again Later!" });
        });

    console.log(phonenumber, otp);
    // return res.json({ success: true });
  } catch (error) {
    return res.json({ success: false, error: error.message });
  }
});

module.exports = router;
