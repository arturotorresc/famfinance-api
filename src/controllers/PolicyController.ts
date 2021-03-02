import BaseController, { IArgs } from "./BaseController";
import Policy from "../models/policy";
import Joi from "joi";

interface IPolicyArgs extends IArgs {}

export default class PolicyController extends BaseController {
  constructor(args: IPolicyArgs) {
    super(args);
  }

  protected async read() {
    Policy.find({})
    .exec()
    .then(results => {
      return this.res.status(200).json({
        policies: results
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