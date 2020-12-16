const app = require('../../app')

module.exports = async (req, res, next) => {
  if (process.env.NODE_ENV == "production") {
    app.use((req, res, next) => {
      if (req.useragent["isBot"] == false) {
        next();
      } else {
        res.status(401).json({
          message: "Please try using a different browser: Interception is blocked",
        });
      }
    });
  } else {
    next()
  }
}