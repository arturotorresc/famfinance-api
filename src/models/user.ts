import mongoose from "mongoose";
const { Schema } = mongoose;

export enum UserRoleEnum {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

/**
 * The available properties in the user model
 */
interface IUserDocument extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  role: UserRoleEnum;
}

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: [UserRoleEnum.ADMIN, UserRoleEnum.MEMBER],
      required: true,
      default: UserRoleEnum.ADMIN,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUserDocument>("User", userSchema, "User");

export default User;
