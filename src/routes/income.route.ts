import express from "express";
import IncomeController from "../controllers/IncomeController";
import TransactionHistoryController from "../controllers/TransactionHistoryController";
import { isAuthenticated } from "../middleware/isAuthenticated";

const router = express.Router();

router.post(`/income`, isAuthenticated(), async (req, res) => {
  const controller = new IncomeController({
    req,
    res,
    action: "create",
  });
  await controller.handleRequest();
});

router.put(`/income/:id`, isAuthenticated(), async (req, res) => {
  const controller = new IncomeController({
    req,
    res,
    action: "update",
  });
  await controller.handleRequest();
});

router.get("/income", isAuthenticated(), async (req, res) => {
  const controller = new IncomeController({
    req,
    res,
    action: "read",
  });
  await controller.handleRequest();
});

router.get("/income/history", isAuthenticated(), async (req, res) => {
  const controller = new TransactionHistoryController({
    req,
    res,
    action: "incomeHistory",
  });
  await controller.handleRequest();
});

router.get("/income/:id", isAuthenticated(), async (req, res) => {
  const controller = new IncomeController({
    req,
    res,
    action: "readOne",
  });
  await controller.handleRequest();
});

router.delete("/income/:id", isAuthenticated(), async (req, res) => {
  const controller = new IncomeController({
    req,
    res,
    action: "destroy",
  });
  await controller.handleRequest();
});

export { router };
