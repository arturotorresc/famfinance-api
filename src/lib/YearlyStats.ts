import Income from "../models/income";
import Expense from "../models/expense";
import Frequency from "../models/frequency";
import Joi from "joi";
import moment from "moment";
import { GenerateDates } from "./GenerateDates";

export class YearlyStats {

  noOfYears = 6;
  incomes = null;
  expenses = null;
  generateDates = new GenerateDates();

  constructor(incomes: any, expenses: any){
    this.incomes = incomes;
    this.expenses = expenses;
  };

  protected async getLimitDateYearly(): Promise<any> {

    let lastDay = moment().endOf("year");

    for(let i = 1; i < this.noOfYears; i++) {
      lastDay = lastDay.add(1, "y");
    }

    return lastDay;
  }

  protected async calculateQtyPerYear(transaction: any): Promise<any> {
    let datesIndex = 0, intervalIndex = 0, dates = transaction.dates, qty = transaction.qty;
    let ans = new Array(this.noOfYears), intervalStart = moment().startOf("year"), intervalEnd = moment().endOf("year");

    for(let i = 0; i < this.noOfYears; i++){
      ans[i] = 0;
    }

    while(datesIndex < dates.length) {
      if(dates[datesIndex].isBefore(intervalEnd) || dates[datesIndex].isSame(intervalEnd)) {
        ans[intervalIndex] += qty;
        datesIndex++;
      } else {
        intervalStart = intervalStart.add(1, "year");
        intervalEnd = intervalEnd.add(1, "year").endOf("year");
        intervalIndex++;
      }
    }
    return ans;
  }

  protected async yearlyStats(
    transactions: any,
    type: any
  ): Promise<number[]> {

    let answer = new Array(this.noOfYears, 0), limitDate = await this.getLimitDateYearly(), nextDates = [];

    for(let i = 0; i < this.noOfYears; i++){
      answer[i] = 0
    }

    for (let i = 0; i < transactions.length; i++) {
      nextDates.push(await this.generateDates.generateDatesWithinIntervals(transactions[i], moment().startOf("year"), limitDate));
    }

    for(let i = 0; i < nextDates.length; i++) {
      let qtyPerYear = await this.calculateQtyPerYear(nextDates[i]);

      for(let j = 0; j < this.noOfYears; j++) {
        if(type === "income") {
          answer[j] = answer[j] + qtyPerYear[j]
        } else {
          answer[j] = answer[j] - qtyPerYear[j]
        }
      }
    }

    return answer;
  }

  async stats(): Promise<any[]> {

    let yearlyIncome = await this.yearlyStats(this.incomes, "income");
    let yearlyExpense = await this.yearlyStats(this.expenses,"expense");
    let stats = new Array(this.noOfYears);

    for (let i = 0; i < this.noOfYears; i++) {
      stats[i] = yearlyIncome[i] + yearlyExpense[i];
    }

    return stats
  }
}
