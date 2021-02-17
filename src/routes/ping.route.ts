import express from "express";
import PingController from "../controllers/PingController";

const router = express.Router();

router.post(`/ping`, async (req, res) => {
  const controller = new PingController({
    req,
    res,
    action: "ping",
  });
  await controller.handleRequest();
});

export { router };
