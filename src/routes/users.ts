const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

import Joi from "joi";
const User = require("../models/user.js");

const maxNameLength = 40;
const minNameLength = 1;
const minPasswordLength = 1;

//login page
router.get("/login", (req, res) => {

})

//signup page
router.get("/signup", (req, res) => {

})

//login credentials
router.post("/login", (req, res) => {

})

//create an account
router.post("/signup", (req, res) => {
  const {name, email, password} = req.body;
  console.log(name + " " + email + " " + password);

  //check if input is valid
  const Schema = Joi.object().keys({
    name: Joi.string().min(minNameLength).max(maxNameLength).required(),
    email: Joi.string().email(),
    password: Joi.string.min(minPasswordLength).required(),
  })

  const result = Joi.validate({name: name, email: email, password: password}, schema);

  if(result.error == null) {
    console.log("Valid");

    User.findOne({emal: email}).exec((error, user) => {
      console.log(user);

      if(user) {   //email already used
        console.log("Email already used")
        res.send("email already used")
      } else {
        const newUser = new User({
          name: name,
          email: email,
          password: password
        })

        bcrypt.hash(password, 10, (error, hash) => {
          if(error) {
            throw error;
          }

          newUser.password = hash;
          newUser.save().then((value) => {
            console.log(value);
            res.redirect("/users/login");
          }).catch((value) => {
            console.log(value);
          });
        });

      }
    })
  } else {
    console.log("Not valid");
    res.send("inputn not valid");
  }
})

//logout
router.get("/logout", (req, res) => {

})


module.exports = router;
