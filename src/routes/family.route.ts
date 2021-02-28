import express from "express";
import FamilyController from "../controllers/FamilyController";

const router = express.Router();

router.post("/create/family", FamilyController.createFamily);
router.get("/get/families", FamilyController.getAllFamilies);

export { router };
