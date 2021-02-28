import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import User from "../models/user";


const createUser = (req: Request, res: Response, _: NextFunction) => {
  let {name, email, password, role} = req.body;

  const user = new User({
    _id: new mongoose.Types.ObjectId(),
    name,
    email,
    password,
    role
  });

  return user
    .save()
    .then(result => {
      return res.status(201).json({
        user: result
      })
    })
    .catch(error => {
      console.log(error);
    })
};

const getAllUsers = (_: Request, res: Response, __: NextFunction) => {
  User.find({})
  .exec()
  .then(results => {
    return res.status(200).json({
      users: results
    })
  })
  .catch(error => {
    console.log(error);
  })
};

export default { getAllUsers, createUser };