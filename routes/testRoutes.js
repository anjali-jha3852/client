import express from "express";
import multer from "multer";
import { getTests, addTest, updateTest, deleteTest, bulkUpload } from "../controllers/testController.js";
import { adminAuth } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Routes
router.get("/", getTests); // Public for users
router.post("/", adminAuth, addTest);
router.put("/:id", adminAuth, updateTest);
router.delete("/:id", adminAuth, deleteTest);
router.post("/bulk", adminAuth, upload.single("file"), bulkUpload);

export default router;

