import "dotenv/config";
import { analyzeSentiment } from "./sentiment-analyzer";

async function debugAnalyzeSentiment() {
  console.log("=== DEBUG: Testing analyzeSentiment function directly ===");
  
  const testText = "This is a terrible product, I hate it. It is awful and does not work at all.";
  
  try {
    console.log("📝 Input text:", testText);
    console.log("🔍 Calling analyzeSentiment...");
    
    const result = await analyzeSentiment(testText);
    
    console.log("✅ Result:", JSON.stringify(result, null, 2));
    console.log("🎯 Sentiment:", result.sentiment);
    console.log("⭐ Rating:", result.rating_score);
    console.log("💬 Justification:", result.justification);
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

debugAnalyzeSentiment().catch(console.error);
