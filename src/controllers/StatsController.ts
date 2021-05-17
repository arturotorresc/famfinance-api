import BaseController, { IArgs } from "./BaseController";
import Income from "../models/income";
import Expense from "../models/expense";
import Joi from "joi";
import { WeeklyStats } from "../lib/WeeklyStats";
import { MonthlyStats } from "../lib/MonthlyStats";
import { YearlyStats } from "../lib/YearlyStats";

const weeks = 6;
const months = 6;
const years = 6;
interface IStatsArgs extends IArgs {}

export default class StatsController extends BaseController {
  constructor(args: IStatsArgs) {
    super(args);
  }

  protected async weekly() {
    const user = this.cu.getUser();

    if (!user) {
      return this.notAuthorized();
    }

    const incomes = await Income.find({ belongsTo: user.id })
      .populate("frequency")
      .exec();
    const expenses = await Expense.find({ belongsTo: user.id })
      .populate("frequency")
      .exec();

    let length =
      this.req.query.length && typeof this.req.query.length == "string"
        ? parseInt(this.req.query.length)
        : 6;
    let weeklyStats = new WeeklyStats(incomes, expenses, length);

    return this.res.status(200).json({
      weeklyStats: weeklyStats.stats(),
    });
  }

  protected async monthly() {
    const user = this.cu.getUser();

    if (!user) {
      return this.notAuthorized();
    }

    const incomes = await Income.find({ belongsTo: user.id })
      .populate("frequency")
      .exec();
    const expenses = await Expense.find({ belongsTo: user.id })
      .populate("frequency")
      .exec();

    let monthlyStats = new MonthlyStats(incomes, expenses);

    return this.res.status(200).json({
      monthlyStats: await monthlyStats.stats(),
    });
  }

  protected async yearly() {
    const user = this.cu.getUser();

    if (!user) {
      return this.notAuthorized();
    }

    const incomes = await Income.find({ belongsTo: user.id })
      .populate("frequency")
      .exec();
    const expenses = await Expense.find({ belongsTo: user.id })
      .populate("frequency")
      .exec();

    let yearlyStats = new YearlyStats(incomes, expenses);

    return this.res.status(200).json({
      monthlyStats: await yearlyStats.stats(),
    });
  }

  protected weeklyParams() {
    return Joi.object({
      id: Joi.string().optional(),
      length: Joi.string().optional(),
    });
  }

  protected monthlyParams() {
    return Joi.object({
      id: Joi.string().optional(),
    });
  }

  protected yearlyParams() {
    return Joi.object({
      id: Joi.string().optional(),
    });
  }

  protected calculateWeeklyIncomeParams() {
    return Joi.object({});
  }
}
