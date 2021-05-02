import express from "express";
import ExpenseController from "../controllers/ExpenseController";
import TransactionHistoryController from "../controllers/TransactionHistoryController";
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

router.put(`/expense/:id`, isAuthenticated(), async (req, res) => {
  const controller = new ExpenseController({
    req,
    res,
    action: "update",
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

router.get("/expense/:id", isAuthenticated(), async (req, res) => {
  const controller = new ExpenseController({
    req,
    res,
    action: "readOne",
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

router.get("/expense/history", isAuthenticated(), async (req, res) => {
  const controller = new TransactionHistoryController({
    req,
    res,
    action: "expenseHistory",
  });
  await controller.handleRequest();
});

export { router };
