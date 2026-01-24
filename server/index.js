import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import admin from "./firebase.js";
import userRoutes from "./routes/user.routes.js";

dotenv.config();

const app = express(); // ✅ app FIRST

/* =============== MIDDLEWARE =============== */
app.use(cors());
app.use(express.json());

/* =============== ROUTES =============== */
app.use("/api", userRoutes); // ✅ routes AFTER app

/* Health check */
app.get("/", (req, res) => {
  res.send("🚀 CollabHub backend running with Firebase + MongoDB");
});

/* =============== ERROR HANDLING =============== */
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({ success: false, message: err.message });
});

/* =============== DATABASE =============== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

/* =============== START SERVER =============== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
