import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Import Routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import postsRoutes from "./routes/posts.js";
import interactionsRoutes from "./routes/interactions.js";
import dashboardRoutes from "./routes/dashboard.js";

dotenv.config();

// Initialize App
const app = express();

// --- MODIFIED SECTION START: ROBUST CORS & JSON ---
// Replace your old "app.use(cors())" with this block:
app.use(cors({
  origin: "http://localhost:3000", // Explicitly allow your React App
  methods: ["GET", "POST", "PUT", "DELETE"], // Allow update (PUT) actions
  credentials: true
}));

app.use(express.json()); 
// --- MODIFIED SECTION END ---

// --- 1. DATABASE CONNECTION ---
const connectDB = async () => {
  try {
    const dbURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/collabhub";
    await mongoose.connect(dbURI);
    console.log("✅ MongoDB Local Connected Successfully");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};

connectDB();

// --- 3. ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/interactions", interactionsRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Collab-Hub Backend is Running...");
});

// --- 4. START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
  console.log(`📡 Ready to receive data from Frontend`);
});