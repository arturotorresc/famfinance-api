import express from "express";
import PolicyController from "../controllers/PolicyController";

const router = express.Router();

router.get("/get/policies", async(req, res) => {
    const controller = new PolicyController({
      req,
      res,
      action: "read"
    });
    await controller.handleRequest();
  });

export { router };
