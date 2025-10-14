import express from "express";
import Test from "../models/Test.js";

const router = express.Router();

// Public GET all tests (optional)
router.get("/", async (req, res) => {
  try {
    const tests = await Test.find();
    res.json(tests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
