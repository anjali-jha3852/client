import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";

import adminRoutes from "./routes/adminRoutes.js";
import testRoutes from "./routes/testRoutes.js";

dotenv.config();

const app = express();

// -------------------- CORS --------------------
const allowedOrigins = [
  "https://scan4health-test-app.vercel.app",
  "http://localhost:5173",
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (!allowedOrigins.includes(origin)) {
        return callback(new Error(`CORS not allowed for ${origin}`), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// -------------------- Body Parser --------------------
app.use(express.json());

// -------------------- API Routes --------------------
app.use("/api/admin", adminRoutes);
app.use("/api/tests", testRoutes);

// -------------------- Health Check --------------------
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running!" });
});

// -------------------- Serve React frontend --------------------
const __dirname = path.resolve();
const frontendPath = path.join(__dirname, "../vite-project/dist");

app.use(express.static(frontendPath));

// Serve index.html for React Router routes
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// -------------------- Start Server --------------------
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));




