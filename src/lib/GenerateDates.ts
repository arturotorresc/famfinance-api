import moment from "moment";

export class GenerateDates {

  constructor(){}

  protected async createMonthsArray(months: any) {
    let answer = [0,0,0,0,0,0,0,0,0,0,0,0]

    for(let i = 0; i < months.length; i++){
      let month = months[i].toLowerCase();
      switch(month) {
        case "enero":
          answer[0] = 1;
          break;
        case "febrero":
          answer[1] = 1;
          break;
        case "marzo":
          answer[2] = 1;
          break;
        case "abril":
          answer[3] = 1;
          break;
        case "mayo":
          answer[4] = 1;
          break;
        case "junio":
          answer[5] = 1;
          break;
        case "julio":
          answer[6] = 1;
          break;
        case "agosto":
          answer[7] = 1;
          break;
        case "septiembre":
          answer[8] = 1;
          break;
        case "octubre":
          answer[9] = 1;
          break;
        case "noviembre":
          answer[10] = 1;
          break;
        default:
          answer[11] = 1;
          break;
      }
    }

    return answer;
  }

  protected async sameWeekDayRepeatForWeeks(transaction: any, startDate: any, limitDate: any): Promise<any>{
    let currDate = moment(transaction.from), untilDate, weeksRepeat = transaction.frequency.weeksRepeat;
    let dates = new Array();

    if(transaction.until === "") {
      untilDate = moment().add(100, "year");
    } else {
      untilDate = moment(transaction.until);
    }

    while((currDate.isBefore(limitDate) || currDate.isSame(limitDate)) && (currDate.isBefore(untilDate) || currDate.isSame(untilDate))) {
      if(startDate.isBefore(currDate) || startDate.isSame(currDate)) {
        dates.push(currDate);
      }
      currDate = moment(currDate).add(weeksRepeat, "weeks");
    }
    return {"dates": dates, "qty": transaction.qty};
  }

  protected async sameDayRepeatMonths(transaction: any, startDate: any, limitDate: any): Promise<any>{

    let day = transaction.frequency.day, currDate = moment(transaction.from), untilDate, monthsRepeat = transaction.frequency.monthsRepeat;
    let dates = new Array();

    if(transaction.until === "") {
      untilDate = moment().add(100, "year");
    } else {
      untilDate = moment(transaction.until);
    }

    if(currDate.get("day") > day) {
      currDate = currDate.add(1, "month");
    }

    currDate.set({day: day, month: currDate.get("month"), year: currDate.get("year")});

    while((currDate.isBefore(limitDate) || currDate.isSame(limitDate)) && (currDate.isBefore(untilDate) || currDate.isSame(untilDate))) {

      if(startDate.isBefore(currDate) || startDate.isSame(currDate)) {
        dates.push(currDate);
      }
      currDate = moment(currDate).add(monthsRepeat, "month");
    }
    return {"dates": dates, "qty": transaction.qty};
  }

  protected async startEndDayRepeatMonths(transaction: any, startDate: any, limitDate: any): Promise<any>{

    let currDate = moment(transaction.from), type = transaction.frequency.startEndMonth.toLowerCase(), monthsRepeat = transaction.frequency.monthsRepeat;
    let untilDate, dates = new Array();

    if(transaction.until === "") {
      untilDate = moment().add(100, "year");
    } else {
      untilDate = moment(transaction.until);
    }

    if(type === "end") {
      currDate = currDate.endOf("month")
    } else if(type === "start" && currDate.get("day") > 1) {
      currDate = currDate.add(1, "m").startOf("month");
    }

    while((currDate.isBefore(limitDate) || currDate.isSame(limitDate)) && (currDate.isBefore(untilDate) || currDate.isSame(untilDate))) {

      if(startDate.isBefore(currDate) || startDate.isSame(currDate)) {
        dates.push(currDate);
      }

      if(type === "start") {
        currDate = moment(currDate).add(monthsRepeat, "months");
      } else {
        currDate = currDate.add(monthsRepeat, "months").endOf("month");
      }
    }

    return {"dates": dates, "qty": transaction.qty};
  }

