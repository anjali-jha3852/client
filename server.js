import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

import adminRoutes from "./routes/adminRoutes.js";
import testRoutes from "./routes/testRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// -------------------- API Routes --------------------
app.use("/api/admin", adminRoutes);
app.use("/api/tests", testRoutes);

// -------------------- Root route --------------------
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Optional: simple API test route
app.get("/api", (req, res) => res.send("API is running"));

// -------------------- Serve React frontend --------------------
const __dirname = path.resolve();
const frontendPath = path.join(__dirname, "../vite-project/dist");
app.use(express.static(frontendPath));

// Catch-all for frontend routes (React Router), but exclude /api and /
app.get(/^\/(?!api|$).*/, (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// -------------------- Start Server --------------------
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error("❌ MongoDB connection error:", err));






