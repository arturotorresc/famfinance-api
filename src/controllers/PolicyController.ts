import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Policy from "../models/policy";


const createPolicy = (req: Request, res: Response) => {
  let {belongsTo} = req.body;

  const policy = new Policy({
    _id: new mongoose.Types.ObjectId(),
    belongsTo
  });

  return policy
    .save()
    .then(result => {
      return res.status(201).json({
        policy: result
      })
    })
    .catch(error => {
      console.log(error);
    })
};

const getAllPolicies = (_: Request, res: Response) => {
  Policy.find({})
  .exec()
  .then(results => {
    return res.status(200).json({
      policies: results
    })
  })
  .catch(error => {
    console.log(error);
  })
};

export default { getAllPolicies, createPolicy };