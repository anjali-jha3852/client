import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import Test from "../models/Test.js";
import { verifyAdmin } from "../middleware/authMiddleware.js";
import multer from "multer";
import XLSX from "xlsx";

const router = express.Router();

// -------------------- Admin Auth --------------------
// Register admin
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "Username and password required" });

    const existing = await Admin.findOne({ username });
    if (existing) return res.status(400).json({ message: "Admin already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await Admin.create({ username, password: hashedPassword });

    res.status(201).json({ message: "Admin created successfully", admin: newAdmin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login admin
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// -------------------- Admin Test Routes --------------------

// Get all tests
router.get("/tests", verifyAdmin, async (req, res) => {
  try {
    const tests = await Test.find();
    res.json(tests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new test
router.post("/tests", verifyAdmin, async (req, res) => {
  try {
    const { name, domesticPrice, internationalPrice, precautions } = req.body;
    const test = await Test.create({ name, domesticPrice, internationalPrice, precautions });
    res.status(201).json({ message: "Test added successfully", test });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update test
router.put("/tests/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Test.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Test not found" });
    res.json({ message: "Test updated successfully", test: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete test
router.delete("/tests/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Test.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Test not found" });
    res.json({ message: "Test deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// -------------------- Bulk Upload --------------------

// -------------------- Multer Setup --------------------
// -------------------- Multer Setup --------------------
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB max
});

// -------------------- Bulk Upload --------------------
router.post("/tests/bulk", verifyAdmin, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // Read Excel
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    if (!data.length) return res.status(400).json({ message: "Excel file is empty" });

    // Validate each row
    const validData = data.map((row) => ({
      name: row.name || "",
      domesticPrice: Number(row.domesticPrice) || 0,
      internationalPrice: Number(row.internationalPrice) || 0,
      precautions: row.precautions || "",
    })).filter((row) => row.name); // require name

    if (!validData.length) return res.status(400).json({ message: "No valid test data found" });

    // Insert into DB
    const inserted = await Test.insertMany(validData);
    res.json({ message: `${inserted.length} tests uploaded successfully` });
  } catch (err) {
    console.error("Bulk upload error:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;