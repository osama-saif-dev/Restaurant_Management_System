import express from "express";
import { protecteRoute } from "../middlewares/protectRoutes.js";
import checkRole from "../middlewares/checkRole.js";
import {
  createReservation,
  cancelReservation,
  listAllReservations,
  listMyReservations,
  updateReservationStatus,
} from "../controllers/reservationController.js";

const router = express.Router();

// User actions
router.use(protecteRoute);
router.post("/", createReservation);
router.get("/my", listMyReservations);
router.patch("/:id/cancel", cancelReservation);

// Admin actions
router.get("/", checkRole("admin"), listAllReservations);
router.patch("/:id/status", checkRole("admin"), updateReservationStatus);

export default router;
