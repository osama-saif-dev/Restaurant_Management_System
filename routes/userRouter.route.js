import express from "express";
import { getOffers } from "../controllers/userController.js";

const router = express.Router();

// Routes
router.get('/offers', getOffers);


export default router;