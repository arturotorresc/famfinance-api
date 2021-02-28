import express from "express";
import GoalController from "../controllers/GoalController";

const router = express.Router();

router.post("/create/goal", GoalController.createGoal);
router.get("/get/goals", GoalController.getAllGoals);

export { router };
