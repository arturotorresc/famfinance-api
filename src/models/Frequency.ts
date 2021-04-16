import mongoose from "mongoose";
import mongodb from "mongodb";

const { Schema } = mongoose;

export enum StartEndMonthEnum {
  START = "Inicio",
  END = "Fin",
}

interface IFrequencyDocument extends mongoose.Document {
  frequencyType: String;
  day: Number;
  weekDay: String;
  weeksRepeat: Number;
  monthsRepeat: Number;
  months: [String];
  startEndMonth: String;
}

const frequencySchema = new Schema({
    frequencyType: {
      type: String,
      required: true
    },
    day: {
      type: Schema.Types.Mixed,
      required: false
    },
    weekDay: {
      type: Schema.Types.Mixed,
      required: false
    },
    weeksRepeat: {
      type: Schema.Types.Mixed,
      required: false
    },
    monthsRepeat: {
      type: Schema.Types.Mixed,
      required: false
    },
    months: {
      type: Schema.Types.Mixed,
      required: false
    },
    startEndMonth: {
      type: Schema.Types.Mixed,
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
