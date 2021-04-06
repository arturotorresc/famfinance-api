import mongoose from "mongoose";
import mongodb from "mongodb";

const { Schema } = mongoose;

interface IIncomeDocument extends mongoose.Document {
  title: string;
  category: string;
  from: Date;
  until: Date;
  qty: number;
  belongsTo: mongodb.ObjectID;
}

const incomeSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    from: {
      type: Date,
      required: false,
    },
    until: {
      type: Date,
      required: false,
    },
    qty: {
      type: Number,
      required: true,
    },
    belongsTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    frequency: {
      type: Schema.Types.ObjectId,
      ref: "Frequency",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Income = mongoose.model<IIncomeDocument>(
  "Income",
  incomeSchema,
  "Income"
);

export default Income;
