import BaseController, { IArgs } from "./BaseController";
import Income from "../models/income";
import Frequency from "../models/frequency";
import { AllowedActionsEnum } from "../models/policy";
import Joi from "joi";

interface IIncomeArgs extends IArgs {}

export default class IncomeController extends BaseController {
  constructor(args: IIncomeArgs) {
    super(args);
  }

  protected async create() {
    const params = this.getParams();
    const hasPermission = await this.cu.hasPermission(
      AllowedActionsEnum.CREATE_FAMILY_INCOME
    );
    if (!hasPermission) {
      return this.notAuthorized("You dont have permission to create incomes");
    }
    const user = this.cu.getUser();

    const frequency = new Frequency({
      day: params.day,
      weekDay: params.weekDay,
      weeksRepeat: params.weeksRepeat, 
      monthsRepeat: params.monthsRepeat,
      months: params.months,
      startEndMonth: params.startEndMonth
    });
    const savedFrequency = await frequency.save();

    const category = (params.category as string).trim().toLowerCase();
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
      qty: Joi.number().min(0).required(),
      category: Joi.string().required(),
      day: Joi.number(),
      weekDay: Joi.string(),
      weeksRepeat: Joi.number(),
      monthsRepeat: Joi.number(),
      months: Joi.array(),
      startEndMonth: Joi.string()
    });
  }

  protected async createWeekly() {
    const params = this.getParams();

    const hasPermission = await this.cu.hasPermission(
      AllowedActionsEnum.CREATE_FAMILY_INCOME
    );

    if (!hasPermission) {
      return this.notAuthorized("You dont have permission to create incomes");
    }

    const user = this.cu.getUser();
    const category = (params.category as string).trim().toLowerCase();
    const frequency = new Frequency({
      weekDay: params.weekDay,
      repetition: params.repetition,
      repeatsEvery: params.repeatsEvery,
    });

    const savedFrequency = await frequency.save();

    const income = new Income({
      title: params.title.trim(),
      from: params.from,
      until: params.until,
      qty: params.qty,
      category,
      belongsTo: user!._id,
      frequency: frequency._id,
    });
    const savedIncome = await income.save();
    this.ok({ income: savedIncome, frequency: savedFrequency });
  }

  protected createWeeklyParams() {
    return Joi.object({
      title: Joi.string().required(),
      from: Joi.date(),
      until: Joi.date(),
      qty: Joi.number().min(0).required(),
      category: Joi.string().required(),
      weekDay: Joi.number().min(1).max(7).required(),
      repetition: "WEEKLY",
      repeatsEvery: Joi.number().min(1).required(),
    });
  }

  protected async createMonthly() {
    const params = this.getParams();

    const hasPermission = await this.cu.hasPermission(
      AllowedActionsEnum.CREATE_FAMILY_INCOME
    );

    if (!hasPermission) {
      return this.notAuthorized("You dont have permission to create incomes");
    }

    const user = this.cu.getUser();
    const category = (params.category as string).trim().toLowerCase();
    const frequency = new Frequency({
      weekDay: params.weekDay,
      repetition: params.repetition,
      repeatsEvery: params.repeatsEvery,
    });

    const savedFrequency = await frequency.save();

    const income = new Income({
      title: params.title.trim(),
      from: params.from,
      until: params.until,
      qty: params.qty,
      category,
      belongsTo: user!._id,
      frequency: frequency._id,
    });
    const savedIncome = await income.save();
    this.ok({ income: savedIncome, frequency: savedFrequency });
  }

  protected createMonthlyParams() {
    return Joi.object({
      title: Joi.string().required(),
      from: Joi.date(),
      until: Joi.date(),
      qty: Joi.number().required(),
      category: Joi.string().required(),
      weekDay: Joi.number().min(1).max(7).required(),
      repetition: "MONTHLY",
      repeatsEvery: Joi.number().min(1).required(),
    });
  }

  protected async read() {
    const user = this.cu.getUser();
    if (user === null) {
      return this.notAuthorized();
    }

    const params = this.getParams();
    const family = await this.cu.getFamily();
    if (!family) {
      console.log("No family was found for this user!");
      return this.notFound();
    }
    const belongsToArray = family.members.map((userId) => {
      return {
        belongsTo: userId,
      };
    });
    belongsToArray.push({ belongsTo: family.admin });
    let query: any = {
      $or: belongsToArray,
    };
    if (params.id) {
      query = { $and: [{ _id: params.id }, { $or: belongsToArray }] };
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
    const hasPermission = await this.cu.hasPermission(
      AllowedActionsEnum.DELETE_FAMILY_INCOME
    );
    if (!hasPermission) {
      return this.notAuthorized("You are not allowed to delete incomes");
    }
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
