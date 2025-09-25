import express from "express";
import { config } from 'dotenv';
import connectDb from "./utils/db.js";
import cors from "cors";
import authRouter from "./routes/authRouter.route.js";
import dashboardRouter from "./routes/dashboardRouter.route.js";
import userRouter from "./routes/userRouter.route.js";

// Setup
config();
connectDb();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/admin', dashboardRouter);
app.use('/user', userRouter); 

// Handle Errors
app.use((err, req, res, next) => {
  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({ message: "عدد الملفات أكبر من المطلوب" });
  }
    res.status(err.code || 500).json({
        success: false,
        message: err.message || 'Server Error',
        errors: err.errors || null
    });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
