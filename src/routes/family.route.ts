import express from "express";
import FamilyController from "../controllers/FamilyController";

const router = express.Router();

router.get("/get/families", async(req, res) => {
    const controller = new FamilyController({
      req,
      res,
      action: "read"
    });
    await controller.handleRequest();
  });

export { router };
