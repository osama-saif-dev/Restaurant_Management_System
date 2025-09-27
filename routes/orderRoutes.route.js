import express from "express";
import { protecteRoute } from "../middlewares/protectRoutes.js";
import checkRole from "../middlewares/checkRole.js";
import {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/orderController.js";

const router = express.Router();

router.use(protecteRoute);

// Admin only
router.get("/all", checkRole("admin"), getAllOrders);
router.patch("/:id/status", checkRole("admin"), updateOrderStatus);

// Routes
router.post("/", createOrder);
router.get("/", getMyOrders);
router.get("/:id", getOrderById);

export default router;
