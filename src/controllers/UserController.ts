import BaseController, { IArgs } from "./BaseController";
import bcrypt from "bcrypt";
import User from "../models/user";
import Family from "../models/family";
import Policy from "../models/policy";
import Joi from "joi";

interface IUserArgs extends IArgs {}

export default class UserController extends BaseController {
  constructor(args: IUserArgs) {
    super(args);
  }

  private async create() {
    const params = this.getParams();
    const email = params.email.trim().toLowerCase();
    const exists = await User.exists({ email });
    if (exists) {
      return this.badRequest("User already exists!");
    }

    const { savedUser } = await this.saveUserWithPolicy({
      name: params.name,
      email,
      password: params.password,
    });
    const family = new Family({
      admin: savedUser._id,
    });
    const savedFamily = await family.save();
    console.log(`User ${savedUser.name} created!`);
    this.ok({ user: savedUser, family: savedFamily });
  }

  private async createMember() {
    const params = this.getParams();
    const email = params.email.trim().toLowerCase();
    const exists = await User.exists({ email });
    if (exists) {
      return this.badRequest("User already exists!");
    }
    const familyId = this.req.params.familyId;
    const family = await Family.findOne({ familyId: familyId });
    if (!family) {
      console.log(`Family with id "${familyId}" does not exist!`);
      return this.notFound("Family not found!");
    }

    const { savedUser } = await this.saveUserWithPolicy({
      name: params.name,
      email,
      password: params.password,
    });
    family.members.push(savedUser._id);
    const updatedFamily = await family.save();
    console.log(`Added ${savedUser.name} to family ${updatedFamily.familyId}!`);
    this.ok({ user: savedUser, family: updatedFamily });
  }

  private createParams() {
    return Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      confirmPassword: Joi.any().valid(Joi.ref("password")).required(),
    });
  }

  private createMemberParams() {
    return Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      confirmPassword: Joi.any().valid(Joi.ref("password")).required(),
    });
  }

  private async saveUserWithPolicy({
    name,
    email,
    password,
  }: {
    name: string;
    email: string;
    password: string;
  }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name: name.trim(),
      email,
      password: hashedPassword,
    });
    const savedUser = await user.save();
    const policy = new Policy({
      belongsTo: savedUser._id,
    });
    await policy.save();
    return { savedUser };
  }
}
