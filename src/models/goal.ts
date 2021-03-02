import mongoose from "mongoose";
import mongodb from "mongodb";

const { Schema } = mongoose;

interface IGoalDocument extends mongoose.Document {
  title: String,
  description: String,
  deadline: Date,
  qty: Number,
  belongsTo: mongodb.ObjectID
}

const goalSchema = new Schema(
  {
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    deadline: {
        type: Date,
        required: true
    },
    qty: {
        type: Number,
        required: true
    },
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

const Goal = mongoose.model<IGoalDocument>("Goal", goalSchema, "Goal");

export default Goal;
