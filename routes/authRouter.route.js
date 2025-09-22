import express from "express";
import { signup, forgotPassword, login, resendCode, resetPassword, verifyCode } from "../controllers/authController.js";
import { protecteRoute } from "../middlewares/protectRoutes.js";

const router = express.Router();

// Routes
router.post('/signup', signup);
router.post('/login', login);
router.get('/send-code', protecteRoute, resendCode);
router.post('/verify-code', protecteRoute, verifyCode);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;