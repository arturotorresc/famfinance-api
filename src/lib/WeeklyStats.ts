import moment from "moment";
import { GenerateDates } from "./GenerateDates";

export class WeeklyStats {
  noOfWeeks = 6;
  incomes: any[] = [];
  expenses: any[] = [];
  generateDates = new GenerateDates();

  constructor(incomes: any, expenses: any, length: number) {
    this.incomes = incomes;
    this.expenses = expenses;
    this.noOfWeeks = length;
  }

  protected getLimitDateWeekly(): any {
    return moment().day(7).add(this.noOfWeeks, "w");
  }

  protected calculateQtyPerWeek(transaction: any): number[] {
    let datesIndex = 0;
    let intervalIndex = 0;
    let dates = transaction.dates;
    let qty = transaction.qty;
    let ans = new Array(this.noOfWeeks).fill(0);
    let intervalStart = moment().day(1);
    let intervalEnd = moment().day(7);

    while (datesIndex < dates.length) {
      if (
        dates[datesIndex].isBefore(intervalEnd) ||
        dates[datesIndex].isSame(intervalEnd)
      ) {
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

  weeklyStats(type: string): number[] {
    let transactions = type == "income" ? this.incomes : this.expenses;
    let answer = new Array(this.noOfWeeks).fill(0);
    let limitDate = this.getLimitDateWeekly();
    let nextDates: { [name: string]: any }[] = [];

    for (let i = 0; i < transactions.length; i++) {
      let tmp = this.generateDates.generateDatesWithinIntervals(
        transactions[i],
        moment().day(1),
        limitDate
      );
      nextDates.push(tmp);
    }

    for (let i = 0; i < nextDates.length; i++) {
      if (nextDates[i]["dates"].length > 0) {
        let qtyPerWeek = this.calculateQtyPerWeek(nextDates[i]);

        for (let j = 0; j < this.noOfWeeks; j++) {
          answer[j] += type == "income" ? qtyPerWeek[j] : -qtyPerWeek[j];
        }
      }
    }

    return answer;
  }

  stats(): any[] {
    let weeklyIncome = this.weeklyStats("income");
    let weeklyExpense = this.weeklyStats("expense");

    let stats = new Array(this.noOfWeeks).fill(0);

    for (let i = 0; i < this.noOfWeeks; i++) {
      stats[i] = weeklyIncome[i] + weeklyExpense[i];
    }

    return stats;
  }
}
