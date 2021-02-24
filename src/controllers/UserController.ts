import BaseController, { IArgs } from "./BaseController";
import Joi from "joi";

const maxNameLength = 40;
const minNameLength = 1;
const minPasswordLength = 1;

interface IUserArgs extends IArgs {}

/**
 * Example controller that responds a 200
 */
export default class UserController extends BaseController {
  constructor(args: IUserArgs) {
    super(args);
  }

  /**
   * This method will handle the request.
   */
  protected async ping() {
    const params = this.getParams();
    console.log(params);
    this.ok({ success: true });
  }

  /**
   * This method returns a Joi object specifying the valid params
   * for the "ping" method. Return an empty Joi object if the
   * request does not need any params.
   */
  protected pingParams() {
    return Joi.object({
      name: Joi.string().min(minNameLength).max(maxNameLength).required(),
      email: Joi.string().email(),
      password: Joi.string.min(minPasswordLength).required(),
    });
  }
}
