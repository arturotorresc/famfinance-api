import BaseController, { IArgs } from "./BaseController";
import bcrypt from "bcrypt";
import User, { UserRoleEnum } from "../models/user";
import Family from "../models/family";
import Policy from "../models/policy";
import Joi from "joi";
const passport = require("passport");

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

    const { savedUser } = await this.saveUserWithPolicy(
      {
        name: params.name,
        email,
        password: params.password,
      },
      UserRoleEnum.ADMIN
    );
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

    const { savedUser } = await this.saveUserWithPolicy(
      {
        name: params.name,
        email,
        password: params.password,
      },
      UserRoleEnum.MEMBER
    );
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

  private async saveUserWithPolicy(
    {
      name,
      email,
      password,
    }: {
      name: string;
      email: string;
      password: string;
    },
    role: UserRoleEnum
  ) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name: name.trim(),
      email,
      password: hashedPassword,
      role: role,
    });
    const savedUser = await user.save();
    const policy = new Policy({
      belongsTo: savedUser._id,
    });
    await policy.save();
    return { savedUser };
  }

  protected async read() {
    User.find({})
      .exec()
      .then((results) => {
        return this.res.status(200).json({
          users: results,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  private readParams() {
    return Joi.object({});
  }

  protected async login() {
    passport.authenticate("local", (error: any, user: any, info: any) => {
      if (error || info) {
        return this.redirect("/login");
      }

      if (user) {
        this.req.login(user, (err) => {
          if (err) {
            return this.redirect("/login");
          }
          this.redirect("/");
        });
      }
    })(this.req, this.res);
  }

  private loginParams() {
    return Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
    });
  }
}
