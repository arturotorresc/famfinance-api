import BaseController, { IArgs } from "./BaseController";
import Income from "../models/income";
import { AllowedActionsEnum } from "../models/policy";
import Joi from "joi";

interface IIncomeArgs extends IArgs {}

export default class IncomeController extends BaseController {
  constructor(args: IIncomeArgs) {
    super(args);
  }

  protected async create() {
    const params = this.getParams();
    const user = this.cu.getUser();
    const category = (params.category as string).trim().toLowerCase();
    const income = new Income({
      title: params.title.trim(),
      from: params.from,
      until: params.until,
      qty: params.qty,
      category,
      belongsTo: user!._id,
    });
    const savedIncome = await income.save();
    this.ok({ income: savedIncome });
  }

  protected createParams() {
    return Joi.object({
      title: Joi.string().required(),
      from: Joi.date(),
      until: Joi.date(),
      qty: Joi.number().required(),
      category: Joi.string().required(),
    });
  }

  protected async read() {
    const user = this.cu.getUser();
    if (user === null) {
      return this.notAuthorized();
    }

    const params = this.getParams();
    const family = await this.cu.getFamily();
    if (!family) {
      console.log("No family was found for this user!");
      return this.notFound();
    }
    const belongsToArray = family.members.map((userId) => {
      return {
        belongsTo: userId,
      };
    });
    belongsToArray.push({ belongsTo: family.admin });
    let query: any = {
      $or: belongsToArray,
    };
    if (params.id) {
      query = { $and: [{ _id: params.id }, { $or: belongsToArray }] };
    }
    Income.find(query)
      .exec()
      .then((results) => {
        return this.res.status(200).json({
          income: results,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  protected readParams() {
    return Joi.object({
      id: Joi.string().optional(),
    });
  }

  private async destroy() {
    const id = this.req.params.id;
    const hasPermission = await this.cu.hasPermission(
      AllowedActionsEnum.DELETE_FAMILY_INCOME
    );
    if (!hasPermission) {
      return this.notAuthorized("You are not allowed to delete incomes");
    }
    const income = await Income.findOneAndDelete({ _id: id });
    if (income) {
      console.log(`Income ${income._id} deleted.`);
    } else {
      console.log(`No Income with that ID`);
    }
    this.ok({ income });
  }

  private destroyParams() {
    return Joi.object({});
  }
}
