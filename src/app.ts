import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import { pingRouter } from "./routes";
import { usersRouter } from "./routes";

export const main = async () => {
  const app = express();
  app.use(bodyParser.json());

  const originAllowlist = (process.env.CLIENT_ALLOWLIST as string).split(
    /,\s*/
  );
  const corsOptions = {
    origin: (origin?: string, callback?: any) => {
      if (!origin || originAllowlist.some((val) => val === origin)) {
        callback(null, true);
      } else {
        throw new Error(
          `${origin ?? "No origin"} is not allowed due to CORS allowlist`
        );
      }
    },
    credentials: true,
  };

  app.use(cors(corsOptions));
  app.use(cookieParser());

  const dbOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  };
  const uri = process.env.DB_URI as string | undefined;
  if (!uri) {
    console.log("No database URI specified");
    throw new Error(`No DB uri found!`);
  }
  try {
    await mongoose.connect(uri, dbOptions);
  } catch (err) {
    console.log("An error ocurred while connecting to the database!");
    throw err;
  }

  // ================== ROUTES ================
  app.use("/api", pingRouter);
  app.use("/users", usersRouter);
  return app;
};
