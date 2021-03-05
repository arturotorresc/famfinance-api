import mongoose from "mongoose";
import mongodb from "mongodb";

const { Schema } = mongoose;

/**
 * The available properties in the policy model
 */
interface IPolicyDocument extends mongoose.Document {
  admin: mongodb.ObjectID;
}

const policySchema = new Schema(
  {
    belongsTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Policy = mongoose.model<IPolicyDocument>("Policy", policySchema, "Policy");

export default Policy;
