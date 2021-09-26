const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  if (!req.headers.authorization)
    return res.status(401).json({
      message: "Access Denied! No token entered.",
    });

  const token = req.headers.authorization.split(" ")[1];

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    if (req.user.userType === "Student") {
      next();
    } else {
      return res.status(403).json({
        message: "Not a student",
      });
    }
  } catch (err) {
    res.status(400).json({
      message: "Auth failed!",
    });
  }
};
