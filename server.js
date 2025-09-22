import express from "express";
import { config } from 'dotenv';
import connectDb from "./utils/db.js";

config();
connectDb();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the Restaurant Management System API");
});

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
