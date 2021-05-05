import mongoose from "mongoose";
import mongodb from "mongodb";
import { TransactionCategoryEnum } from "../types/transactionCategory.type";

const { Schema } = mongoose;

export interface IExpenseDocument extends mongoose.Document {
  title: string;
  category: string;
  from: Date;
  until: Date;
  qty: Number;
  frequency: mongodb.ObjectID;
  belongsTo: mongodb.ObjectID;
}

const expenseSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: false,
      enum: [...Object.keys(TransactionCategoryEnum)],
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

const Expense = mongoose.model<IExpenseDocument>(
  "Expense",
  expenseSchema,
  "Expense"
);

export default Expense;
