import express from "express";
import UserController from "../controllers/UserController";
const router = express.Router();

router.get("/dashboard", async (req, res) => {
  res.send("usuario encontrado")
})

//login page
router.get("/login", async (req, res) => {
  res.send("login page")
})

//verify user
router.post("/login", async (req, res) => {
  const controller = new UserController({
    req,
    res,
    action: "login",
  });
  await controller.handleRequest();
})

//create user
router.post(`/users`, async (req, res) => {
  const controller = new UserController({
    req,
    res,
    action: "create",
  });
  await controller.handleRequest();
});

export { router };
