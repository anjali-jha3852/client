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
  "https://scan4health-test-app.vercel.app", // your deployed frontend
  "http://localhost:5173",                   // local dev
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error(`CORS not allowed for ${origin}`), false);
    }
    return callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true
}));

// -------------------- Body Parser --------------------
app.use(express.json());

// -------------------- API Routes --------------------
app.use("/api/admin", adminRoutes);
app.use("/api/tests", testRoutes);

// -------------------- Health Check --------------------
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running!" });
});

// -------------------- Serve Frontend --------------------
const __dirname = path.resolve();
const frontendPath = path.join(__dirname, "dist"); // now inside backend
app.use(express.static(frontendPath));

// Serve React Router routes
app.get(/^\/(?!api|$).*/, (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// -------------------- Start Server --------------------
const PORT = process.env.PORT || 5001;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error("❌ MongoDB connection error:", err));





