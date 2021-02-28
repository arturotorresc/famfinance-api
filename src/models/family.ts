import mongoose from "mongoose";
import mongodb from "mongodb";

const { Schema } = mongoose;

/**
 * The available properties in the family model
 */
interface IFamilyDocument extends mongoose.Document {
  admin: mongodb.ObjectID;
}

const familySchema = new Schema(
  {
    admin: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Family = mongoose.model<IFamilyDocument>("Family", familySchema, "Family");

export default Family;
