import express from "express";
import {
  createTable,
  getTables,
  getTableById,
  updateTable,
  deleteTable,
} from "../controllers/tableController.js";
import { protecteRoute } from "../middlewares/protectRoutes.js";
import checkRole from "../middlewares/checkRole.js";

const router = express.Router();

// Public: view tables
router.get("/", getTables);
router.get("/:id", getTableById);

// Admin protected: manage tables
router.use(protecteRoute, checkRole("admin"));

router.post("/", createTable);
router.put("/:id", updateTable);
router.delete("/:id", deleteTable);

export default router;
