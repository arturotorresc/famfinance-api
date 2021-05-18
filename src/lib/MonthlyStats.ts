import moment from "moment";
import { GenerateDates } from "./GenerateDates";

export class MonthlyStats {
  noOfMonths = 12;
  incomes: any[] = [];
  expenses: any[] = [];
  generateDates = new GenerateDates();

  constructor(incomes: any, expenses: any) {
    this.incomes = incomes;
    this.expenses = expenses;
  }

  protected getLimitDateMonthly(): any {
    return moment()
      .startOf("month")
      .add(this.noOfMonths - 1, "month")
      .endOf("month");
  }

  protected calculateQtyPerMonth(transaction: any): number[] {
    let datesIndex = 0;
    let intervalIndex = 0;
    let dates = transaction.dates;
    let qty = transaction.qty;
    let ans = new Array(this.noOfMonths).fill(0);
    let intervalStart = moment().startOf("month");
    let intervalEnd = moment().endOf("month");

    while (datesIndex < dates.length) {
      if (
        dates[datesIndex].isBefore(intervalEnd) ||
        dates[datesIndex].isSame(intervalEnd)
      ) {
        ans[intervalIndex] += qty;
        datesIndex++;
      } else {
        intervalStart = intervalStart.add(1, "month");
        intervalEnd = intervalEnd
          .startOf("month")
          .add(1, "month")
          .endOf("month");
        intervalIndex++;
      }
    }
    return ans;
  }

  protected monthlyStats(type: string): number[] {
    let transactions = type == "income" ? this.incomes : this.expenses;
    let answer = new Array(this.noOfMonths).fill(0);
    let limitDate = this.getLimitDateMonthly();
    let nextDates: { [name: string]: any }[] = [];

    for (let i = 0; i < transactions.length; i++) {
      let tmp = this.generateDates.generateDatesWithinIntervals(
        transactions[i],
        moment().startOf("month"),
        limitDate
      );
      nextDates.push(tmp);
    }

    for (let i = 0; i < nextDates.length; i++) {
      if (nextDates[i]["dates"].length > 0) {
        let qtyPerMonth = this.calculateQtyPerMonth(nextDates[i]);

        for (let j = 0; j < this.noOfMonths; j++) {
          answer[j] += type == "income" ? qtyPerMonth[j] : -qtyPerMonth[j];
        }
      }
    }

    return answer;
  }

  stats(): any[] {
    let monthlyIncome = this.monthlyStats("income");
    let monthlyExpense = this.monthlyStats("expense");

    let stats = new Array(this.noOfMonths).fill(0);

    for (let i = 0; i < this.noOfMonths; i++) {
      stats[i] = monthlyIncome[i] + monthlyExpense[i];
    }

    return stats;
  }
}
