import mongoose from "mongoose";

const testSchema = new mongoose.Schema({
  name: { type: String, required: true },
  domesticPrice: { type: Number, required: true },
  internationalPrice: { type: Number, required: true },
  precautions: { type: String, default: "" },
});

export default mongoose.models.Test || mongoose.model("Test", testSchema);
