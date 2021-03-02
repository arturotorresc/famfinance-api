import BaseController, { IArgs } from "./BaseController";
import Expense from "../models/expense";
import Joi from "joi";

interface IExpenseArgs extends IArgs {}

export default class ExpenseController extends BaseController {
  constructor(args: IExpenseArgs) {
    super(args);
  }

  protected async create() {
    const params = this.getParams();

    const expense = new Expense({
      title: params.title.trim(),
      from: params.from,
      until: params.until,
      qty: params.qty,
      belongsTo: params.belongsTo
    });
    const savedExpense = await expense.save();

    this.ok({ expense: savedExpense });
  }

  protected createParams() {
    return Joi.object({
      title: Joi.string().required(),
      from: Joi.date(),
      until: Joi.date(),
      qty: Joi.number().required(),
      belongsTo: Joi.string().required()
    });
  }

  protected async read() {
    Expense.find({})
    .exec()
    .then(results => {
      return this.res.status(200).json({
        expense: results
      })
    })
    .catch(error => {
      console.log(error);
    })
  }

  protected readParams() {
    return Joi.object({});
  }
}