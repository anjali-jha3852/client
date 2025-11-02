import express from "express";
import multer from "multer";
import { getTests, addTest, updateTest, deleteTest, bulkUpload, 
     searchTests ,deleteAllTests } 
from "../controllers/testController.js";


import { verifyAdmin } from "../middleware/authMiddleware.js";


const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Routes
router.get("/", getTests); // must exist
router.get("/search", searchTests);

router.post("/", verifyAdmin, addTest);
router.put("/:id", verifyAdmin, updateTest);
router.delete("/:id", verifyAdmin, deleteTest);
router.post("/bulk", verifyAdmin, upload.single("file"), bulkUpload);
router.delete("/all", verifyAdmin, deleteAllTests);


export default router;

