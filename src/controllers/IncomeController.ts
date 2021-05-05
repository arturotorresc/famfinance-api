import BaseController, { IArgs } from "./BaseController";
import Income from "../models/income";
import Frequency from "../models/frequency";
import { AllowedActionsEnum } from "../models/policy";
import { TransactionCategoryEnum } from "../types/transactionCategory.type";
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
      frequencyType: params.frequencyType,
      day: params.day,
      weekDay: params.weekDay,
      weeksRepeat: params.weeksRepeat,
      monthsRepeat: params.monthsRepeat,
      months: params.months,
      startEndMonth: params.startEndMonth,
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
      category: Joi.string()
        .valid(...Object.keys(TransactionCategoryEnum))
        .required(),
      frequencyType: Joi.string(),
      day: Joi.number().allow(null),
      weekDay: Joi.string().allow(null),
      weeksRepeat: Joi.number().allow(null),
      monthsRepeat: Joi.number().allow(null),
      months: Joi.array().allow(null),
      startEndMonth: Joi.string().allow(null),
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
      title: Joi.string().required(),
      from: Joi.date(),
      until: Joi.date(),
      qty: Joi.number().min(0).required(),
      category: Joi.string()
        .valid(...Object.keys(TransactionCategoryEnum))
        .required(),
      weekDay: Joi.number().min(1).max(7).required(),
      repetition: "WEEKLY",
      repeatsEvery: Joi.number().min(1).required(),
      id: Joi.string().optional(),
    });
  }

  protected async update() {
    const id = this.req.params.id;
    const params = this.getParams();
    const hasPermission = await this.cu.hasPermission(
      // TODO: Add the proper permission for this
      AllowedActionsEnum.CREATE_FAMILY_INCOME
    );
    if (!hasPermission) {
      return this.notAuthorized("You dont have permission to update incomes");
    }
    const user = this.cu.getUser();

    const category = (params.category as string).trim().toLowerCase();
    const income = {
      title: params.title.trim(),
      from: params.from,
      until: params.until,
      qty: params.qty,
      category,
      belongsTo: user!._id,
    };

    const updatedIncome = await Income.findByIdAndUpdate({ _id: id }, income);

    const frequency = {
      frequencyType: params.frequencyType,
      day: params.day,
      weekDay: params.weekDay,
      weeksRepeat: params.weeksRepeat,
      monthsRepeat: params.monthsRepeat,
      months: params.months,
      startEndMonth: params.startEndMonth,
    };

    const updatedFrequency = await Frequency.findByIdAndUpdate(
      { _id: updatedIncome?.frequency },
      frequency
    );
    this.ok({ income: updatedIncome });
  }

  protected updateParams() {
    return Joi.object({
      title: Joi.string().required(),
      from: Joi.date(),
      until: Joi.date(),
      category: Joi.string()
        .valid(...Object.keys(TransactionCategoryEnum))
        .required(),
      qty: Joi.number().min(0).required(),
      frequencyType: Joi.string(),
      day: Joi.number().allow(null),
      weekDay: Joi.string().allow(null),
      weeksRepeat: Joi.number().allow(null),
      monthsRepeat: Joi.number().allow(null),
      months: Joi.array().allow(null),
      startEndMonth: Joi.string().allow(null),
    });
  }

  protected async readOne() {
    const id = this.req.params.id;
    const user = this.cu.getUser();
    if (user === null) {
      return this.notAuthorized();
    }

    Income.findById({ _id: id })
      .populate("frequency")
      .then((income) => {
        console.log(income);
        return this.res.status(200).json({
          income: income,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  protected readOneParams() {
    return Joi.object({});
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
