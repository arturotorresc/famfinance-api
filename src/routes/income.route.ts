import express from "express";
import IncomeController from "../controllers/IncomeController";

const router = express.Router();

router.post("/create/income", IncomeController.createIncome);
router.get("/get/incomes", IncomeController.getAllIncomes);

export { router };
