import BaseController, { IArgs } from "./BaseController";
import Joi from "joi";
import mongodb from "mongodb";
import moment from "moment";
import Expense from "../models/expense";
import Income from "../models/income";
import { TransactionGenerator } from "../lib/TransactionGenerator";

export enum FrequencyType {
  OneTime = "Única ocasión",
  SameWeekDayRepeatForWeeks = "Recurrente: Mismo día de la semana cada N semanas",
  StartEndDayRepeatMonths = "Recurrente: Inicio o fin de mes cada N meses",
  StartEndDaySelectedMonths = "Recurrente: Inicio o fin de mes en meses selectos",
  SameDayRepeatMonths = "Recurrente: Mismo día del mes, cada N meses",
  SameDaySelectedMonths = "Recurrente: Mismo día del mes en meses selectos",
}

export type TTransactionChartData = { from: Date; qty: Number }[];

interface ITransactionHistoryArgs extends IArgs {}

export default class TransactionHistoryController extends BaseController {
  constructor(args: ITransactionHistoryArgs) {
    super(args);
  }

  private async expenseHistory() {
    const family = await this.cu.getFamily();
    if (!family) {
      return this.notAuthorized();
    }
    const memberIds = [family.admin];
    family.members.forEach((memberId) => {
      memberIds.push(memberId);
    });
    const query: { belongsTo: mongodb.ObjectID }[] = [];
    memberIds.forEach((id) => {
      query.push({ belongsTo: id });
    });
    const expenses = await Expense.find({ $or: query })
      .populate("frequency")
      .exec();
    let history: TTransactionChartData = [];
    await Promise.all(
      expenses.map(async (e) => {
        const now = moment();
        if (!e.from) {
          history.push(e);
        } else if (e.from && !e.until) {
          const date = moment(e.from);
          if (date.isBefore(now)) {
            history.push(e);
          }
        } else if (e.frequency) {
          const freq = e.frequency as any;
          const freqType = freq.frequencyType;
          if (freqType === FrequencyType.OneTime) {
            return;
          }
          const transactions = await this.generateTransactions(
            freq,
            freqType,
            e.from,
            e.until,
            e.qty as number
          );
          history = [...history, ...transactions];
        }
      })
    );
    this.ok({ expenses: history });
  }

  private expenseHistoryParams() {
    return Joi.object({});
  }

  private async incomeHistory() {
    const family = await this.cu.getFamily();
    if (!family) {
      return this.notAuthorized();
    }
    const memberIds = [family.admin];
    family.members.forEach((memberId) => {
      memberIds.push(memberId);
    });
    const query: { belongsTo: mongodb.ObjectID }[] = [];
    memberIds.forEach((id) => {
      query.push({ belongsTo: id });
    });
    const incomes = await Income.find({ $or: query })
      .populate("frequency")
      .exec();
    let history: TTransactionChartData = [];
    await Promise.all(
      incomes.map(async (i) => {
        const now = moment();
        if (!i.from) {
          history.push(i);
        } else if (i.from && !i.until) {
          const date = moment(i.from);
          if (date.isBefore(now)) {
            history.push(i);
          }
        } else if (i.frequency) {
          const freq = i.frequency as any;
          const freqType = freq.frequencyType;
          if (freqType === FrequencyType.OneTime) {
            return;
          }
          const transactions = await this.generateTransactions(
            freq,
            freqType,
            i.from,
            i.until,
            i.qty as number
          );
          history = [...history, ...transactions];
        }
      })
    );
    this.ok({ incomes: history });
  }

  private incomeHistoryParams() {
    return Joi.object({});
  }

  // ============================== PRIVATE METHODS =========================
  private async generateTransactions(
    frequency: any,
    frequencyType: FrequencyType,
    startDate: Date,
    endDate: Date,
    qty: number
  ): Promise<TTransactionChartData> {
    const generator = new TransactionGenerator({
      frequency,
      freqType: frequencyType,
      startDate,
      endDate,
      qty,
    });
    return generator.getTransactions();
  }
}
