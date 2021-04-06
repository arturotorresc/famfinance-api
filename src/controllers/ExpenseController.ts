import BaseController, { IArgs } from "./BaseController";
import Expense from "../models/expense";
import Frequency from "../models/frequency";
import { AllowedActionsEnum } from "../models/policy";
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
    const hasPermission = await this.cu.hasPermission(
      AllowedActionsEnum.CREATE_FAMILY_EXPENSE
    );
    if (!hasPermission) {
      return this.notAuthorized(
        "You dont have permission to create an expense"
      );
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

  protected async createWeekly() {
    const params = this.getParams();
    const user = this.cu.getUser();

    if (!user) {
      return this.notAuthorized();
    }
    const hasPermission = await this.cu.hasPermission(
      AllowedActionsEnum.CREATE_FAMILY_EXPENSE
    );
    if (!hasPermission) {
      return this.notAuthorized(
        "You dont have permission to create an expense"
      );
    }

    const frequency = new Frequency({
      weekDay: params.weekDay,
      repetition: params.repetition,
      repeatsEvery: params.repeatsEvery,
    });

    const savedFrequency = await frequency.save();
    const expense = new Expense({
      title: params.title.trim(),
      category: params.category.trim(),
      from: params.from,
      until: params.until,
      qty: params.qty,
      belongsTo: user._id,
      frequency: frequency._id
    });
    const savedExpense = await expense.save();

    this.ok({ expense: savedExpense, frequency: savedFrequency});
  }

  protected createWeeklyParams() {
    return Joi.object({
      title: Joi.string().required(),
      category: Joi.string().required(),
      from: Joi.date(),
      until: Joi.date(),
      qty: Joi.number().required(),
      weekDay: Joi.number().min(1).max(7).required(),
      repetition: "WEEKLY",
      repeatsEvery: Joi.number().min(1).required(),
    });
  }

  protected async createMonthly() {
    const params = this.getParams();
    const user = this.cu.getUser();

    if (!user) {
      return this.notAuthorized();
    }
    const hasPermission = await this.cu.hasPermission(
      AllowedActionsEnum.CREATE_FAMILY_EXPENSE
    );
    if (!hasPermission) {
      return this.notAuthorized(
        "You dont have permission to create an expense"
      );
    }

    const frequency = new Frequency({
      weekDay: params.weekDay,
      repetition: params.repetition,
      repeatsEvery: params.repeatsEvery,
    });

    const savedFrequency = await frequency.save();
    const expense = new Expense({
      title: params.title.trim(),
      category: params.category.trim(),
      from: params.from,
      until: params.until,
      qty: params.qty,
      belongsTo: user._id,
      frequency: frequency._id
    });
    const savedExpense = await expense.save();

    this.ok({ expense: savedExpense, frequency: savedFrequency});
  }

  protected createMonthlyParams() {
    return Joi.object({
      title: Joi.string().required(),
      category: Joi.string().required(),
      from: Joi.date(),
      until: Joi.date(),
      qty: Joi.number().required(),
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
    const hasPermission = await this.cu.hasPermission(
      AllowedActionsEnum.DELETE_FAMILY_EXPENSE
    );
    if (!hasPermission) {
      return this.notAuthorized("You are not authorized to delete an expense");
    }
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
