import express from "express";
import { config } from "dotenv";
import connectDb from "./utils/db.js";
import cors from "cors";
import authRouter from "./routes/authRouter.route.js";
import dashboardRouter from "./routes/dashboardRouter.route.js";
import userRouter from "./routes/userRouter.route.js";
import wishlistRoutes from "./routes/wishlistRoutes.route.js";
import CartRoutes from "./routes/cartRoutes.route.js";
import OrderRoutes from "./routes/orderRoutes.route.js";
import ShippingMethodsRoutes from "./routes/shippingRoutes.route.js";
import reservationRoutes from "./routes/reservationRoutes.route.js";
import tableRoutes from "./routes/tableRoutes.route.js";

// Setup
config();
connectDb();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/admin", dashboardRouter);
app.use("/user", userRouter);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", CartRoutes);
app.use("/api/order", OrderRoutes);
app.use("/api/shipping-method", ShippingMethodsRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/reservation", reservationRoutes);

// Handle Errors
app.use((err, req, res, next) => {
  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({ message: "عدد الملفات أكبر من المطلوب" });
  }
  res.status(err.code || 500).json({
    success: false,
    message: err.message || "Server Error",
    errors: err.errors || null,
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
