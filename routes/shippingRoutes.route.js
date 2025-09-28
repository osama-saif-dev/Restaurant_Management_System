import express from "express";
import { protecteRoute } from "../middlewares/protectRoutes.js";
import checkRole from "../middlewares/checkRole.js";
import {
  createShippingMethod,
  updateShippingMethod,
  deleteShippingMethod,
  listShippingMethods,
} from "../controllers/shippingController.js";

const router = express.Router();

// public for checkout listing
router.get("/", listShippingMethods);

router.use(protecteRoute);
router.use(checkRole("admin"));

// admin protected
router.post("/", createShippingMethod);
router.put("/:id", updateShippingMethod);
router.delete("/:id", deleteShippingMethod);

export default router;
