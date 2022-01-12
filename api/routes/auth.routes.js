const express = require("express");
const passport = require("passport");
const cookieParser = require("cookie-parser");

const router = express.Router();

router.use(cookieParser());

router.get(
  "/google",
  passport.authenticate("google", {
    hd: "vitstudent.ac.in",
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

///Callback route for google to redirect
router.get(
  "/google/redirect",
  passport.authenticate("google"),
  (req, res, next) => {
    const x = req.user;
    console.log(req.user)
    var token = encodeURIComponent(req.user.token);
    var name = encodeURIComponent(req.user.name);
    res.redirect(
      303,
      // "https://cet-dev.netlify.app/student/oauth/" + token + "/" + req.user.loginCount + '/'
      //"http://cet-portal.codechefvit.com/student/oauth/" + token + "/" + req.user.loginCount + '/'
      "http://localhost:3000/student/oauth/" + token + "/" + req.user.loginCount + '/'
//        "http://localhost:3000/student/oauth/" + token + "/"
    );
  }
);

module.exports = router;
