import BaseController, { IArgs } from "./BaseController";
import Family from "../models/family";
import Joi from "joi";

interface IFamilyArgs extends IArgs {}

export default class FamilyController extends BaseController {
  constructor(args: IFamilyArgs) {
    super(args);
  }

  protected async read() {
    const user = this.cu.getUser();
    if (user === null) {
      return this.notAuthorized();
    }
    Family.find({ admin: user.id })
      .exec()
      .then((results) => {
        return this.res.status(200).json({
          families: results,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  protected readParams() {
    return Joi.object({});
  }
}
