import BaseController, { IArgs } from "./BaseController";
import bcrypt from "bcrypt";
import User, { UserRoleEnum } from "../models/user";
import Family from "../models/family";
import Policy from "../models/policy";
import Joi from "joi";
import passport from "passport";

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
    const familyId = params.familyId;
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
      password: Joi.string().min(6).required(),
      confirmPassword: Joi.any().valid(Joi.ref("password")).required(),
    });
  }

  private createMemberParams() {
    return Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      confirmPassword: Joi.any().valid(Joi.ref("password")).required(),
      familyId: Joi.string().required(),
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
      permissions: this.getDefaultPermissions(),
    });
    await policy.save();
    return { savedUser };
  }

  private getDefaultPermissions() {
    return [];
  }

  protected async read() {
    const family = await this.cu.getFamily();
    if (!family) {
      console.log("No family was found for user!");
      return this.notFound();
    }
    const userIds = [{ _id: family.admin }];
    family.members.forEach((memberId) => {
      userIds.push({ _id: memberId });
    });

    User.find({
      $or: userIds,
    })
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

  private async readMember() {
    const { id } = this.req.params;
    const user = await User.findById(id);
    if (!user) {
      return this.notFound("User not found");
    }
    const policy = await Policy.findOne({ belongsTo: user._id });
    this.ok({ user, policy });
  }

  private readMemberParams() {
    return Joi.object({});
  }

  protected async login() {
    passport.authenticate("local", (error: any, user: any, info: any) => {
      if (error || info) {
        return this.notAuthorized();
      }

      if (user) {
        this.req.login(user, (err) => {
          if (err) {
            return this.notAuthorized();
          }
          console.log(`User ${user.name} logged in!`);
          return this.ok({ user });
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

  protected async update() {
    const params = this.getParams();
    const user = this.cu.getUser();

    if (user === null) {
      return this.notAuthorized();
    }


    User.findByIdAndUpdate(
      user._id,
      {
        name: params.name
      },
      { new: true }
    )
      .exec()
      .then((results) => {
        return this.res.status(200).json({
          user: results,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  protected updateParams() {
    return Joi.object({
      name: Joi.string().required()
    });
  }

  protected async updatePassword() {
    const params = this.getParams();
    const user = this.cu.getUser();

    if (user === null) {
      return this.notAuthorized();
    }

    if(await bcrypt.compare(params.oldPassword, user.password)) {

      const hashedPassword = await bcrypt.hash(params.newPassword, 10);
      User.findByIdAndUpdate(
        user._id,
        {
          password: hashedPassword
        },
        { new: true }
      )
        .exec()
        .then((results) => {
          return this.res.status(200).json({
            user: results,
          });
        })
        .catch((error) => {
          console.log(error);
        });
    }
    else {
      console.log("Incorrect Password");
    }
  }

  protected updatePasswordParams() {
    return Joi.object({
      oldPassword: Joi.string().min(6).required(),
      newPassword: Joi.string().min(6).required(),
    });
  }
}
