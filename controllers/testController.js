import Test from "../models/Test.js";
import XLSX from "xlsx";

// Get all tests
export const getTests = async (req, res) => {
  try {
    const tests = await Test.find();
    res.json(tests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Search Tests (for user page — fast filtering)
export const searchTests = async (req, res) => {
  try {
    const { q } = req.query;

    const tests = await Test.find({
      name: { $regex: q, $options: "i" } // case-insensitive search
    });

    res.json(tests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Add new test
export const addTest = async (req, res) => {
  try {
    const newTest = await Test.create(req.body);
    res.status(201).json(newTest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update test
export const updateTest = async (req, res) => {
  try {
    const updated = await Test.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete test
export const deleteTest = async (req, res) => {
  try {
    await Test.findByIdAndDelete(req.params.id);
    res.json({ message: "Test deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Bulk upload
export const bulkUpload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    const testsToInsert = data.map((row) => ({
      name: row.name,
      domesticPrice: Number(row.domesticPrice),
      internationalPrice: Number(row.internationalPrice),
      precautions: row.precautions || "",
    }));

    await Test.insertMany(testsToInsert);
    res.json({ message: `${testsToInsert.length} tests uploaded successfully` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//all delete
export const deleteAllTests = async (req, res) => {
  try {
    await Test.deleteMany({}); // delete all docs
    res.status(200).json({ message: "✅ All tests deleted successfully" });
  } catch (error) {
    console.error("Error deleting all tests:", error);
    res.status(500).json({ message: "❌ Failed to delete tests", error });
  }
};


