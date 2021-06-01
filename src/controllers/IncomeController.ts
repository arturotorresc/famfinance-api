import BaseController, { IArgs } from "./BaseController";
import { AllowedActionsEnum } from "../models/policy";
import { TransactionCategoryEnum } from "../types/transactionCategory.type";
import Joi from "joi";
import {
  createIncome,
  createFrequency,
  updateIncomeById,
  findIncomeById,
  deleteIncomeById,
  updateFrequencyForIncomeById,
  deleteFrequencyById,
  findFamilyIncomesByFamilyAndCategory,
} from "../DBAccessLayer";

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

    const savedFrequency = await createFrequency({
      frequencyType: params.frequencyType,
      day: params.day,
      weekDay: params.weekDay,
      weeksRepeat: params.weeksRepeat,
      monthsRepeat: params.monthsRepeat,
      months: params.months,
      startEndMonth: params.startEndMonth,
    });

    const savedIncome = await createIncome({
      title: params.title.trim(),
      from: params.from,
      until: params.until,
      qty: params.qty,
      category: params.category,
      frequency: savedFrequency._id,
      belongsTo: user!._id,
    });
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
    const results = await findFamilyIncomesByFamilyAndCategory(
      params.id,
      family,
      params.category
    );
    return this.res.status(200).json({
      income: results,
    });
  }

  protected readParams() {
    return Joi.object({
      title: Joi.string().optional(),
      category: Joi.string()
        .valid(...Object.keys(TransactionCategoryEnum))
        .optional(),
      from: Joi.date().optional(),
      until: Joi.date().optional(),
      qty: Joi.number().optional(),
      weekDay: Joi.number().min(1).max(7).optional(),
      repeatsEvery: Joi.number().min(1).optional(),
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

    const income = {
      title: params.title.trim(),
      from: params.from,
      until: params.until,
      qty: params.qty,
      category: params.category,
      belongsTo: user!._id,
    };

    const updatedIncome = await updateIncomeById(id, income);
    if (!updatedIncome) {
      return this.notFound("Income with id " + id + " not found");
    }

    const frequency = {
      frequencyType: params.frequencyType,
      day: params.day,
      weekDay: params.weekDay,
      weeksRepeat: params.weeksRepeat,
      monthsRepeat: params.monthsRepeat,
      months: params.months,
      startEndMonth: params.startEndMonth,
    };

    const updatedFrequency = await updateFrequencyForIncomeById(
      updatedIncome,
      frequency
    );
    if (!updatedFrequency) {
      return this.notFound("Frequency for income with id " + id + " not found");
    } else {
      return this.ok({ income: updatedIncome });
    }
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

    const income = await findIncomeById(id);
    if (income) {
      return this.res.status(200).json({
        income: income,
      });
    } else {
      return this.notFound("Income with id " + id + " not found");
    }
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
    const income = await deleteIncomeById(id);
    if (income) {
      console.log(`Income ${income._id} deleted.`);
      await deleteFrequencyById(income.frequency);
      return this.ok({ income });
    } else {
      return this.notFound("Income with id " + id + " not found");
    }
  }

  private destroyParams() {
    return Joi.object({});
  }
}
