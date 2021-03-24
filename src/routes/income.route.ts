import express from "express";
import IncomeController from "../controllers/IncomeController";
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

router.post(`/incomeWeekly`, isAuthenticated(), async (req, res) => {
  const controller = new IncomeController({
    req,
    res,
    action: "createWeekly",
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

router.delete("/income/:id", isAuthenticated(), async (req, res) => {
  const controller = new IncomeController({
    req,
    res,
    action: "destroy",
  });
  await controller.handleRequest();
});

export { router };
