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
    const user = this.cu.getUser();

    if (user === null) {
      return this.notAuthorized();
    }

    const goal = new Goal({
      title: params.title.trim(),
      description: params.description,
      deadline: params.deadline,
      qty: params.qty,
      belongsTo: user._id,
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
    });
  }

  protected async read() {
    const user = this.cu.getUser();
    if (user === null) {
      return this.notAuthorized();
    }

    Goal.find({ belongsTo: user.id })
      .exec()
      .then((results) => {
        return this.res.status(200).json({
          goal: results,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  protected readParams() {
    return Joi.object({});
  }

  protected async update() {
    const params = this.getParams();
    const user = this.cu.getUser();

    if (user === null) {
      return this.notAuthorized();
    }

    Goal.findByIdAndUpdate(
      params._id,
      {
        title: params.title.trim(),
        description: params.description,
        deadline: params.deadline,
        qty: params.qty,
      },
      { new: true }
    )
      .exec()
      .then((results) => {
        return this.res.status(200).json({
          updatedGoal: results,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  protected updateParams() {
    return Joi.object({
      _id: Joi.string().required(),
      title: Joi.string().required(),
      description: Joi.string().required(),
      deadline: Joi.date().required(),
      qty: Joi.number().required(),
    });
  }

  protected async delete() {
    const user = this.cu.getUser();
    if (user === null) {
      return this.notAuthorized();
    }

    const params = this.getParams();

    Goal.findByIdAndDelete(params._id)
      .exec()
      .then((results) => {
        return this.res.status(200).json({
          deletedGoal: results,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  protected deleteParams() {
    return Joi.object({
      _id: Joi.string().required(),
    });
  }
}
