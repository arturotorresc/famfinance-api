import BaseController, { IArgs } from "./BaseController";
import Income from "../models/income";
import Expense from "../models/expense";
import Frequency from "../models/frequency";
import Joi from "joi";
import moment from "moment";

const weeks = 8;

interface IStatsArgs extends IArgs {}

/**
 * Example controller that responds a 200
 */
export default class StatsController extends BaseController {
  constructor(args: IStatsArgs) {
    super(args);
  }


  protected async calculateWeeklyTransaction(incomes: any, type: any) {

    let answer = new Array(weeks);

    for(let i = 0; i < weeks; i++) {
      answer[i] = 0;
    }

    for(let i = 0; i < incomes.length; i++) {
      let repeatsEvery = incomes[i].frequency.repeatsEvery;
      const repetition = incomes[i].frequency.repetition;
      const startDate = incomes[i].from;
      const endDate = incomes[i].until;
      const qty = incomes[i].qty;

      if(repetition == "MONTHLY") {
        repeatsEvery *= 4;
        continue;
      }
      let sunday = moment().day(7);
      let monday = moment().day(1);

      for(let j = 0; j < weeks; j++) {
        if(moment(endDate).isBefore(monday)) {
          break;
        }
        const weeksSinceStart = sunday.diff(startDate, "week");
        if(weeksSinceStart % repeatsEvery === 0) {
          if(type === "Income") {
            answer[j] += qty;
          } else {
            answer[j] -= qty;
          }
        }
        monday = monday.add(7, 'd');
        sunday = sunday.add(7, 'd');
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

    let incomes = await Income.find({belongsTo: user.id}).populate('frequency').exec();
    let expenses = await Expense.find({belongsTo: user.id}).populate('frequency').exec();

    let weeklyIncome = this.calculateWeeklyTransaction(incomes, "Income");
    let weeklyExpense = this.calculateWeeklyTransaction(incomes, "Expense");

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
