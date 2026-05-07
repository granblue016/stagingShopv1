import "dotenv/config";
import { analyzeSentiment } from "./sentiment-analyzer";

async function singleTest() {
  console.log("=== Single Review Test ===\n");
  
  const testReview = "Máy này tuyệt vời! Mình đã dùng được 3 tháng và rất hài lòng. Màn hình sắc nét, bàn phím êm, pin trâu được 7-8 tiếng dùng văn phòng. Giá cả hợp lý so với cấu hình. Rất recommend cho sinh viên và dân văn phòng.";
  
  console.log(`Review: "${testReview}"\n`);
  
  const result = await analyzeSentiment(testReview);
  
  console.log("\n=== Result ===");
  console.log(JSON.stringify(result, null, 2));
}

singleTest().catch(console.error);
