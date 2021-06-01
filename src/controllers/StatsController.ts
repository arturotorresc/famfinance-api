import BaseController, { IArgs } from "./BaseController";
import Joi from "joi";
import { WeeklyStats } from "../lib/WeeklyStats";
import { MonthlyStats } from "../lib/MonthlyStats";
import { YearlyStats } from "../lib/YearlyStats";
import { findFamilyExpenses, findFamilyIncomes } from "../DBAccessLayer";

interface IStatsArgs extends IArgs {}

export default class StatsController extends BaseController {
  constructor(args: IStatsArgs) {
    super(args);
  }

  protected async weekly() {
    const user = this.cu.getUser();

    if (!user) {
      return this.notAuthorized();
    }

    const family = await this.cu.getFamily();
    if (!family) {
      return this.notAuthorized();
    }
    const memberIds = [family.admin];
    family.members.forEach((memberId) => {
      memberIds.push(memberId);
    });

    const incomes = await findFamilyIncomes(memberIds);
    const expenses = await findFamilyExpenses(memberIds);

    let length =
      this.req.query.length && typeof this.req.query.length == "string"
        ? parseInt(this.req.query.length)
        : 10;
    let weeklyStats = new WeeklyStats(incomes, expenses, length);

    return this.res.status(200).json({
      weeklyStats: weeklyStats.stats(),
    });
  }

  protected async monthly() {
    const user = this.cu.getUser();

    if (!user) {
      return this.notAuthorized();
    }

    const family = await this.cu.getFamily();
    if (!family) {
      return this.notAuthorized();
    }
    const memberIds = [family.admin];
    family.members.forEach((memberId) => {
      memberIds.push(memberId);
    });

    const incomes = await findFamilyIncomes(memberIds);
    const expenses = await findFamilyExpenses(memberIds);

    let monthlyStats = new MonthlyStats(incomes, expenses);

    return this.res.status(200).json({
      monthlyStats: monthlyStats.stats(),
    });
  }

  protected async yearly() {
    const user = this.cu.getUser();

    if (!user) {
      return this.notAuthorized();
    }

    const family = await this.cu.getFamily();
    if (!family) {
      return this.notAuthorized();
    }
    const memberIds = [family.admin];
    family.members.forEach((memberId) => {
      memberIds.push(memberId);
    });

    const incomes = await findFamilyIncomes(memberIds);
    const expenses = await findFamilyExpenses(memberIds);

    let yearlyStats = new YearlyStats(incomes, expenses);

    return this.res.status(200).json({
      yearlyStats: yearlyStats.stats(),
    });
  }

  protected weeklyParams() {
    return Joi.object({
      length: Joi.string().optional(),
    });
  }

  protected monthlyParams() {
    return Joi.object({
      id: Joi.string().optional(),
    });
  }

  protected yearlyParams() {
    return Joi.object({
      id: Joi.string().optional(),
    });
  }

  protected calculateWeeklyIncomeParams() {
    return Joi.object({});
  }
}
