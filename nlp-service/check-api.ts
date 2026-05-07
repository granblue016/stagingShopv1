import dotenv from "dotenv";
dotenv.config();
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

// Load API key
if (!process.env.GOOGLE_API_KEY) {
  console.error("❌ GOOGLE_API_KEY không được tìm thấy trong .env");
  process.exit(1);
}

console.log("🔑 API Key loaded:", process.env.GOOGLE_API_KEY?.substring(0, 10) + "...");

// Khởi tạo Gemini
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-pro-latest",
  apiKey: process.env.GOOGLE_API_KEY,
  apiVersion: "v1beta"
});

async function testAPI() {
  console.log("🚀 Bắt đầu test API Gemini...");
  
  const testReview = "Máy này tuyệt vời! Màn hình sắc nét, pin trâu, rất hài lòng.";
  const prompt = `Phân tích sentiment review sau và trả về JSON duy nhất:

Review: "${testReview}"

Trả về JSON với format:
{
  "rating_score": 5,
  "sentiment": "Positive", 
  "is_fake_review": false,
  "aspects": {
    "pin": "Tốt",
    "man_hinh": "Tốt", 
    "hieu_nang": "Không có thông tin"
  },
  "justification": "Người dùng hài lòng với màn hình và pin",
  "competitor_mentioned": null,
  "needs_support": false,
  "technical_issue": null,
  "primary_emotion": "Satisfaction",
  "priority": "LOW",
  "helpfulness_score": 7
}

CHỈ TRẢ VỀ JSON, KHÔNG TEXT GIẢI THÍCH.`;

  try {
    console.log("📤 Gọi API...");
    const response = await llm.invoke(prompt);
    const text = response.content as string;
    
    console.log("📥 Response từ API:");
    console.log(text);
    console.log("---");
    
    // Parse JSON
    let jsonText = text.trim();
    if (text.includes('```json')) {
      jsonText = text.split('```json')[1].split('```')[0].trim();
    } else if (text.includes('```')) {
      jsonText = text.split('```')[1].split('```')[0].trim();
    }
    
    // Xóa ký tự không phải JSON
    jsonText = jsonText.replace(/^[^{[]*/, '').replace(/[^}\]]*$/, '');
    
    console.log("🔧 JSON sau khi xử lý:");
    console.log(jsonText);
    
    const result = JSON.parse(jsonText);
    console.log("✅ Parse JSON thành công!");
    console.log("📊 Kết quả:");
    console.log(`- Rating: ${result.rating_score}`);
    console.log(`- Sentiment: ${result.sentiment}`);
    console.log(`- Priority: ${result.priority}`);
    
    return result;
  } catch (error) {
    console.error("❌ Lỗi khi test API:");
    console.error(error);
    throw error;
  }
}

// Chạy test
testAPI()
  .then(() => {
    console.log("🎉 Test API thành công!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Test API thất bại!");
    process.exit(1);
  });
