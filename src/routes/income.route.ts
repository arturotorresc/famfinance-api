import express from "express";
import IncomeController from "../controllers/IncomeController";

const router = express.Router();

router.post(`/create/income`, async (req, res) => {
    const controller = new IncomeController({
      req,
      res,
      action: "create",
    });
    await controller.handleRequest();
  });
  
  router.get("/get/incomes", async(req, res) => {
    const controller = new IncomeController({
      req,
      res,
      action: "read"
    });
    await controller.handleRequest();
  });

export { router };
