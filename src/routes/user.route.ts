import express from "express";
import UserController from "../controllers/UserController";

const router = express.Router();

router.post("/create/user", UserController.createUser);
router.get("/get/users", UserController.getAllUsers);

export { router };
