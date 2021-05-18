import moment from "moment";
import { IFrequencyDocument } from "../models/Frequency";
import {
  FrequencyType,
  TTransactionChartData,
} from "../controllers/TransactionHistoryController";

interface IArgs {
  freqType: FrequencyType;
  startDate: Date;
  endDate: Date;
  frequency: any;
  qty: number;
}

export class TransactionGenerator {
  private qty: number;
  private frequency: IFrequencyDocument;
  private freqType: FrequencyType;
  private startDate: moment.Moment;
  private endDate: moment.Moment;
  private now: moment.Moment;

  constructor(args: IArgs) {
    this.qty = args.qty;
    this.frequency = args.frequency;
    this.freqType = args.freqType;
    this.now = moment();
    this.startDate = moment(args.startDate);
    const endDate = moment(args.endDate);
    const endDateToConsider = endDate.isAfter(this.now) ? this.now : endDate;
    // We only want to generate transactions that have already occurred;
    this.endDate = endDateToConsider;
  }

  public getTransactions(): TTransactionChartData {
    if (this.startDate.isAfter(this.now)) {
      return [];
    }

    switch (this.freqType) {
      case FrequencyType.SameDayRepeatMonths:
        return this.getSameDayRepeatMonths();
      case FrequencyType.SameDaySelectedMonths:
        return this.getSameDaySelectedMonths();
      case FrequencyType.SameWeekDayRepeatForWeeks:
        return this.getSameWeekDayRepeatForWeeks();
      case FrequencyType.StartEndDayRepeatMonths:
        return this.getStartEndDayRepeatMonths();
      case FrequencyType.StartEndDaySelectedMonths:
        return this.getStartEndDaySelectedMonths();
      default:
        return [];
    }
  }

  private getSameDayRepeatMonths(): TTransactionChartData {
    const transactions: TTransactionChartData = [];
    const skipMonths = this.frequency.monthsRepeat;
    let movingDate = this.startDate;
    while (movingDate.isSameOrBefore(this.endDate)) {
      transactions.push({ from: movingDate.toDate(), qty: this.qty });
      movingDate.add(skipMonths as number, "months");
    }
    return transactions;
  }

  private getSameDaySelectedMonths(): TTransactionChartData {
    const transactions: TTransactionChartData = [];
    let movingDate = this.startDate;
    const selectedMonths = this.frequency.months as unknown;
    const selectedDay = this.frequency.day;
    while (movingDate.isSameOrBefore(this.endDate)) {
      const day = movingDate.day();
      const month = movingDate.month();
      const year = movingDate.year();
      const dateToAdd = movingDate.toDate();
      movingDate.add(1, "months");
      if (!this.isInMonth(month, selectedMonths as string[])) {
        continue;
      }
      if (month === this.endDate.month() && year === this.endDate.year()) {
        if (day > selectedDay) {
          continue;
        }
        transactions.push({ from: dateToAdd, qty: this.qty });
      } else {
        transactions.push({ from: dateToAdd, qty: this.qty });
      }
    }
    return transactions;
  }

  private getSameWeekDayRepeatForWeeks(): TTransactionChartData {
    const transactions: TTransactionChartData = [];
    const skipWeeks = this.frequency.weeksRepeat as number;
    let movingDate = this.startDate;
    while (movingDate.isSameOrBefore(this.endDate)) {
      transactions.push({ from: movingDate.toDate(), qty: this.qty });
      movingDate.add(skipWeeks, "weeks");
    }
    return transactions;
  }

  private getStartEndDayRepeatMonths(): TTransactionChartData {
    const transactions: TTransactionChartData = [];
    const skipMonths = this.frequency.monthsRepeat;
    let movingDate = this.startDate;
    while (movingDate.isSameOrBefore(this.endDate)) {
      transactions.push({ from: movingDate.toDate(), qty: this.qty });
      movingDate.add(skipMonths as number, "months");
    }
    return transactions;
  }

  private getStartEndDaySelectedMonths(): TTransactionChartData {
    const transactions: TTransactionChartData = [];
    const skipMonths = this.frequency.monthsRepeat;
    const selectedMonths = this.frequency.months as unknown;
    let movingDate = this.startDate;
    while (movingDate.isSameOrBefore(this.endDate)) {
      const month = movingDate.month();
      const dateToAdd = movingDate.toDate();
      movingDate.add(skipMonths as number, "months");
      if (!this.isInMonth(month, selectedMonths as string[])) {
        continue;
      }
      transactions.push({ from: dateToAdd, qty: this.qty });
    }
    return transactions;
  }

  private isInMonth(numberMonth: number, months: string[]): boolean {
    switch (numberMonth) {
      case 0:
        return months.some((val) => val.toLowerCase() === "enero");
      case 1:
        return months.some((val) => val.toLowerCase() === "febrero");
      case 2:
        return months.some((val) => val.toLowerCase() === "marzo");
      case 3:
        return months.some((val) => val.toLowerCase() === "abril");
      case 4:
        return months.some((val) => val.toLowerCase() === "mayo");
      case 5:
        return months.some((val) => val.toLowerCase() === "junio");
      case 6:
        return months.some((val) => val.toLowerCase() === "julio");
      case 7:
        return months.some((val) => val.toLowerCase() === "agosto");
      case 8:
        return months.some((val) => val.toLowerCase() === "septiembre");
      case 9:
        return months.some((val) => val.toLowerCase() === "octubre");
      case 10:
        return months.some((val) => val.toLowerCase() === "noviembre");
      case 11:
        return months.some((val) => val.toLowerCase() === "diciembre");
      default:
        return false;
    }
  }
}
