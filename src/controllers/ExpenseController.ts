import BaseController, { IArgs } from "./BaseController";
import Expense from "../models/expense";
import Frequency from "../models/Frequency";
import Joi from "joi";

interface IExpenseArgs extends IArgs {}

export default class ExpenseController extends BaseController {
  constructor(args: IExpenseArgs) {
    super(args);
  }

  protected async create() {
    const params = this.getParams();
    const user = this.cu.getUser();
    if (!user) {
      return this.notAuthorized();
    }

    const frequency = new Frequency({
      day: params.day,
      weekDay: params.weekDay,
      weeksRepeat: params.weeksRepeat, 
      monthsRepeat: params.monthsRepeat,
      months: params.months,
      startEndMonth: params.startEndMonth
    });
    const savedFrequency = await frequency.save();

    const expense = new Expense({
      title: params.title.trim(),
      category: params.category.trim(),
      from: params.from,
      until: params.until,
      qty: params.qty,
      frequency: savedFrequency._id,
      belongsTo: user._id,
    });
    const savedExpense = await expense.save();

    this.ok({ expense: savedExpense });
  }

  protected createParams() {
    return Joi.object({
      title: Joi.string().required(),
      category: Joi.string().required(),
      from: Joi.date(),
      until: Joi.date(),
      qty: Joi.number().required(),
      day: Joi.number(),
      weekDay: Joi.string(),
      weeksRepeat: Joi.number(),
      monthsRepeat: Joi.number(),
      months: Joi.array(),
      startEndMonth: Joi.string()
    });
  }

  protected async read() {
    const user = this.cu.getUser();
    if (user === null) {
      return this.notAuthorized();
    }

    const params = this.getParams();
    let query: any = {
      belongsTo: user.id,
    };
    if (params.id) {
      query = { ...query, _id: params.id };
    }
    Expense.find(query)
      .exec()
      .then((results) => {
        return this.res.status(200).json({
          expense: results,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  protected readParams() {
    return Joi.object({
      id: Joi.string().optional(),
    });
  }

  private async destroy() {
    const id = this.req.params.id;
    const expense = await Expense.findOneAndDelete({ _id: id });
    if (expense) {
      console.log(`Expense ${expense._id} deleted.`);
    } else {
      console.log(`No Expense with that ID`);
    }
    this.ok({ expense });
  }

  private destroyParams() {
    return Joi.object({});
  }
}
