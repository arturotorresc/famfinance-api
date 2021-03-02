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

  protected async create() {
    const params = this.getParams();
    if (params.password !== params.confirmPassword) {
      return this.notAcceptable("Passwords dont match!");
    }
    const email = params.email.trim().toLowerCase();
    const exists = await User.exists({ email });
    if (exists) {
      return this.badRequest("User already exists!");
    }

    const hashedPassword = await bcrypt.hash(params.password, 10);
    const user = new User({
      name: params.name.trim(),
      email,
      password: hashedPassword,
      role: params.role.trim()
    });
    const savedUser = await user.save();

    const family = new Family({
      admin: savedUser._id,
    });
    const savedFamily = await family.save();

    const policy = new Policy({
      belongsTo: savedUser._id,
    });
    await policy.save();

    console.log(`User ${savedUser.name} created!`);
    this.ok({ user: savedUser, family: savedFamily });
  }

  protected createParams() {
    return Joi.object({
      name: Joi.string().required(),
      email: Joi.string().required(),
      password: Joi.string().required(),
      confirmPassword: Joi.string().required(),
      role: Joi.string().required(),
    });
  }

  protected async read() {
    User.find({})
    .exec()
    .then(results => {
      return this.res.status(200).json({
        users: results
      })
    })
    .catch(error => {
      console.log(error);
    })
  }

  protected readParams() {
    return Joi.object({});
  }
}
