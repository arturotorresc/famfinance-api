import express from "express";
import StatsController from "../controllers/StatsController";
import { isAuthenticated } from "../middleware/isAuthenticated";

const router = express.Router();

router.get("/statsWeekly", isAuthenticated(), async (req, res) => {
  const controller = new StatsController({
    req,
    res,
    action: "weekly",
  });
  await controller.handleRequest();
});

export { router };
