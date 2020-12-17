const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const Student = require("../models/student.model");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
require("dotenv").config();

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  Student.findById(id)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      console.log(err);
    });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "/auth/google/redirect",
    },
    async (accessToken, refreshToken, profile, done) => {
      const emailRegex = /[A-Za-z]+.[A-Za-z]*20[0-9]{2}[A-Za-z]*@vitstudent.ac.in/;
      if(profile && !profile.emails[0].value.match(emailRegex)) {
        console.log('failed')
        done(new Error("Invalid host domain"));
      }
      console.log("recieved");
      // check if user already exists in our own db
      Student.findOne({ email: profile.emails[0].value })
        .then((currentUser) => {
          if (currentUser) {
            // already have this user
            const token = jwt.sign(
              {
                userType: currentUser.userType,
                userId: currentUser._id,
                email: currentUser.email,
                name: currentUser.name,
                isEmailVerified: currentUser.isEmailVerified,
              },
              process.env.JWT_SECRET,
              {
                expiresIn: "1d",
              }
            );

            Student.findById(currentUser._id).then((result7) => {
              result7.token = token;
              result7.googleId = profile.id;
              result7.isEmailVerified = false;
              result7
                .save()
                .then((user) => {
                  done(null, user);
                })
                .catch((err) => {
                  console.log(err);
                });
            });
          } else {
            // if not, create user in our db
            new Student({
              _id: new mongoose.Types.ObjectId(),
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails[0].value,
              isEmailVerified: false,
            })
              .save()
              .then((newUser) => {
                console.log(newUser);
                const token = jwt.sign(
                  {
                    userType: newUser.userType,
                    userId: newUser._id,
                    email: newUser.email,
                    name: newUser.name,
                    isEmailVerified: newUser.isEmailVerified,
                  },
                  process.env.JWT_SECRET,
                  {
                    expiresIn: "1d",
                  }
                );
                Student.findById(newUser._id).then((result7) => {
                  result7.token = token;
                  result7
                    .save()
                    .then((user) => {
                      console.log(user);
                      done(null, user);
                    })
                    .catch((err) => {
                      console.log(err);
                    });
                });
              })
              .catch((err) => {
                console.log(err);
              });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  )
);
