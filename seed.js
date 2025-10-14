import mongoose from "mongoose";
import dotenv from "dotenv";
import Test from "./models/Test.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await Test.deleteMany(); // clear old data
  await Test.insertMany([
    {
      name: "Blood Sugar Test",
      domesticPrice: 200,
      internationalPrice: 400,
      precautions: "Fasting for 8 hours before test"
    },
    {
      name: "Cholesterol Test",
      domesticPrice: 250,
      internationalPrice: 500,
      precautions: "Avoid fatty food before test"
    },
    {
      name: "COVID-19 PCR",
      domesticPrice: 600,
      internationalPrice: 1200,
      precautions: "No precautions needed"
    },
    {
      name: "Vitamin D Test",
      domesticPrice: 350,
      internationalPrice: 700,
      precautions: "No fasting required"
    },
    {
      name: "Thyroid Test",
      domesticPrice: 300,
      internationalPrice: 650,
      precautions: "Take test in morning"
    },
  ]);

  console.log("✅ Sample data added");
  mongoose.connection.close();
});
