const express = require("express");
const passport = require("passport");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const cors = require("cors");
const useragent = require("express-useragent");
require("dotenv").config();

const app = express();

const passport_config = require("./api/config/studentGoogleAuth");
const { errorLogger } = require("./api/utils/logger");

//Require Atlas database URI from environment variables
const DBURI = process.env.DBURI;

//Connect to MongoDB client using mongoose
mongoose
  .connect(DBURI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log("Database Connected"))
  .catch((err) => {
    errorLogger.error(`System: NIL >> ${err.toString()}`);
  });

mongoose.Promise = global.Promise;

//Use helmet to prevent common security vulnerabilities
app.use(helmet());

//Set static folder
app.use("/uploads", express.static("./public"));

//Use body-parser to parse json body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Allow CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, auth-token"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

app.use(cors());

app.use(useragent.express());

if (process.env.NODE_ENV == "production") {
  app.use((req, res, next) => {
    if (req.useragent["isBot"] == false) {
      next();
    } else {
      res.status(401).json({
        message:
          "Please try using a different browser: Interception is blocked",
      });
    }
  });
}

app.use("/api/club", require("./api/routes/club.routes"));
app.use("/api/student", require("./api/routes/student.routes"));
app.use("/api/test", require("./api/routes/test.routes"));
app.use("/api/studentForm", require("./api/routes/student.form.routes"));
app.use("/api/easterEgg", require("./api/routes/easterEggForm.routes"));
app.use("/api/auth", require("./api/routes/auth.routes"));
app.get("/checkServer", (req, res) => {
  return res.status(200).json({
    message: "Server is up and running",
  });
});

if (process.env.NODE_ENV == "development") {
  app.use("/dev", require("./api/routes/dev.routes"));
}

//This function will give a 404 response if an undefined API endpoint is fired
app.use((req, res, next) => {
  const error = new Error("Route not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

const PORT = process.env.PORT || 8000;

//Start the server
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

module.exports = app;
