import User from "./models/user";
const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local").Strategy;

export default function setStrategy(passport:any) {

    passport.use(new LocalStrategy({usernameField: "email", passwordField: "password"},
    (username:any, password:any, done:any) => {
      //find user
      User.findOne({email: username.trim().toLowerCase()}).then((user:any) => {
        //user not found
        if(!user) {
          return done(null, false, {message: "email not found"});
        }

        //compare password
        bcrypt.compare(password, user.password, (error:any, match:any) => {
          if(error) {
            throw error;
          }


          if(match) {
            return done(null, user);
          } else {
            return done(null, false, {message: "incorrect password"});
          }
        }).catch((error:any) => {
          console.log(error);
        })

      })

      passport.serializeUser((user: any, done: any) => {
        done(null, user._id);
      })

      passport.deserializeUser((id: any, done:any) => {
        User.findById(id , (error:any, user:any) => {
          done(error, user);
        })
      })
  }))
}
