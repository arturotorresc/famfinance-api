import moment from "moment";
import { GenerateDates } from "./GenerateDates";

export class YearlyStats {
  noOfYears = 5;
  incomes: any[] = [];
  expenses: any[] = [];
  generateDates = new GenerateDates();

  constructor(incomes: any, expenses: any) {
    this.incomes = incomes;
    this.expenses = expenses;
  }

  protected getLimitDateYearly(): any {
    return moment()
      .startOf("year")
      .add(this.noOfYears - 1, "year")
      .endOf("year");
  }

  protected calculateQtyPerYear(transaction: any): number[] {
    let datesIndex = 0;
    let intervalIndex = 0;
    let dates = transaction.dates;
    let qty = transaction.qty;
    let ans = new Array(this.noOfYears).fill(0);
    let intervalStart = moment().startOf("year");
    let intervalEnd = moment().endOf("year");

    while (datesIndex < dates.length) {
      if (
        dates[datesIndex].isBefore(intervalEnd) ||
        dates[datesIndex].isSame(intervalEnd)
      ) {
        ans[intervalIndex] += qty;
        datesIndex++;
      } else {
        intervalStart = intervalStart.add(1, "year");
        intervalEnd = intervalEnd.startOf("year").add(1, "year").endOf("year");
        intervalIndex++;
      }
    }
    return ans;
  }

  protected yearlyStats(type: any): number[] {
    let transactions = type == "income" ? this.incomes : this.expenses;
    let answer = new Array(this.noOfYears).fill(0);
    let limitDate = this.getLimitDateYearly();
    let nextDates: { [name: string]: any }[] = [];

    for (let i = 0; i < transactions.length; i++) {
      let tmp = this.generateDates.generateDatesWithinIntervals(
        transactions[i],
        moment().startOf("year"),
        limitDate
      );
      nextDates.push(tmp);
    }

    for (let i = 0; i < nextDates.length; i++) {
      let qtyPerYear = this.calculateQtyPerYear(nextDates[i]);

      for (let j = 0; j < this.noOfYears; j++) {
        answer[j] += type == "income" ? qtyPerYear[j] : -qtyPerYear[j];
      }
    }

    return answer;
  }

  stats(): any[] {
    let yearlyIncome = this.yearlyStats("income");
    let yearlyExpense = this.yearlyStats("expense");
    let stats = new Array(this.noOfYears).fill(0);

    for (let i = 0; i < this.noOfYears; i++) {
      stats[i] = yearlyIncome[i] + yearlyExpense[i];
    }

    return stats;
  }
}
