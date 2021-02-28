import express from "express";
import ExpenseController from "../controllers/ExpenseController";

const router = express.Router();

router.post("/create/expense", ExpenseController.createExpense);
router.get("/get/expenses", ExpenseController.getAllExpenses);

export { router };
