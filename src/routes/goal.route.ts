import express from "express";
import GoalController from "../controllers/GoalController";
import { isAuthenticated } from "../middleware/isAuthenticated";

const router = express.Router();

router.post(`/goal`, async (req, res) => {
    const controller = new GoalController({
      req,
      res,
      action: "create",
    });
    await controller.handleRequest();
  });

router.get("/goal", async(req, res) => {
  const controller = new GoalController({
    req,
    res,
    action: "read"
  });
  await controller.handleRequest();
});

export { router };
