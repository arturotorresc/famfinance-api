import BaseController, { IArgs } from "./BaseController";
import Joi from "joi";

interface ISessionArgs extends IArgs {}

export default class SessionController extends BaseController {
  constructor(args: ISessionArgs) {
    super(args);
  }

  protected async authCheck() {
    this.ok({ isLoggedIn: this.cu.isLoggedIn() });
  }

  protected authCheckParams() {
    return Joi.object({});
  }
}
