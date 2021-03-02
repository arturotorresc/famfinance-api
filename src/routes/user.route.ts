import express from "express";
import UserController from "../controllers/UserController";

const router = express.Router();

router.post(`/create/user`, async (req, res) => {
  const controller = new UserController({
    req,
    res,
    action: "create",
  });
  await controller.handleRequest();
});

router.get("/get/users", async(req, res) => {
  const controller = new UserController({
    req,
    res,
    action: "read"
  });
  await controller.handleRequest();
});

export { router };
