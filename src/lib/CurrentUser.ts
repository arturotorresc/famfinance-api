import { IUserDocument, UserRoleEnum } from "../models/user";
import { Request } from "express";
import { AllowedActionsEnum } from "../models/policy";
import Family from "../models/family";
import Policy from "../models/policy";

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

  isAdmin() {
    if (!this.user) {
      return false;
    }
    return this.user.role === UserRoleEnum.ADMIN;
  }

  /**
   * Gets the current user's Family. Returns null if the user is not logged in.
   */
  async getFamily() {
    if (!this.isLoggedIn()) {
      return null;
    }
    const user = this.user!;
    const family = await Family.findOne({
      $or: [{ admin: user._id }, { members: user._id }],
    });
    return family;
  }

  /**
   * Returns true if the user making the request is logged in.
   */
  isLoggedIn(): boolean {
    return this.user !== null;
  }

  /**
   * Sets the user to null once it logs out
   */
  logOut(): void {
    this.user = null;
  }

  /**
   * Checks if the current user has permission to do the _action_.
   * @param action The action that you want to check
   */
  async hasPermission(action: AllowedActionsEnum): Promise<boolean> {
    if (!this.isLoggedIn()) {
      return false;
    }
    const user = this.user!;
    if (user.role === UserRoleEnum.ADMIN) {
      return true;
    }
    const policy = await Policy.findOne({ belongsTo: user._id });
    if (!policy) {
      console.log(
        `ERROR: User ${user.email} does not have a policy associated!`
      );
      return false;
    }
    const permissions = policy.permissions || [];
    const canDoAction = permissions.some((val) => action === val);
    return canDoAction;
  }
}
