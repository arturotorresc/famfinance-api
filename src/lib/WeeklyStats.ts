import Income from "../models/income";
import Expense from "../models/expense";
import Frequency from "../models/frequency";
import Joi from "joi";
import moment from "moment";
import { GenerateDates } from "./GenerateDates";


export class WeeklyStats {

  noOfWeeks = 6;
  incomes = null;
  expenses = null;
  generateDates = new GenerateDates();

  constructor(incomes: any, expenses: any){
    this.incomes = incomes;
    this.expenses = expenses;
  };

  protected async getLimitDateWeekly(): Promise<any> {

    let lastDay = moment().day(7);

    for(let i = 1; i < this.noOfWeeks; i++) {
      lastDay = lastDay.add(1, "w");
    }

    return lastDay;
  }

  protected async calculateQtyPerWeek(transaction: any): Promise<any> {

    let datesIndex = 0, intervalIndex = 0, dates = transaction.dates, qty = transaction.qty, ans = new Array(this.noOfWeeks);
    let intervalStart = moment().day(1), intervalEnd = moment().day(7);

    for(let i = 0; i < this.noOfWeeks; i++) {
      ans[i] = 0;
    }

    while(datesIndex < dates.length) {
      if(dates[datesIndex].isBefore(intervalEnd) || dates[datesIndex].isSame(intervalEnd)) {
        ans[intervalIndex] += qty;
        datesIndex++;
      } else {
        intervalStart = intervalStart.add(1, "week");
        intervalEnd = intervalEnd.add(1, "week");
        intervalIndex++;
      }
    }
    return ans;
  }

  async weeklyStats(
    transactions: any,
    type: any
  ): Promise<number[]> {

    let answer = new Array(this.noOfWeeks), limitDate = await this.getLimitDateWeekly(), nextDates = [];

    for(let i = 0; i < this.noOfWeeks; i++){
      answer[i] = 0
    }

    for (let i = 0; i < transactions.length; i++) {
      nextDates.push(await this.generateDates.generateDatesWithinIntervals(transactions[i], moment().day(1), limitDate));
    }

    for(let i = 0; i < nextDates.length; i++) {
      let qtyPerWeek = await this.calculateQtyPerWeek(nextDates[i]);

      for(let j = 0; j < this.noOfWeeks; j++) {
        if(type === "income") {
          answer[j] = answer[j] + qtyPerWeek[j]
        } else {
          answer[j] = answer[j] - qtyPerWeek[j]
        }
      }
    }

    return answer;
  }

  async stats(): Promise<any[]> {
    let weeklyIncome = await this.weeklyStats(this.incomes, "income");
    let weeklyExpense = await this.weeklyStats(this.expenses, "expense");

    let stats = new Array(this.noOfWeeks);

    for (let i = 0; i < this.noOfWeeks; i++) {
      stats[i] = weeklyIncome[i] + weeklyExpense[i];
    }

    return stats
  }
}
