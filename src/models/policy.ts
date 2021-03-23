import mongoose from "mongoose";
import mongodb from "mongodb";

const { Schema } = mongoose;

/**
 * Allowed actions for a given user.
 */
export enum AllowedActionsEnum {
  EDIT_FAMILY_INCOME = "EDIT_FAMILY_INCOME",
  EDIT_FAMILY_EXPENSE = "EDIT_FAMILY_EXPENSE",
  DELETE_FAMILY_INCOME = "DELETE_FAMILY_INCOME",
  DELETE_FAMILY_EXPENSE = "DELETE_FAMILY_EXPENSE",
}

/**
 * The available properties in the policy model
 */
interface IPolicyDocument extends mongoose.Document {
  belongsTo: mongodb.ObjectID;
  permissions: AllowedActionsEnum[];
}

const policySchema = new Schema(
  {
    belongsTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    permissions: {
      type: String,
      enum: [
        AllowedActionsEnum.DELETE_FAMILY_EXPENSE,
        AllowedActionsEnum.DELETE_FAMILY_INCOME,
        AllowedActionsEnum.EDIT_FAMILY_EXPENSE,
        AllowedActionsEnum.EDIT_FAMILY_INCOME,
      ],
    },
  },
  {
    timestamps: true,
  }
);

const Policy = mongoose.model<IPolicyDocument>(
  "Policy",
  policySchema,
  "Policy"
);

export default Policy;
