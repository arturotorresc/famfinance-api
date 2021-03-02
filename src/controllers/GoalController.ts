import BaseController, { IArgs } from "./BaseController";
import Goal from "../models/goal";
import Joi from "joi";

interface IGoalArgs extends IArgs {}

export default class GoalController extends BaseController {
  constructor(args: IGoalArgs) {
    super(args);
  }

  protected async create() {
    const params = this.getParams();

    const goal = new Goal({
      title: params.title.trim(),
      description: params.description,
      deadline: params.deadline,
      qty: params.qty,
      belongsTo: params.belongsTo
    });
    const savedGoal = await goal.save();

    this.ok({ goal: savedGoal });
  }

  protected createParams() {
    return Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required(),
      deadline: Joi.date().required(),
      qty: Joi.number().required(),
      belongsTo: Joi.string().required()
    });
  }

  protected async read() {
    Goal.find({})
    .exec()
    .then(results => {
      return this.res.status(200).json({
        goal: results
      })
    })
    .catch(error => {
      console.log(error);
    })
  }

  protected readParams() {
    return Joi.object({});
  }
}