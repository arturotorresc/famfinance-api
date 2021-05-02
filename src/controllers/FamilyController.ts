import BaseController, { IArgs } from "./BaseController";
import Joi from "joi";

interface IFamilyArgs extends IArgs {}

export default class FamilyController extends BaseController {
  constructor(args: IFamilyArgs) {
    super(args);
  }

  protected async read() {
    const family = await this.cu.getFamily();
    if (!family) {
      console.log("No family for user!");
      return this.notFound();
    }
    this.ok({ family });
  }

  protected readParams() {
    return Joi.object({});
  }
}
