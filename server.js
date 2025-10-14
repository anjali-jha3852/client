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

// API routes
app.use("/api/admin", adminRoutes);
app.use("/api/tests", testRoutes);

// Test API route
app.get("/api", (req, res) => res.send("Server is running"));

// Serve frontend from the correct folder
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "../vite-project/dist")));

// Catch-all for frontend routes (React Router)
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../vite-project/dist", "index.html"));
});

// Start server
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error(err));





