import "dotenv/config";
import express, { Request, Response } from "express";
import { analyzeSentiment } from "./sentiment-analyzer";

const app = express();
const PORT = 3002; // Use different port to avoid conflicts

app.use(express.json());

app.post("/analyze", async (req: Request, res: Response) => {
  try {
    console.log("=== SERVER DEBUG: Received request ===");
    const { reviewText } = req.body;
    console.log("📝 reviewText:", reviewText);
    console.log("📊 typeof reviewText:", typeof reviewText);
    console.log("🔍 About to call analyzeSentiment...");

    if (!reviewText) {
      console.log("❌ reviewText is missing");
      return res.status(400).json({ error: "reviewText is required" });
    }

    console.log("✅ Calling analyzeSentiment with:", reviewText);
    const result = await analyzeSentiment(reviewText);
    console.log("🎯 Got result:", JSON.stringify(result, null, 2));
    
    res.json(result);
  } catch (error) {
    console.error("❌ Error in server:", error);
    res.status(500).json({ error: "Failed to analyze sentiment" });
  }
});

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", service: "debug-nlp-service" });
});

app.listen(PORT, () => {
  console.log(`🚀 DEBUG NLP Service API running on http://localhost:${PORT}`);
  console.log(`📊 POST /analyze - Analyze sentiment`);
  console.log(`❤️  GET /health - Health check`);
});
