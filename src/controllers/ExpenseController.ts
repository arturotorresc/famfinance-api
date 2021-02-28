import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Expense from "../models/expense";


const createExpense = (req: Request, res: Response) => {
  let {title, from, until, qty, belongsTo} = req.body;

  const expense = new Expense({
    _id: new mongoose.Types.ObjectId(),
    title,
    from,
    until,
    qty,
    belongsTo
  });

  return expense
    .save()
    .then(result => {
      return res.status(201).json({
        expense: result
      })
    })
    .catch(error => {
      console.log(error);
    })
};

const getAllExpenses = (_: Request, res: Response) => {
  Expense.find({})
  .exec()
  .then(results => {
    return res.status(200).json({
      expenses: results
    })
  })
  .catch(error => {
    console.log(error);
  })
};

export default { getAllExpenses, createExpense };