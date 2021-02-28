import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Family from "../models/family";


const createFamily = (req: Request, res: Response) => {
  let {admin} = req.body;

  const family = new Family({
    _id: new mongoose.Types.ObjectId(),
    admin
  });

  return family
    .save()
    .then(result => {
      return res.status(201).json({
        family: result
      })
    })
    .catch(error => {
      console.log(error);
    })
};

const getAllFamilies = (_: Request, res: Response) => {
  Family.find({})
  .exec()
  .then(results => {
    return res.status(200).json({
      families: results
    })
  })
  .catch(error => {
    console.log(error);
  })
};

export default { getAllFamilies, createFamily };