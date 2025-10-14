import mongoose from "mongoose";

const testSchema = new mongoose.Schema({
  name: { type: String, required: true },
  domesticPrice: Number,
  internationalPrice: Number,
  precautions: String,
});

export default mongoose.model("Test", testSchema);
