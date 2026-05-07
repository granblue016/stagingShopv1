import "dotenv/config";
import { analyzeSentiment } from "./sentiment-analyzer";

async function testMultilingualSupport() {
  console.log("=== Testing Multilingual Support ===\n");
  
  const testCases = [
    {
      name: "Test 1 (Tiếng Anh)",
      text: "This laptop is absolute fire!",
      expectedSentiment: "Positive",
      expectedRating: 5
    },
    {
      name: "Test 2 (Tiếng Việt)",
      text: "San pham nay dung rat tot, thiet ke dep.",
      expectedSentiment: "Positive",
      expectedRating: 4
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`--- ${testCase.name} ---`);
    console.log(`Input: "${testCase.text}"`);
    console.log(`Expected: Sentiment=${testCase.expectedSentiment}, Rating=${testCase.expectedRating}`);
    
    try {
      const result = await analyzeSentiment(testCase.text);
      
      console.log(`Actual: Sentiment=${result.sentiment}, Rating=${result.rating_score}`);
      console.log(`Justification: ${result.justification}`);
      
      // Verify results
      const sentimentMatch = result.sentiment === testCase.expectedSentiment;
      const ratingMatch = result.rating_score >= testCase.expectedRating - 1 && result.rating_score <= testCase.expectedRating + 1;
      
      console.log(`✅ Sentiment: ${sentimentMatch ? 'PASS' : 'FAIL'}`);
      console.log(`✅ Rating: ${ratingMatch ? 'PASS' : 'FAIL'}`);
      
      if (!sentimentMatch || !ratingMatch) {
        console.log(`❌ TEST FAILED for ${testCase.name}`);
      } else {
        console.log(`✅ TEST PASSED for ${testCase.name}`);
      }
      
    } catch (error) {
      console.error(`❌ ERROR testing ${testCase.name}:`, error);
    }
    
    console.log("\n" + "=".repeat(50) + "\n");
  }
}

testMultilingualSupport();
