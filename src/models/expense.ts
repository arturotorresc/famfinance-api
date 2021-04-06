import mongoose from "mongoose";
import mongodb from "mongodb";

const { Schema } = mongoose;

interface IExpenseDocument extends mongoose.Document {
  title: String;
  category: String;
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
    frequency: {
      type: Schema.Types.ObjectId,
      ref: "Frequency",
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
