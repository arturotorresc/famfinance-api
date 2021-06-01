import BaseController, { IArgs } from "./BaseController";
import bcrypt from "bcrypt";
import { UserRoleEnum } from "../models/user";
import Joi from "joi";
import passport from "passport";
import {
  checkIfEmailExists,
  createFamily,
  saveUserWithPolicy,
  findPolicyOfUser,
  findUserById,
  updateUser,
  getFamilyUsers,
  findFamilyById,
} from "../DBAccessLayer";

interface IUserArgs extends IArgs {}

export default class UserController extends BaseController {
  constructor(args: IUserArgs) {
    super(args);
  }

  private async create() {
    const params = this.getParams();
    const email = params.email.trim().toLowerCase();
    const exists = await checkIfEmailExists(email);
    if (exists) {
      return this.badRequest("User already exists!");
    }

    const { savedUser } = await saveUserWithPolicy(
      {
        name: params.name,
        email,
        password: params.password,
      },
      UserRoleEnum.ADMIN
    );
    const savedFamily = await createFamily(savedUser._id);
    console.log(`User ${savedUser.name} created!`);
    this.ok({ user: savedUser, family: savedFamily });
  }

  private async createMember() {
    const params = this.getParams();
    const email = params.email.trim().toLowerCase();
    const exists = await checkIfEmailExists(email);
    if (exists) {
      return this.badRequest("User already exists!");
    }
    const familyId = params.familyId;
    const family = await findFamilyById(familyId);
    if (!family) {
      console.log(`Family with id "${familyId}" does not exist!`);
      return this.notFound("Family not found!");
    }

    const { savedUser } = await saveUserWithPolicy(
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

    const results = await getFamilyUsers(userIds);
    return this.res.status(200).json({
      users: results,
    });
  }

  private readParams() {
    return Joi.object({});
  }

  private async readMember() {
    const { id } = this.req.params;
    const user = await findUserById(id);
    if (!user) {
      return this.notFound("User not found");
    }
    const policy = await findPolicyOfUser(user._id);
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

    const results = await updateUser(user._id, { name: params.name });
    if (!results) {
      return this.notFound("Something went wrong");
    } else {
      return this.res.status(200).json({
        user: results,
      });
    }
  }

  protected updateParams() {
    return Joi.object({
      name: Joi.string().required(),
    });
  }

  protected async updatePassword() {
    const params = this.getParams();
    const user = this.cu.getUser();

    if (user === null) {
      return this.notAuthorized();
    }

    if (await bcrypt.compare(params.oldPassword, user.password)) {
      const hashedPassword = await bcrypt.hash(params.newPassword, 10);
      const results = await updateUser(user._id, { password: hashedPassword });
      if (!results) {
        return this.notFound("Something went wrong");
      } else {
        return this.res.status(200).json({
          user: results,
        });
      }
    } else {
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
