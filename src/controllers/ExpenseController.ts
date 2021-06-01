import BaseController, { IArgs } from "./BaseController";
import { AllowedActionsEnum } from "../models/policy";
import { TransactionCategoryEnum } from "../types/transactionCategory.type";
import Joi from "joi";
import {
  createExpense,
  createFrequency,
  updateExpenseById,
  findExpenseById,
  deleteExpenseById,
  updateFrequencyForExpenseById,
  deleteFrequencyById,
  findFamilyExpensesByFamilyAndCategory,
} from "../DBAccessLayer";

interface IExpenseArgs extends IArgs {}

export default class ExpenseController extends BaseController {
  constructor(args: IExpenseArgs) {
    super(args);
  }

  protected async create() {
    const params = this.getParams();
    const hasPermission = await this.cu.hasPermission(
      AllowedActionsEnum.CREATE_FAMILY_EXPENSE
    );
    if (!hasPermission) {
      return this.notAuthorized("You dont have permission to create expenses");
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

    const savedExpense = await createExpense({
      title: params.title.trim(),
      from: params.from,
      until: params.until,
      qty: params.qty,
      category: params.category,
      frequency: savedFrequency._id,
      belongsTo: user!._id,
    });
    this.ok({ expense: savedExpense });
  }

  protected createParams() {
    return Joi.object({
      title: Joi.string().required(),
      category: Joi.string()
        .valid(...Object.keys(TransactionCategoryEnum))
        .required(),
      from: Joi.date(),
      until: Joi.date(),
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
    const results = await findFamilyExpensesByFamilyAndCategory(
      params.id,
      family,
      params.category
    );
    return this.res.status(200).json({
      expense: results,
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
      AllowedActionsEnum.CREATE_FAMILY_EXPENSE
    );
    if (!hasPermission) {
      return this.notAuthorized("You dont have permission to update expenses");
    }
    const user = this.cu.getUser();

    const expense = {
      title: params.title.trim(),
      from: params.from,
      until: params.until,
      qty: params.qty,
      category: params.category,
      belongsTo: user!._id,
    };

    const updatedExpense = await updateExpenseById(id, expense);
    if (!updatedExpense) {
      return this.notFound("Expense with id " + id + " not found");
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

    const updatedFrequency = await updateFrequencyForExpenseById(
      updatedExpense,
      frequency
    );
    if (!updatedFrequency) {
      return this.notFound(
        "Frequency for expense with id " + id + " not found"
      );
    } else {
      return this.ok({ expense: updatedExpense });
    }
  }

  protected updateParams() {
    return Joi.object({
      title: Joi.string().required(),
      category: Joi.string()
        .valid(...Object.keys(TransactionCategoryEnum))
        .required(),
      from: Joi.date(),
      until: Joi.date(),
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

    const expense = await findExpenseById(id);
    if (expense) {
      return this.res.status(200).json({
        expense: expense,
      });
    } else {
      return this.notFound("Expense with id " + id + " not found");
    }
  }

  protected readOneParams() {
    return Joi.object({});
  }

  private async destroy() {
    const id = this.req.params.id;
    const hasPermission = await this.cu.hasPermission(
      AllowedActionsEnum.DELETE_FAMILY_EXPENSE
    );
    if (!hasPermission) {
      return this.notAuthorized("You are not authorized to delete an expense");
    }
    const expense = await deleteExpenseById(id);
    if (expense) {
      console.log(`Expense ${expense._id} deleted.`);
      await deleteFrequencyById(expense.frequency);
      return this.ok({ expense });
    } else {
      return this.notFound("Expense with id " + id + " not found");
    }
  }

  private destroyParams() {
    return Joi.object({});
  }
}
