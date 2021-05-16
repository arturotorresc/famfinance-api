import moment from "moment";
import { DAYS_OF_THE_WEEK, MONTHS, FrequencyType } from "../types/dates.type";

export class GenerateDates {
  protected createMonthsArray(months: string[]): number[] {
    let answer = new Array(12).fill(0);
    for (let i = 0; i < months.length; i++) {
      let month = months[i];
      for (let j = 0; j < MONTHS.length; j++) {
        if (month == MONTHS[j]) answer[j] = 1;
      }
    }
    return answer;
  }

  protected sameWeekDayRepeatForWeeks(
    transaction: any,
    startDate: moment.Moment,
    limitDate: moment.Moment
  ): { [name: string]: any } {
    let currDate = moment(transaction.from);
    let untilDate =
      transaction.until === ""
        ? moment().add(100, "year")
        : moment(transaction.until);
    let weekDay = transaction.frequency.weekDay;
    let weeksRepeat = transaction.frequency.weeksRepeat;
    let dates = [];

    let idx = 0;
    while (DAYS_OF_THE_WEEK[idx].toString() != weekDay) {
      idx += 1;
    }

    if (currDate.weekday() > idx) {
      currDate = currDate.add(1, "week").startOf("week").add(idx, "day");
    } else {
      currDate = currDate.startOf("week").add(idx, "day");
    }

    while (
      currDate.isSameOrBefore(limitDate) &&
      currDate.isSameOrBefore(untilDate)
    ) {
      if (startDate.isSameOrBefore(currDate)) {
        dates.push(moment(currDate));
      }
      currDate = moment(currDate).add(weeksRepeat, "weeks");
    }
    return { dates: dates, qty: transaction.qty };
  }

  protected sameDayRepeatMonths(
    transaction: any,
    startDate: moment.Moment,
    limitDate: moment.Moment
  ): { [name: string]: any } {
    let day = transaction.frequency.day;
    let currDate = moment(transaction.from);
    let untilDate =
      transaction.until === ""
        ? moment().add(100, "year")
        : moment(transaction.until);
    let monthsRepeat = transaction.frequency.monthsRepeat;
    let dates = [];

    if (currDate.get("day") > day) {
      currDate = currDate.add(1, "month");
    }

    currDate = currDate.set("date", day);
    while (
      currDate.isSameOrBefore(limitDate) &&
      currDate.isSameOrBefore(untilDate)
    ) {
      if (startDate.isSameOrBefore(currDate)) {
        dates.push(currDate);
      }
      currDate = moment(currDate).add(monthsRepeat, "month");
    }

    return { dates: dates, qty: transaction.qty };
  }

  protected startEndDayRepeatMonths(
    transaction: any,
    startDate: moment.Moment,
    limitDate: moment.Moment
  ): { [name: string]: any } {
    let currDate = moment(transaction.from);
    let type = transaction.frequency.startEndMonth.toLowerCase();
    let monthsRepeat = transaction.frequency.monthsRepeat;
    let untilDate =
      transaction.until === ""
        ? moment().add(100, "year")
        : moment(transaction.until);
    let dates = [];

    if (type === "fin") {
      currDate = currDate.endOf("month");
    } else if (type === "inicio" && currDate.get("day") > 1) {
      currDate = currDate.add(1, "m").startOf("month");
    }

    while (
      currDate.isSameOrBefore(limitDate) &&
      currDate.isSameOrBefore(untilDate)
    ) {
      if (startDate.isSameOrBefore(currDate)) {
        dates.push(moment(currDate));
      }

      if (type === "inicio") {
        currDate = moment(currDate).add(monthsRepeat, "months");
      } else {
        currDate = currDate
          .startOf("month")
          .add(monthsRepeat, "months")
          .endOf("month");
      }
    }

    return { dates: dates, qty: transaction.qty };
  }

  protected sameDaySelectedMonths(
    transaction: any,
    startDate: moment.Moment,
    limitDate: moment.Moment
  ): { [name: string]: any } {
    let months;
    let day = transaction.frequency.day;
    let currDate = moment(transaction.from);
    let untilDate =
      transaction.until === ""
        ? moment().add(100, "year")
        : moment(transaction.until);
    let dates = [];

    months = this.createMonthsArray(transaction.frequency.months);

    if (currDate.format("D") > day) {
      currDate = currDate.add(1, "month");
    }

    currDate = currDate.set("date", day);

    while (
      currDate.isSameOrBefore(limitDate) &&
      currDate.isSameOrBefore(untilDate)
    ) {
      if (startDate.isSameOrBefore(currDate) && months[currDate.get("month")]) {
        dates.push(currDate);
      }
      currDate = moment(currDate).add(1, "month");
    }

    return { dates: dates, qty: transaction.qty };
  }

  protected startEndDaySelectedMonths(
    transaction: any,
    startDate: moment.Moment,
    limitDate: moment.Moment
  ): { [name: string]: any } {
    let months = new Array(12).fill(0);
    let currDate = moment(transaction.from);
    let type = transaction.frequency.startEndMonth.toLowerCase();
    let untilDate =
      transaction.until === ""
        ? moment().add(100, "year")
        : moment(transaction.until);
    let dates = [];

    months = this.createMonthsArray(transaction.frequency.months);

    if (type === "inicio") {
      currDate = currDate.endOf("month");
    }

    while (
      currDate.isSameOrBefore(limitDate) &&
      currDate.isSameOrBefore(untilDate)
    ) {
      if (startDate.isSameOrBefore(currDate) && months[currDate.get("month")]) {
        dates.push(moment(currDate));
      }

      if (type === "fin") {
        currDate = moment(currDate).add(1, "month");
      } else {
        currDate = currDate.add(1, "month").endOf("month");
      }
    }

    return { dates: dates, qty: transaction.qty };
  }

  protected oneTime(
    transaction: any,
    startDate: moment.Moment,
    limitDate: moment.Moment
  ): { [name: string]: any } {
    let dates = [];
    let currDate = moment(transaction.from);
    let untilDate =
      transaction.until === ""
        ? moment().add(100, "year")
        : moment(transaction.until);

    if (
      currDate.isSameOrBefore(limitDate) &&
      currDate.isSameOrBefore(untilDate)
    ) {
      if (startDate.isSameOrBefore(currDate)) {
        dates.push(currDate);
      }
    }

    return { dates: dates, qty: transaction.qty };
  }

  generateDatesWithinIntervals(
    transaction: any,
    startDate: moment.Moment,
    limitDate: moment.Moment
  ): { [name: string]: any } {
    let frequencyType = transaction.frequency.frequencyType;

    if (frequencyType == FrequencyType.SameWeekDayRepeatForWeeks) {
      return this.sameWeekDayRepeatForWeeks(transaction, startDate, limitDate);
    } else if (frequencyType == FrequencyType.StartEndDayRepeatMonths) {
      return this.startEndDayRepeatMonths(transaction, startDate, limitDate);
    } else if (frequencyType == FrequencyType.StartEndDaySelectedMonths) {
      return this.startEndDaySelectedMonths(transaction, startDate, limitDate);
    } else if (frequencyType == FrequencyType.SameDayRepeatMonths) {
      return this.sameDayRepeatMonths(transaction, startDate, limitDate);
    } else if (frequencyType == FrequencyType.SameDaySelectedMonths) {
      return this.sameDaySelectedMonths(transaction, startDate, limitDate);
    } else if (frequencyType == FrequencyType.OneTime) {
      return this.oneTime(transaction, startDate, limitDate);
    }

    return {};
  }
}
