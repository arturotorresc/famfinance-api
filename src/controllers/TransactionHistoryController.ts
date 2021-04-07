import BaseController, { IArgs } from "./BaseController";
import Joi from "joi";
import mongodb from "mongodb";
import moment from "moment";
import Expense, { IExpenseDocument } from "../models/expense";
import Income, { IIncomeDocument } from "../models/income";

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
    const history: IExpenseDocument[] = [];
    expenses.forEach((e) => {
      const now = moment();
      if (!e.from) {
        history.push(e);
      } else if (e.from && !e.until) {
        const date = moment(e.from);
        if (date.isBefore(now)) {
          history.push(e);
        }
      }
      // TODO: CONSIDER RECURRING EXPENSES.
    });
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
    const history: IIncomeDocument[] = [];
    incomes.forEach((i) => {
      const now = moment();
      if (!i.from) {
        history.push(i);
      } else if (i.from && !i.until) {
        const date = moment(i.from);
        if (date.isBefore(now)) {
          history.push(i);
        }
      }
      // TODO: CONSIDER RECURRING incomes.
    });
    this.ok({ incomes: history });
  }

  private incomeHistoryParams() {
    return Joi.object({});
  }
}
