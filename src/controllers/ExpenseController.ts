import BaseController, { IArgs } from "./BaseController";
import Expense from "../models/expense";
import Frequency from "../models/frequency";
import { AllowedActionsEnum } from "../models/policy";
import { TransactionCategoryEnum } from "../types/transactionCategory.type";
import Joi from "joi";

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

    const expense = new Expense({
      title: params.title.trim(),
      from: params.from,
      until: params.until,
      qty: params.qty,
      category: params.category,
      frequency: savedFrequency._id,
      belongsTo: user!._id,
    });
    const savedExpense = await expense.save();
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
    Expense.find(query)
      .populate('frequency')
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

    const updatedExpense = await Expense.findByIdAndUpdate(
      { _id: id },
      expense
    );

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
      { _id: updatedExpense?.frequency },
      frequency
    );
    this.ok({ expense: updatedExpense });
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

    Expense.findById({ _id: id })
      .populate("frequency")
      .then((expense) => {
        console.log(expense);
        return this.res.status(200).json({
          expense: expense,
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
      AllowedActionsEnum.DELETE_FAMILY_EXPENSE
    );
    if (!hasPermission) {
      return this.notAuthorized("You are not authorized to delete an expense");
    }
    const expense = await Expense.findOneAndDelete({ _id: id });
    if (expense) {
      console.log(`Expense ${expense._id} deleted.`);
      await Frequency.findOneAndDelete({_id: expense.frequency})
    } else {
      console.log(`No Expense with that ID`);
    }
    this.ok({ expense });
  }

  private destroyParams() {
    return Joi.object({});
  }
}
