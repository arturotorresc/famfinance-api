import express from "express";
import { CurrentUser } from "../lib/CurrentUser";
import Joi from "joi";

export type THttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface IArgs {
  req: express.Request;
  res: express.Response;
  /**
   * Specifies which controller method will handle the current request.
   * This action must match to one of the methods of the controller.
   */
  action: string;
}

/**
 * Every controller should extend this controller to get basic functionality
 * done such as param validation.
 */
export default abstract class BaseController {
  protected readonly req: express.Request;
  protected readonly res: express.Response;
  protected readonly action: string;
  protected cu: CurrentUser;
  private hasSentResponse: boolean;

  constructor({ req, res, action }: IArgs) {
    this.req = req;
    this.res = res;
    this.action = action;
    this.cu = new CurrentUser(req);
    this.hasSentResponse = false;
  }

  public async handleRequest() {
    const requestHandlerMethod = (this as any)[this.action];
    if (!this.isValidAction(requestHandlerMethod)) {
      throw new Error(
        `${this.action} is not a function of type () => Promise<void>! Make sure the 'action' param
        is set to an existen method!`
      );
    }
    if (!(await this.hasValidParams())) {
      return this.notAcceptable();
    }

    try {
      let method = requestHandlerMethod.bind(this);
      await method();
    } catch (err) {
      console.log(`An error ocurred while handling the request`);
      if (!this.hasSentResponse) {
        this.serverError();
      }
    }
  }

  // =========================== PROTECTED METHODS ========================

  protected ok(data: any, msg: string = "Success") {
    this.sendResponse(200, data, msg);
  }

  protected notAcceptable(msg: string = "Not acceptable") {
    this.sendResponse(406, {}, msg);
  }

  protected redirect(url: string) {
    if (this.hasSentResponse) {
      throw new Error(
        "A response has already been sent and a redirect was tried!"
      );
    }
    this.hasSentResponse = true;
    this.res.redirect(url);
  }

  protected notFound(msg: string = "Resource not found") {
    this.sendResponse(404, {}, msg);
  }

  protected notAuthorized(msg: string = "Not authorized") {
    this.sendResponse(401, {}, msg);
  }

  protected badRequest(msg: string = "Bad request") {
    this.sendResponse(401, {}, msg);
  }

  protected serverError() {
    this.sendResponse(500, {}, "Server error");
  }

  protected getParams() {
    const method = this.req.method;
    if (!this.isAllowedHttpMethod(method)) {
      throw new Error(
        "Unallowed http method, please use one of the following: GET, PUT, POST, DELETE"
      );
    }
    switch (method) {
      case "GET":
        return this.req.query;
      case "POST":
      case "PUT":
      case "DELETE":
        return this.req.body;
    }
  }

  // =========================== PRIVATE METHODS ========================

  private sendResponse(status: number, data: any, message: string) {
    if (this.hasSentResponse) {
      throw new Error("A response has already been sent!");
    }
    this.hasSentResponse = true;
    this.res.statusMessage = message;
    this.res.status(status).json(data);
  }

  private async hasValidParams(): Promise<boolean> {
    const params = this.getParams();
    const schemaFn = (this as any)[this.getSchemaMethodName()];
    if (!this.isValidParamsFn(schemaFn)) {
      throw new Error(
        `${this.getSchemaMethodName()} is not a function of type () => Joi.Schema`
      );
    }
    const schema = schemaFn();
    try {
      await schema.validateAsync(params);
    } catch (err) {
      console.log(`Invalid params for ${this.action} action!`);
      return false;
    }
    return true;
  }

  private isValidAction(something: any): something is () => Promise<void> {
    return typeof something === "function";
  }

  private isValidParamsFn(something: any): something is () => Joi.Schema {
    return typeof something === "function";
  }

  private isAllowedHttpMethod(method: string): method is THttpMethod {
    const methods = ["GET", "POST", "PUT", "DELETE"];
    return methods.includes(method);
  }

  private getSchemaMethodName() {
    return `${this.action}Params`;
  }
}
