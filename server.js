import express from "express";
import { config } from 'dotenv';
import connectDb from "./utils/db.js";
import cors from "cors";
import authRouter from "./routes/authRouter.route.js";

// Setup
config();
connectDb();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRouter);

// Handle Errors
app.use((err, req, res, next) => {
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
