import express from "express";
import SessionController from "../controllers/SessionController";

const router = express.Router();

router.get(`/me`, async (req, res) => {
  const controller = new SessionController({
    req,
    res,
    action: "me",
  });
  await controller.handleRequest();
});

router.get("/logout", async (req, res) => {
  const controller = new SessionController({
    req,
    res,
    action: "logout",
  });
  await controller.handleRequest();
})

export { router };