  protected async sameDaySelectedMonths(transaction: any, startDate: any, limitDate: any): Promise<any>{

    let months, day = transaction.frequency.day, currDate = moment(transaction.from), untilDate;
    let dates = new Array();

    if(transaction.until === "") {
      untilDate = moment().add(100, "year");
    } else {
      untilDate = moment(transaction.until);
    }

    months = await this.createMonthsArray(transaction.frequency.months);

    if(currDate.format("D") > day) {
      currDate = currDate.add(1, "month");
    }

    currDate = currDate.set("date", day).set("month", currDate.get("month")).set("year", currDate.get("year"))

    while((currDate.isBefore(limitDate) || currDate.isSame(limitDate)) && (currDate.isBefore(untilDate) || currDate.isSame(untilDate))) {
      if((startDate.isBefore(currDate) || startDate.isSame(currDate) ) && months[currDate.get("month")]) {
        dates.push(currDate);
      }
      currDate = moment(currDate).add(1, "month");
    }

    return {"dates": dates, "qty": transaction.qty};
  }

  protected async startEndDaySelectedMonths(transaction: any, startDate: any, limitDate: any): Promise<any>{

    let months = [0,0,0,0,0,0,0,0,0,0,0,0], currDate = moment(transaction.from), type = transaction.frequency.startEndMonth.toLowerCase();
    let untilDate, dates = new Array();

    if(transaction.until === "") {
      untilDate = moment().add(100, "year");
    } else {
      untilDate = moment(transaction.until);
    }

    months = await this.createMonthsArray(transaction.frequency.months);

    if(type === "end") {
      currDate = currDate.endOf("month")
    }

    while((currDate.isBefore(limitDate) || currDate.isSame(limitDate)) && (currDate.isBefore(untilDate) || currDate.isSame(untilDate))) {

      if((startDate.isBefore(currDate) || startDate.isSame(currDate) ) && months[currDate.get("month")]) {
        dates.push(currDate);
      }

      if(type === "start") {
        currDate = moment(currDate).add(1, "month");
      } else {
        currDate = currDate.add(1, "month").endOf("month");
      }
    }

    return {"dates": dates, "qty": transaction.qty};
  }

  protected async oneTime(transaction: any, startDate: any, limitDate: any): Promise<any>{
    let dates = new Array(), currDate = moment(transaction.from), untilDate;

    if(transaction.until === "") {
      untilDate = moment().add(100, "year");
    } else {
      untilDate = moment(transaction.until);
    }

    if((currDate.isBefore(limitDate) || currDate.isSame(limitDate)) && (currDate.isBefore(untilDate) || currDate.isSame(untilDate))) {
      if(startDate.isBefore(currDate) || startDate.isSame(currDate)) {
        dates.push(currDate);
      }
    }

    return dates;
  }

  async generateDatesWithinIntervals(transaction: any, startDate: any, limitDate: any): Promise<any[]> {
    let frequencyType = transaction.frequency.frequencyType;

    if(frequencyType === "SameWeekDayRepeatForWeeks") {
      return await this.sameWeekDayRepeatForWeeks(transaction, startDate, limitDate);
    } else if(frequencyType === "StartEndDayRepeatMonths"){
      return await this.startEndDayRepeatMonths(transaction, startDate, limitDate);
    } else if(frequencyType === "StartEndDaySelectedMonths"){
      return await this.startEndDaySelectedMonths(transaction, startDate, limitDate);
    } else if(frequencyType === "SameDayRepeatMonths"){
      return await this.sameDayRepeatMonths(transaction, startDate, limitDate);
    } else if(frequencyType === "SameDaySelectedMonths") {
      return await this.sameDaySelectedMonths(transaction, startDate, limitDate);
    } else if(frequencyType === "OneTime") {
      return await this.oneTime(transaction, startDate, limitDate);
    }
    return [];
  }

}
