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

router.put("/goal", async(req, res) => {
  const controller = new GoalController({
    req,
    res,
    action: "update"
  });
  await controller.handleRequest();
});

router.delete("/goal", async(req, res) => {
  const controller = new GoalController({
    req,
    res,
    action: "delete"
  });
  await controller.handleRequest();
});

export { router };
