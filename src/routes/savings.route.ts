import express from "express";
import SavingsPlanController from "../controllers/SavingsPlanController";
import { isAuthenticated } from "../middleware/isAuthenticated";

const router = express.Router();

router.get("/savingsPlan", isAuthenticated(), async (req, res) => {
  const controller = new SavingsPlanController({
    req,
    res,
    action: "computeWeeklyPlan",
  });
  await controller.handleRequest();
});

export { router };
