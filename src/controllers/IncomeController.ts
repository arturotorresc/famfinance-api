import BaseController, { IArgs } from "./BaseController";
import Income from "../models/income";
import Frequency from "../models/Frequency";
import Joi from "joi";

interface IIncomeArgs extends IArgs {}

export default class IncomeController extends BaseController {
  constructor(args: IIncomeArgs) {
    super(args);
  }

  protected async create() {
    const params = this.getParams();
    const user = this.cu.getUser();
    const category = (params.category as string).trim().toLowerCase();

    const frequency = new Frequency({
      day: params.day,
      weekDay: params.weekDay,
      weeksRepeat: params.weeksRepeat, 
      monthsRepeat: params.monthsRepeat,
      months: params.months,
      startEndMonth: params.startEndMonth
    });
    const savedFrequency = await frequency.save();

    const income = new Income({
      title: params.title.trim(),
      from: params.from,
      until: params.until,
      qty: params.qty,
      category,
      frequency: savedFrequency._id,
      belongsTo: user!._id,
    });
    const savedIncome = await income.save();
    this.ok({ income: savedIncome });
  }

  protected createParams() {
    return Joi.object({
      title: Joi.string().required(),
      from: Joi.date(),
      until: Joi.date(),
      qty: Joi.number().required(),
      category: Joi.string().required(),
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
    Income.find(query)
      .exec()
      .then((results) => {
        return this.res.status(200).json({
          income: results,
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
    const income = await Income.findOneAndDelete({ _id: id });
    if (income) {
      console.log(`Income ${income._id} deleted.`);
    } else {
      console.log(`No Income with that ID`);
    }
    this.ok({ income });
  }

  private destroyParams() {
    return Joi.object({});
  }
}
