import BaseController, { IArgs } from "./BaseController";
import Joi from "joi";

interface IPingArgs extends IArgs {}

/**
 * Example controller that responds a 200
 */
export default class PingController extends BaseController {
  constructor(args: IPingArgs) {
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
      myParam: Joi.string().required(),
    });
  }
}
