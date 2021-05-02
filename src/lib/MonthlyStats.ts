import Income from "../models/income";
import Expense from "../models/expense";
import Frequency from "../models/frequency";
import Joi from "joi";
import moment from "moment";
import { GenerateDates } from "./GenerateDates";

export class MonthlyStats {

  noOfMonths = 6;
  incomes = null;
  expenses = null;
  generateDates = new GenerateDates();

  constructor(incomes: any, expenses: any){
    this.incomes = incomes;
    this.expenses = expenses;
  };

  protected async getLimitDateMonthly(): Promise<any> {

    let lastDay = moment().endOf("month");

    for(let i = 1; i < this.noOfMonths; i++) {
      lastDay = lastDay.add(1, "month").endOf("month");
    }

    return lastDay;
  }

  protected async calculateQtyPerMonth(transaction: any): Promise<any> {
    let datesIndex = 0, intervalIndex = 0, dates = transaction.dates, qty = transaction.qty, ans = new Array(this.noOfMonths);
    let intervalStart = moment().startOf("month"), intervalEnd = moment().endOf("month")

    for(let i = 0; i < this.noOfMonths; i++){
      ans[i] = 0;
    }

    while(datesIndex < dates.length) {
      if(dates[datesIndex].isBefore(intervalEnd) || dates[datesIndex].isSame(intervalEnd)) {
        ans[intervalIndex] += qty;
        datesIndex++;
      } else {
        intervalStart = intervalStart.add(1, "month");
        intervalEnd = intervalEnd.add(1, "month").endOf("month");
        intervalIndex++;
      }
    }
    return ans;
  }

  protected async monthlyStats(
    transactions: any,
    type: any
  ): Promise<number[]> {

    let answer = new Array(this.noOfMonths), limitDate = await this.getLimitDateMonthly();
    let nextDates = [];

    for(let i = 0; i < this.noOfMonths; i++){
      answer[i] = 0
    }

    for (let i = 0; i < transactions.length; i++) {
      nextDates.push(await this.generateDates.generateDatesWithinIntervals(transactions[i], moment().startOf("month"), limitDate));
    }

    for(let i = 0; i < nextDates.length; i++) {
      let qtyPerMonth = await this.calculateQtyPerMonth(nextDates[i]);

      for(let j = 0; j < this.noOfMonths; j++) {
        if(type === "income") {
          answer[j] = answer[j] + qtyPerMonth[j]
        } else {
          answer[j] = answer[j] - qtyPerMonth[j]
        }
      }
    }

    return answer;
  }

  async stats(): Promise<any[]> {
    let monthlyIncome = await this.monthlyStats(this.incomes, "income");
    let monthlyExpense = await this.monthlyStats(this.expenses,"expense");

    let stats = new Array(this.noOfMonths);

    for (let i = 0; i < this.noOfMonths; i++) {
      stats[i] = monthlyIncome[i] + monthlyExpense[i];
    }

    return stats
  }
}
