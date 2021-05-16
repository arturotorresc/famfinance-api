import BaseController, { IArgs } from "./BaseController";
import Goal from "../models/goal";
import Income from "../models/income";
import Expense from "../models/expense";
import { WeeklyStats } from "../lib/WeeklyStats";
import Joi from "joi";
import moment from "moment";

interface ISavingsPlanArgs extends IArgs {}

function computePlanRequirements(stats: any[], goals: any[]): number[] {
  if (goals.length == 0 || stats.length == 0) return [];
  let curGoalIdx = 0;
  let weekEnd = moment().endOf("week");
  let statsIdx = 0;
  let ans = [];

  let currentProfit = stats[0];
  while (curGoalIdx < goals.length && statsIdx < stats.length) {
    // check if this goal falls in this week
    let curGoal = moment(goals[curGoalIdx].deadline);
    if (curGoal.isSameOrBefore(weekEnd)) {
      if (goals[curGoalIdx].qty > currentProfit) {
        ans.push(goals[curGoalIdx].qty - currentProfit);
        currentProfit = 0;
      } else {
        ans.push(0);
        currentProfit -= goals[curGoalIdx].qty;
      }
      curGoalIdx += 1;
    } else {
      currentProfit += stats[statsIdx];
      statsIdx += 1;
    }
  }
  curGoalIdx = ans.length;
  while (curGoalIdx < goals.length) {
    if (goals[curGoalIdx].qty > currentProfit) {
      ans.push(goals[curGoalIdx].qty - currentProfit);
      currentProfit = 0;
    } else {
      ans.push(0);
      currentProfit -= goals[curGoalIdx].qty;
    }
    curGoalIdx += 1;
  }

  return ans;
}

function tryTargetOnStats(
  stats: any[],
  target: number,
  contrib: number,
  limitIdx: number
): boolean {
  let curSaving = 0.0;
  for (let idx = 0; idx < Math.min(stats.length, limitIdx + 1); idx++) {
    curSaving += Math.min(stats[idx], contrib);
  }
  return curSaving + 0.001 > target;
}

function getWeeklyContribution(
  stats: any[],
  target: number,
  limitIdx: number
): number {
  let minContrib = 0.0;
  let maxContrib = target;
  while (maxContrib - minContrib > 0.001) {
    let medContrib = (maxContrib + minContrib) / 2.0;
    if (tryTargetOnStats(stats, target, medContrib, limitIdx)) {
      maxContrib = medContrib;
    } else {
      minContrib = medContrib;
    }
  }
  return (minContrib + maxContrib) / 2.0;
}

function getSavingsDistributionForGoal(
  stats: any[],
  goal: any,
  requirement: number,
  limitIdx: number
): any[] {
  let ans = new Array(stats.length).fill(0.0);
  let targetGoalQty = goal.qty - requirement;
  let weeklyContribution = getWeeklyContribution(
    stats,
    targetGoalQty,
    limitIdx
  );
  for (let idx = 0; idx < Math.min(stats.length, limitIdx + 1); idx++) {
    ans[idx] = Math.min(weeklyContribution, stats[idx]);
  }
  return ans;
}

function getWeekDeadlineIdx(deadline: moment.Moment): number {
  let idx = 0;
  let weekEnd = moment().startOf("week").add(1, "week");
  while (!deadline.isBefore(weekEnd)) {
    idx += 1;
    weekEnd = weekEnd.add(1, "week");
  }
  return idx;
}

function computeSavingsPlan(
  stats: any[],
  goals: any[],
  requirements: number[]
) {
  if (goals.length == 0 || stats.length == 0) return [];
  let ans = new Array(stats.length);
  for (let idx = 0; idx < ans.length; idx++) {
    ans[idx] = {
      contributions: [],
    };
  }
  for (let idx = 0; idx < goals.length; idx++) {
    let limitIdx = getWeekDeadlineIdx(moment(goals[idx].deadline));
    const res = getSavingsDistributionForGoal(
      stats,
      goals[idx],
      requirements[idx],
      limitIdx
    );
    // update stats with the new budget after applying res and add res's values to the answer
    for (let j = 0; j < res.length; j++) {
      stats[j] -= res[j];
      ans[j].contributions.push({
        contribution: res[j],
        goal_title: goals[idx].title,
      });
    }
  }
  return ans;
}

export default class SavingsPlanController extends BaseController {
  constructor(args: ISavingsPlanArgs) {
    super(args);
  }

  protected async computeWeeklyPlan() {
    const user = this.cu.getUser();
    if (user === null) {
      return this.notAuthorized();
    }

    const incomes = await Income.find({ belongsTo: user.id })
      .populate("frequency")
      .exec();
    const expenses = await Expense.find({ belongsTo: user.id })
      .populate("frequency")
      .exec();

    let length =
      this.req.query.length && typeof this.req.query.length == "string"
        ? parseInt(this.req.query.length)
        : 6;
    let weeklyStats = new WeeklyStats(incomes, expenses, length);

    let stats = weeklyStats.stats();
    let goals: any[] = await Goal.find({ belongsTo: user.id }).exec();
    let curWeek = moment().subtract(1, "week").endOf("week");
    for (let idx = 0; idx < stats.length; idx++) {
      if (stats[idx] < 0) {
        goals.push({
          deadline: curWeek.toDate(),
          qty: -stats[idx],
          title: `Cubrir gastos de la semana del ${curWeek
            .add(1, "week")
            .startOf("week")
            .toDate()
            .toLocaleDateString("es-MX")} al ${curWeek
            .endOf("week")
            .toDate()
            .toLocaleDateString("es-MX")}`,
        });
        stats[idx] = 0;
      }
      curWeek = curWeek.add(1, "week");
    }
    goals.sort(function (a, b) {
      if (a.deadline > b.deadline) return 1;
      else return -1;
    });
    goals = goals.filter(function (goal) {
      return moment(goal.deadline).isSameOrAfter(moment().startOf("week"));
    });

    let requirements = computePlanRequirements(stats, goals);
    let planDistribution = computeSavingsPlan(stats, goals, requirements);
    let planRequirements = requirements.map((reqQty, idx) => {
      return {
        qty: reqQty,
        title: goals[idx].title,
        deadline: moment(goals[idx].deadline).startOf("week").toDate(),
      };
    });

    return this.res.status(200).json({
      requirements: planRequirements,
      plan: planDistribution,
    });
  }

  protected computeWeeklyPlanParams() {
    return Joi.object({
      length: Joi.number().optional(),
    });
  }
}
