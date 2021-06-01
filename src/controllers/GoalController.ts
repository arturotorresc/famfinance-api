import BaseController, { IArgs } from "./BaseController";
import Joi from "joi";
import {
  createGoal,
  deleteGoalById,
  findFamilyGoals,
  updateGoalById,
} from "../DBAccessLayer";

interface IGoalArgs extends IArgs {}

export default class GoalController extends BaseController {
  constructor(args: IGoalArgs) {
    super(args);
  }

  protected async create() {
    const params = this.getParams();
    const user = this.cu.getUser();

    if (!user) {
      return this.notAuthorized();
    }

    const savedGoal = await createGoal({
      title: params.title.trim(),
      description: params.description,
      deadline: params.deadline,
      qty: params.qty,
      belongsTo: user._id,
    });

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

    const family = await this.cu.getFamily();
    if (!family) {
      return this.notAuthorized();
    }
    const memberIds = [family.admin];
    family.members.forEach((memberId) => {
      memberIds.push(memberId);
    });

    const results = await findFamilyGoals(memberIds);
    return this.res.status(200).json({
      goal: results,
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

    const results = await updateGoalById(params._id, {
      title: params.title.trim(),
      description: params.description,
      deadline: params.deadline,
      qty: params.qty,
    });
    if (!results) {
      return this.notFound("Goal with id " + params._id + " not found");
    } else {
      return this.res.status(200).json({
        updatedGoal: results,
      });
    }
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

    const results = await deleteGoalById(params._id);
    if (!results) {
      return this.notFound("Goal with id " + params._id + " not found");
    } else {
      return this.res.status(200).json({
        deletedGoal: results,
      });
    }
  }

  protected deleteParams() {
    return Joi.object({
      _id: Joi.string().required(),
    });
  }
}
