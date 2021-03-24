import express from "express";
import ExpenseController from "../controllers/ExpenseController";
import { isAuthenticated } from "../middleware/isAuthenticated";

const router = express.Router();

router.post(`/expense`, isAuthenticated(), async (req, res) => {
  const controller = new ExpenseController({
    req,
    res,
    action: "create",
  });
  await controller.handleRequest();
});

router.get("/expense", isAuthenticated(), async (req, res) => {
  const controller = new ExpenseController({
    req,
    res,
    action: "read",
  });
  await controller.handleRequest();
});

router.post(`/expenseWeekly`, isAuthenticated(), async (req, res) => {
  const controller = new ExpenseController({
    req,
    res,
    action: "createWeekly",
  });
  await controller.handleRequest();
});

router.post(`/expenseMonthly`, async (req, res) => {
  const controller = new ExpenseController({
    req,
    res,
    action: "createMonthly",
  });
  await controller.handleRequest();
});

router.delete("/expense/:id", isAuthenticated(), async (req, res) => {
  const controller = new ExpenseController({
    req,
    res,
    action: "destroy",
  });
  await controller.handleRequest();
});



export { router };
