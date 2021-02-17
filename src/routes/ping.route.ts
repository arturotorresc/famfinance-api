import express from "express";
import PingController from "../controllers/PingController";

const router = express.Router();

router.post(`/ping`, async (req, res) => {
  /*
  The action param specifies the method that will handle
  this request. Note that you also have to create a 
  pingParams method that returns a Joi.schema to validate
  the params.
  */
  const controller = new PingController({
    req,
    res,
    action: "ping",
  });
  await controller.handleRequest();
});

export { router };
