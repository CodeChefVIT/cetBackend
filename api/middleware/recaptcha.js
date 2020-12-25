require("dotenv").config();
// MIGRATE TO AXIOS ASAP
const request = require("request");

module.exports = (req, res, next) => {
  if (!req.body.captcha) {
    return res.status(400).json({
      message: "No recaptcha token",
    });
  }
  request({
    url: 'https://www.google.com/recaptcha/api/siteverify',
    method: 'POST',
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `secret=${global.env.RECAPTCHA_SECRET_KEY}&response=${req.body.captcha}`
  },
    (err, response, body) => {
      body = JSON.parse(body);
      console.log(err)
      console.log(body)
      try {
        if (!body.success || body.score < 0.4) {
          flag = 1;

          console.log(err)
          return res.status(500).json({
            message: "Something went wrong",
            error: err.toString(),
          });
        }
        if (err) {
          console.log(err)
          return res.status(500).json({
            message: "Something went wrong",
            error: err.toString(),
          });
        }
        next();
      } catch (err) {

        console.log(err)
        return res.status(500).json({
          message: "Something went wrong",
          error: err.toString(),
        });
      }
    }
  );
};
