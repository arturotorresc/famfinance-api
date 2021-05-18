import mongoose from "mongoose";

export enum StartEndMonthEnum {
  START = "Inicio",
  END = "Fin",
}

export interface IFrequencyDocument extends mongoose.Document {
  frequencyType: String;
  day: Number;
  weekDay: String;
  weeksRepeat: Number;
  monthsRepeat: Number;
  months: [String];
  startEndMonth: String;
}

const { Schema } = mongoose;

const frequencySchema = new Schema(
  {
    frequencyType: {
      type: String,
      required: true,
    },
    day: {
      type: Schema.Types.Mixed,
      required: false,
    },
    weekDay: {
      type: Schema.Types.Mixed,
      required: false,
    },
    weeksRepeat: {
      type: Schema.Types.Mixed,
      required: false,
    },
    monthsRepeat: {
      type: Schema.Types.Mixed,
      required: false,
    },
    months: {
      type: Schema.Types.Mixed,
      required: false,
    },
    startEndMonth: {
      type: Schema.Types.Mixed,
      enum: [StartEndMonthEnum.START, StartEndMonthEnum.END],
      required: false,
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
