import express from "express";
import GoalController from "../controllers/GoalController";

const router = express.Router();

router.post(`/create/goal`, async (req, res) => {
    const controller = new GoalController({
      req,
      res,
      action: "create",
    });
    await controller.handleRequest();
  });
  
  router.get("/get/goals", async(req, res) => {
    const controller = new GoalController({
      req,
      res,
      action: "read"
    });
    await controller.handleRequest();
  });

export { router };
