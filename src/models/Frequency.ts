import mongoose from "mongoose";
import mongodb from "mongodb";

const { Schema } = mongoose;

export enum FrequencyEnum {
  MONTHLY = "MONTHLY",
  WEEKLY = "WEEKLY",
}

interface IFrequencyDocument extends mongoose.Document {
  weekDays: [Boolean];
  weeks: [Boolean];
  repetition: FrequencyEnum;
  repeatsEvery: Number;
  frequency: mongodb.ObjectID;
}

const frequencySchema = new Schema(
  {
    weekDay: {
      type: Number,
      required: false,
    },
    weeks: {
      type: [Boolean],
      required: false,
    },
    repetition: {
      type: String,
      enum: [FrequencyEnum.MONTHLY, FrequencyEnum.WEEKLY],
      required: true,
    },
    repeatsEvery: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Frequency = mongoose.model<IFrequencyDocument>(
  "Frequency",
  frequencySchema,
  "Frequency"
);

export default Frequency;
