import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

import adminRoutes from "./routes/adminRoutes.js";
import testRoutes from "./routes/testRoutes.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/admin", adminRoutes);
app.use("/api/tests", testRoutes);

// Root API route
app.get("/api", (req, res) => res.send("API is running..."));

// Handle unknown API routes (fixed: no *, just a function)
app.use("/api", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// Serve frontend build safely
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "dist")));

// Catch-all for frontend (only if frontend exists)
app.get((req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// DB connect and server start
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));

