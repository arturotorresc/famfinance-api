import express from "express";
import ExpenseController from "../controllers/ExpenseController";

const router = express.Router();

router.post(`/create/expense`, async (req, res) => {
    const controller = new ExpenseController({
      req,
      res,
      action: "create",
    });
    await controller.handleRequest();
  });
  
  router.get("/get/expenses", async(req, res) => {
    const controller = new ExpenseController({
      req,
      res,
      action: "read"
    });
    await controller.handleRequest();
  });
  
export { router };
