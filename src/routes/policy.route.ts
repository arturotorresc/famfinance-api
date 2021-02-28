import express from "express";
import PolicyController from "../controllers/PolicyController";

const router = express.Router();

router.post("/create/policy", PolicyController.createPolicy);
router.get("/get/policies", PolicyController.getAllPolicies);

export { router };
