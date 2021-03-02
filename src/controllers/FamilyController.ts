import BaseController, { IArgs } from "./BaseController";
import Family from "../models/family";
import Joi from "joi";

interface IFamilyArgs extends IArgs {}

export default class FamilyController extends BaseController {
  constructor(args: IFamilyArgs) {
    super(args);
  }

  protected async read() {
    Family.find({})
    .exec()
    .then(results => {
      return this.res.status(200).json({
        families: results
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