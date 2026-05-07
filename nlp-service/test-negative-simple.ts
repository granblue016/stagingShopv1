import "dotenv/config";
import { analyzeSentiment } from "./sentiment-analyzer";

async function testNegativeSentiment() {
  console.log("=== Testing Negative Sentiment ===");
  console.log("Test case: 'This product is a total disaster'");
  
  try {
    const result = await analyzeSentiment("This product is a total disaster");
    
    console.log("\n--- Test Results ---");
    console.log(`Sentiment: ${result.sentiment}`);
    console.log(`Rating Score: ${result.rating_score}`);
    console.log(`Justification: ${result.justification}`);
    
    // Check requirements
    console.log("\n--- Verification ---");
    
    if (result.sentiment === 'Negative') {
      console.log("✅ SUCCESS: Sentiment is Negative");
    } else {
      console.log(`❌ FAILURE: Expected Negative, got ${result.sentiment}`);
    }
    
    if (result.rating_score === 1) {
      console.log("✅ SUCCESS: Rating score is 1");
    } else {
      console.log(`❌ FAILURE: Expected rating_score=1, got ${result.rating_score}`);
    }
    
    if (result.justification.includes('Hugging Face') || result.justification.includes('distilbert')) {
      console.log("✅ SUCCESS: Justification contains Hugging Face model info");
    } else {
      console.log("❌ FAILURE: Justification should contain Hugging Face or distilbert info");
      console.log(`   Current justification: ${result.justification}`);
    }
    
    // Check if it contains the old simulated text
    if (result.justification.includes('dựa trên') || result.justification.includes('Phân tích dựa trên')) {
      console.log("❌ FAILURE: Justification still contains simulated Vietnamese text");
    } else {
      console.log("✅ SUCCESS: No simulated Vietnamese text found");
    }
    
  } catch (error) {
    console.error("Error testing:", error);
  }
}

testNegativeSentiment();
