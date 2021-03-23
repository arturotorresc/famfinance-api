import express from "express";
import PolicyController from "../controllers/PolicyController";

const router = express.Router();

router.put(`/policy/give-permission`, async (req, res) => {
  const controller = new PolicyController({
    req,
    res,
    action: "givePermission",
  });
  await controller.handleRequest();
});

router.put(`/policy/revoke-permission`, async (req, res) => {
  const controller = new PolicyController({
    req,
    res,
    action: "revokePermission",
  });
  await controller.handleRequest();
});

export { router };
