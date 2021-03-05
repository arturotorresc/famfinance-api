import User from "./models/user";
import bcrypt from "bcrypt";
import passport from "passport";
import passportLocal from "passport-local";

const LocalStrategy = passportLocal.Strategy;
export default function setStrategy(passport: passport.PassportStatic) {
  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      (username: string, password: any, done: any) => {
        const email = username.trim().toLocaleLowerCase();
        User.findOne({ email: email }).then((user: any) => {
          if (!user) {
            return done(null, false, { message: "email not found" });
          }

          bcrypt.compare(password, user.password, (error: any, match: any) => {
            if (error) {
              throw error;
            }

            if (match) {
              return done(null, user);
            } else {
              return done(null, false, { message: "incorrect password" });
            }
          });
        });
      }
    )
  );

  passport.serializeUser((user: any, done: any) => {
    done(null, user._id);
  });

  passport.deserializeUser((id: any, done: any) => {
    User.findById(id, (error: any, user: any) => {
      done(error, user);
    });
  });
}
