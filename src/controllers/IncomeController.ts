import BaseController, { IArgs } from "./BaseController";
import Income from "../models/income";
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
    const income = new Income({
      title: params.title.trim(),
      from: params.from,
      until: params.until,
      qty: params.qty,
      category,
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
    });
  }

  protected async read() {
    const user = this.cu.getUser();
    if (user === null) {
      return this.notAuthorized();
    }

    Income.find({ belongsTo: user.id })
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
    return Joi.object({});
  }
}
