require("dotenv").config();
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
      if(verified.payload == process.env.JWT_PAYLOAD_SECRET){
          next();
      } else{
        res.status(400).json({
            message: "Non Admin User!",
          });    
      }
    } catch (err) {
      res.status(400).json({
        message: "Auth failed!",
      });
    }
  };
  