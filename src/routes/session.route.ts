import express from "express";
import SessionController from "../controllers/SessionController";

const router = express.Router();

router.get(`/auth-check`, async (req, res) => {
  const controller = new SessionController({
    req,
    res,
    action: "authCheck",
  });
  await controller.handleRequest();
});

export { router };
