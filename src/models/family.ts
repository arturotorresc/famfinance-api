import mongoose from "mongoose";
import mongodb from "mongodb";
import shortid from "shortid";

const { Schema } = mongoose;

/**
 * The available properties in the family model
 */
interface IFamilyDocument extends mongoose.Document {
  admin: mongodb.ObjectID;
  familyId: string;
  members: mongodb.ObjectID[];
}

const familySchema = new Schema(
  {
    admin: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    familyId: {
      type: String,
      default: shortid.generate,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Family = mongoose.model<IFamilyDocument>("Family", familySchema, "Family");

export default Family;
