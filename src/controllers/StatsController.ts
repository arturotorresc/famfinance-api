import BaseController, { IArgs } from "./BaseController";
import Income from "../models/income";
import Expense from "../models/expense";
import Frequency from "../models/frequency";
import Joi from "joi";
import moment from "moment";

const weeks = 8;

interface IStatsArgs extends IArgs {}

export default class StatsController extends BaseController {
  constructor(args: IStatsArgs) {
    super(args);
  }

  protected async calculateWeeklyTransaction(
    transactions: any,
    type: any
  ): Promise<number[]> {
    let answer = new Array(weeks);

    for (let i = 0; i < weeks; i++) {
      answer[i] = 0;
    }

    for (let i = 0; i < transactions.length; i++) {
      let repeatsEveryNWeeks = transactions[i].frequency.repeatsEvery;
      const repetition = transactions[i].frequency.repetition;
      const startDate = transactions[i].from;
      const endDate = transactions[i].until;
      const qty = transactions[i].qty;

      if (repetition == "MONTHLY") {
        repeatsEveryNWeeks *= 4;
        continue;
      }
      let sunday = moment().day(7);
      let monday = moment().day(1);

      for (let j = 0; j < weeks; j++) {
        if (moment(endDate).isBefore(monday)) {
          break;
        }
        const weeksSinceStart = sunday.diff(startDate, "week");
        if (weeksSinceStart % repeatsEveryNWeeks === 0) {
          if (type === "Income") {
            answer[j] += qty;
          } else {
            answer[j] -= qty;
          }
        }
        monday = monday.add(7, "d");
        sunday = sunday.add(7, "d");
      }
    }

    return answer;
  }

  protected async weekly() {
    const user = this.cu.getUser();
    const params = this.getParams();

    if (!user) {
      return this.notAuthorized();
    }

    const incomes = await Income.find({ belongsTo: user.id })
      .populate("frequency")
      .exec();
    const expenses = await Expense.find({ belongsTo: user.id })
      .populate("frequency")
      .exec();

    let weeklyIncome = await this.calculateWeeklyTransaction(incomes, "Income");
    let weeklyExpense = await this.calculateWeeklyTransaction(
      expenses,
      "Expense"
    );
    let result = new Array(weeks);

    console.log(typeof weeklyIncome);
    for (let i = 0; i < weeks; i++) {
      result[i] = weeklyExpense[i] + weeklyIncome[i];
    }

    return this.res.status(200).json({
      weeklyStats: result,
    });
  }

  protected weeklyParams() {
    return Joi.object({
      id: Joi.string().optional(),
    });
  }

  protected calculateWeeklyIncomeParams() {
    return Joi.object({});
  }
}
