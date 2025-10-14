import express from "express";
import multer from "multer";
import XLSX from "xlsx";
import Admin from "../models/Admin.js";
import Test from "../models/Test.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { adminAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// -------------------- Admin Registration --------------------
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    const existing = await Admin.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await Admin.create({ username, password: hashedPassword });

    res.status(201).json({ message: "Admin created successfully", admin: newAdmin });
  } catch (error) {
    res.status(500).json({ message: "Error creating admin", error: error.message });
  }
});

// -------------------- Admin Login --------------------
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Login error", error: error.message });
  }
});

// -------------------- Bulk Upload Tests --------------------
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/tests/bulk", adminAuth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    const testsToInsert = data.map(row => ({
      name: row.name,
      domesticPrice: Number(row.domesticPrice),
      internationalPrice: Number(row.internationalPrice),
      precautions: row.precautions || "",
    }));

    await Test.insertMany(testsToInsert);
    res.json({ message: `${testsToInsert.length} tests uploaded successfully` });
  } catch (error) {
    res.status(500).json({ message: "Error uploading file", error: error.message });
  }
});

// -------------------- CRUD Routes (Require Token) --------------------

// Get all tests (for admin dashboard)
router.get("/tests", adminAuth, async (req, res) => {
  try {
    const tests = await Test.find();
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tests", error: error.message });
  }
});

// Add new test
router.post("/tests", adminAuth, async (req, res) => {
  try {
    const newTest = await Test.create(req.body);
    res.status(201).json(newTest);
  } catch (error) {
    res.status(500).json({ message: "Error creating test", error: error.message });
  }
});

// Update test
router.put("/tests/:id", adminAuth, async (req, res) => {
  try {
    const updated = await Test.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Test not found" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating test", error: error.message });
  }
});

// Delete test
router.delete("/tests/:id", adminAuth, async (req, res) => {
  try {
    const deleted = await Test.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Test not found" });
    res.json({ message: "Test deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting test", error: error.message });
  }
});

export default router;
