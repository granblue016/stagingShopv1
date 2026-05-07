import "dotenv/config";
import express, { Request, Response } from "express";
import { analyzeSentiment } from "./sentiment-analyzer";

const app = express();
const PORT = 3001;

// Middleware to parse JSON
app.use(express.json());

// POST /analyze endpoint
app.post("/analyze", async (req: Request, res: Response) => {
  try {
    const { reviewText } = req.body;

    if (!reviewText) {
      return res.status(400).json({ error: "reviewText is required" });
    }

    const result = await analyzeSentiment(reviewText);
    res.json(result);
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    res.status(500).json({ error: "Failed to analyze sentiment" });
  }
});

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", service: "nlp-service" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 NLP Service API running on http://localhost:${PORT}`);
  console.log(`📊 POST /analyze - Analyze sentiment`);
  console.log(`❤️  GET /health - Health check`);
});
