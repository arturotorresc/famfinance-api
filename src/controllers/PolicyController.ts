import BaseController, { IArgs } from "./BaseController";
import Joi from "joi";
import User from "../models/user";
import Family from "../models/family";
import Policy from "../models/policy";
import { AllowedActionsEnum } from "../models/policy";

interface IPolicyArgs extends IArgs {}

export default class PolicyController extends BaseController {
  constructor(args: IPolicyArgs) {
    super(args);
  }

  async givePermission() {
    const user = this.cu.getUser();
    if (!user) {
      return this.notAuthorized();
    }
    if (!this.cu.isAdmin()) {
      return this.notAuthorized("Only admins can give permissions");
    }
    try {
      const params = this.getParams();
      const member = await User.findById(params.memberId);
      if (!member) {
        return this.notFound();
      }
      const belongsToFamily = await Family.exists({
        admin: user._id,
        members: member._id,
      });
      if (!belongsToFamily) {
        return this.notAuthorized(
          "You can only modify the permissions of your family members"
        );
      }
      const policy = await Policy.findOne({ belongsTo: member._id });
      if (!policy) {
        throw Error("No Policy associated with member!");
      }
      const hasPermission = policy.permissions.some(
        (val) => val === params.permission
      );
      if (!hasPermission) {
        policy.permissions.push(params.permission);
      }
      await policy.save();
      this.ok({ user: member, policy });
    } catch (err) {
      console.log("An error ocurred while giving permission to a member");
      console.log(err);
      return this.serverError();
    }
  }

  givePermissionParams() {
    return Joi.object({
      memberId: Joi.string().required(),
      permission: Joi.string()
        .valid(...Object.keys(AllowedActionsEnum))
        .required(),
    });
  }

  async revokePermission() {
    const user = this.cu.getUser();
    if (!user) {
      return this.notAuthorized();
    }
    if (!this.cu.isAdmin()) {
      return this.notAuthorized("Only admins can give permissions");
    }
    try {
      const params = this.getParams();
      const member = await User.findById(params.memberId);
      if (!member) {
        return this.notFound();
      }
      const belongsToFamily = await Family.exists({
        admin: user._id,
        members: member._id,
      });
      if (!belongsToFamily) {
        return this.notAuthorized(
          "You can only modify the permissions of your family members"
        );
      }
      const policy = await Policy.findOne({ belongsTo: member._id });
      if (!policy) {
        throw Error("No Policy associated with member!");
      }
      const hasPermission = policy.permissions.some(
        (val) => val === params.permission
      );
      if (hasPermission) {
        const newPermissions: AllowedActionsEnum[] = [];
        policy.permissions.forEach((val) => {
          if (val !== params.permission) {
            newPermissions.push(val);
          }
        });
        policy.permissions = newPermissions;
      }
      await policy.save();
      this.ok({ user: member, policy });
    } catch (err) {
      console.log("An error ocurred while revoking permission to a member");
      console.log(err);
      return this.serverError();
    }
  }

  revokePermissionParams() {
    return Joi.object({
      memberId: Joi.string().required(),
      permission: Joi.string()
        .valid(...Object.keys(AllowedActionsEnum))
        .required(),
    });
  }
}
