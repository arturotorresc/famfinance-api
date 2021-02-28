import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Income from "../models/income";


const createIncome = (req: Request, res: Response) => {
  let {title, from, until, qty, belongsTo} = req.body;

  const income = new Income({
    _id: new mongoose.Types.ObjectId(),
    title,
    from,
    until,
    qty,
    belongsTo
  });

  return income
    .save()
    .then(result => {
      return res.status(201).json({
        income: result
      })
    })
    .catch(error => {
      console.log(error);
    })
};

const getAllIncomes = (_: Request, res: Response) => {
  Income.find({})
  .exec()
  .then(results => {
    return res.status(200).json({
      incomes: results
    })
  })
  .catch(error => {
    console.log(error);
  })
};

export default { getAllIncomes, createIncome };