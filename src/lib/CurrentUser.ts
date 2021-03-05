import { IUserDocument } from "../models/user";
import { Request } from "express";

export class CurrentUser {
  private user: IUserDocument | null;
  constructor(req: Request) {
    if (req.user) {
      this.user = req.user as IUserDocument;
    } else {
      this.user = null;
    }
  }

  /**
   * Gets the current logged in user.
   */
  getUser() {
    return this.user;
  }
}
