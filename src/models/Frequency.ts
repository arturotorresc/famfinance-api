import mongoose from "mongoose";
import mongodb from "mongodb";

const { Schema } = mongoose;

export enum StartEndMonthEnum {
  START = "START",
  END = "END",
}

interface IFrequencyDocument extends mongoose.Document {
  day: Number;
  weekDay: String;
  weeksRepeat: Number;
  monthsRepeat: Number;
  months: [String];
  startEndMonth: String;
}

const frequencySchema = new Schema({
    day: {
      type: Number,
      required: false
    },
    weekDay: {
      type: String,
      required: false
    },
    weeksRepeat: {
      type: Number,
      required: false
    },
    monthsRepeat: {
      type: Number,
      required: false
    },
    months: {
      type: [String],
      required: false
    },
    startEndMonth: {
      type: String,
      enum: [StartEndMonthEnum.START, StartEndMonthEnum.END],
      required: false,
    }
  },
  {
    timestamps: true,
  }
);

const Frequency = mongoose.model<IFrequencyDocument>("Frequency", frequencySchema, "Frequency");

export default Frequency;
