import express from "express";
import UserController from "../controllers/UserController";

const router = express.Router();

router.post(`/users`, async (req, res) => {
  const controller = new UserController({
    req,
    res,
    action: "create",
  });
  await controller.handleRequest();
});

export { router };
