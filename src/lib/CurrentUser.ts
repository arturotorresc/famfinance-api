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
   * Gets the current logged in user. If there is no user
   * logged in, returns null.
   */
  getUser() {
    return this.user;
  }

  /**
   * Returns true if the user making the request is logged in.
   */
  isLoggedIn(): boolean {
    return this.user !== null;
  }
}
