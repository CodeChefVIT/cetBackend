require("dotenv").config();
// MIGRATE TO AXIOS ASAP
const request = require("request");

module.exports = (req, res, next) => {
  if (!req.body.captcha) {
    return res.status(400).json({
      message: "No recaptcha token",
    });
  }
  request(
    `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${req.body.captcha}`,
    (err, response, body) => {
      body = JSON.parse(body);
      try {
        if (!body.success || body.score < 0.4) {
          flag = 1;
          return res.status(500).json({
            message: "Something went wrong",
            error: err.toString(),
          });
        }
        if (err) {
          return res.status(500).json({
            message: "Something went wrong",
            error: err.toString(),
          });
        }
        next();
      } catch (err) {
        return res.status(500).json({
          message: "Something went wrong",
          error: err.toString(),
        });
      }
    }
  );
};
