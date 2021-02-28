import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Goal from "../models/goal";


const createGoal = (req: Request, res: Response) => {
  let {title, description, deadline, qty, belongsTo} = req.body;

  const goal = new Goal({
    _id: new mongoose.Types.ObjectId(),
    title,
    description,
    deadline,
    qty,
    belongsTo
  });

  return goal
    .save()
    .then(result => {
      return res.status(201).json({
        goal: result
      })
    })
    .catch(error => {
      console.log(error);
    })
};

const getAllGoals = (_: Request, res: Response) => {
  Goal.find({})
  .exec()
  .then(results => {
    return res.status(200).json({
      goals: results
    })
  })
  .catch(error => {
    console.log(error);
  })
};

export default { getAllGoals, createGoal };