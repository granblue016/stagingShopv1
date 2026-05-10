import { HfInference } from "@huggingface/inference";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

// Schema cho output của sentiment analyzer
const sentimentSchema = z.object({
  rating_score: z.number().min(1).max(5).describe("Đánh giá từ 1 đến 5 sao"),
  sentiment: z.enum(["Positive", "Negative", "Neutral"]).describe("Cảm xúc của đánh giá"),
  is_fake_review: z.boolean().describe("Đánh giá này có phải là giả mạo không"),
  aspects: z.object({
    pin: z.string().describe("Đánh giá về Pin (Tốt/Kém/Trung bình/Không có thông tin)"),
    man_hinh: z.string().describe("Đánh giá về Màn hình (Tốt/Kém/Trung bình/Không có thông tin)"),
    hieu_nang: z.string().describe("Đánh giá về Hiệu năng (Tốt/Kém/Trung bình/Không có thông tin)")
  }).describe("Phân tích chi tiết từng khía cạnh của sản phẩm"),
  justification: z.string().describe("Giải thích lý do AI đưa ra kết quả phân tích, bao gồm các từ khóa hoặc ngữ cảnh quan trọng"),
  competitor_mentioned: z.string().nullable().describe("Tên đối thủ cạnh tranh được nhắc đến trong review (Asus, Dell, HP, Lenovo, Apple, v.v.) hoặc null nếu không có"),
  needs_support: z.boolean().describe("Khách hàng có cần hỗ trợ kỹ thuật không (dựa trên việc mô tả lỗi phần cứng/phần mềm)"),
  technical_issue: z.string().nullable().describe("Mô tả lỗi kỹ thuật nếu có (màn hình xanh, hỏng phím, lỗi Windows, v.v.) hoặc null nếu không có"),
  primary_emotion: z.enum(["Anger", "Disappointment", "Joy", "Satisfaction", "Neutral"]).describe("Cảm xúc chính của người dùng"),
  priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).describe("Mức độ ưu tiên xử lý review (CRITICAL: lỗi kỹ thuật + tức giận, HIGH: có vấn đề cần xử lý, MEDIUM: review bình thường, LOW: review tích cực không có vấn đề)"),
  suggested_features: z.array(z.string()).describe("Danh sách các tính năng hoặc cải tiến mà khách hàng mong muốn (từ khóa: ước gì, giá mà, nên có, mong muốn, hy vọng...)").optional(),
  helpfulness_score: z.number().min(1).max(10).describe("Điểm chất lượng review từ 1-10 (review dài, phân tích chi tiết nhiều khía cạnh thì điểm cao; review ngắn cộc lốc điểm thấp)")
});

export type SentimentAnalysis = z.infer<typeof sentimentSchema>;

// Check nếu có API key hợp lệ
const hasValidApiKey = process.env.HUGGINGFACE_API_KEY && 
  !process.env.HUGGINGFACE_API_KEY.includes("please_replace") &&
  process.env.HUGGINGFACE_API_KEY !== "your_huggingface_api_key_here" &&
  process.env.HUGGINGFACE_API_KEY !== "demo_mode" &&
  process.env.HUGGINGFACE_API_KEY.length > 10;

// Log trạng thái load API key
if (hasValidApiKey) {
  console.log("--- ĐÃ LOAD API KEY THÀNH CÔNG ---");
  console.log("✅ API Key Hugging Face đã được load thành công");
} else {
  console.log("⚠️  API Key chưa được cấu hình. Chạy ở DEMO MODE.");
  console.log("   Để sử dụng API thật, vui lòng cập nhật HUGGINGFACE_API_KEY trong file .env");
}

// Khởi tạo Hugging Face Inference trực tiếp
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);


/**
 * Phân tích sentiment từ review của khách hàng sử dụng Hugging Face Inference API
 * @param review - Nội dung đánh giá của khách hàng
 * @returns Promise<SentimentAnalysis> - Kết quả phân tích sentiment
 */
export async function analyzeSentiment(review: string): Promise<SentimentAnalysis> {
  // Danh sách model đa ngôn ngữ ưu tiên để thử kết nối
  const models = [
    "nlptown/bert-base-multilingual-uncased-sentiment",    // Model đa ngôn ngữ mạnh mẽ, hỗ trợ 5 mức rating
    "cardiffnlp/twitter-xlm-roberta-base-sentiment",       // Model đa ngôn ngữ hiện đại từ Twitter
    "distilbert-base-multilingual-cased"                   // Model đa ngôn ngữ nhẹ và nhanh
  ];

  if (!hasValidApiKey) {
    console.log("🤖 Chạy ở ENHANCED DEMO MODE - Phân tích sentiment nâng cao...");
    
    // Enhanced demo mode logic - phân tích chi tiết dựa trên keywords và patterns
    const lowerReview = review.toLowerCase();
    
    // Phân tích sentiment chi tiết
    let sentiment: "Positive" | "Negative" | "Neutral" = "Neutral";
    let rating_score = 3;
    let primary_emotion: "Anger" | "Disappointment" | "Joy" | "Satisfaction" | "Neutral" = "Neutral";
    let priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" = "LOW";
    
    // Positive keywords và patterns
    const positiveKeywords = ['tốt', 'hay', 'nhanh', 'sắc nét', 'hài lòng', 'tuyệt vời', 'tuyệt', 'xuất sắc', 'hoàn hảo', 'đẹp', 'mượt', 'ổn', 'thích', 'yêu', 'good', 'great', 'amazing', 'excellent', 'perfect', 'love', 'awesome', 'fantastic'];
    const veryPositiveKeywords = ['rất tốt', 'tuyệt vời', 'hoàn hảo', 'xuất sắc', 'perfect', 'amazing', 'excellent'];
    
    // Negative keywords và patterns
    const negativeKeywords = ['kém', 'chậm', 'hỏng', 'tệ', 'thất vọng', 'dở', 'buồn', 'tức giận', 'ghét', 'bad', 'slow', 'broken', 'terrible', 'disappoint', 'hate'];
    const veryNegativeKeywords = ['rất tệ', 'khủng khiếp', 'tức giận', 'scam', 'đừng mua', 'hết cứu', 'lừa đảo', 'đồ lừa đảo', 'thất vọng', 'kinh khủng'];
    const angerKeywords = ['tức giận', 'ghét', 'scam', 'khủng khiếp', 'angry', 'hate'];
    
    // Technical issue keywords
    const technicalKeywords = ['lỗi', 'error', 'màn hình xanh', 'blue screen', 'hỏng phím', 'mất kết nối', 'crash', 'freeze'];
    
    // Competitor keywords
    const competitorKeywords = ['dell', 'hp', 'lenovo', 'asus', 'apple', 'macbook', 'msi'];
    
    // Count positive and negative sentiment
    const positiveCount = positiveKeywords.filter(keyword => lowerReview.includes(keyword)).length;
    const negativeCount = negativeKeywords.filter(keyword => lowerReview.includes(keyword)).length;
    
    // Determine sentiment
    if (veryPositiveKeywords.some(keyword => lowerReview.includes(keyword))) {
      sentiment = "Positive";
      rating_score = 5;
      primary_emotion = "Joy";
    } else if (veryNegativeKeywords.some(keyword => lowerReview.includes(keyword))) {
      sentiment = "Negative";
      rating_score = 1;
      primary_emotion = angerKeywords.some(keyword => lowerReview.includes(keyword)) ? "Anger" : "Disappointment";
      priority = "HIGH"; // Very negative content gets HIGH priority
    } else if (positiveCount > negativeCount) {
      sentiment = "Positive";
      rating_score = positiveCount >= 2 ? 4 : 3;
      primary_emotion = "Satisfaction";
    } else if (negativeCount > positiveCount) {
      sentiment = "Negative";
      rating_score = negativeCount >= 2 ? 2 : 3;
      primary_emotion = "Disappointment";
      priority = technicalKeywords.some(keyword => lowerReview.includes(keyword)) ? "MEDIUM" : "LOW";
    }
    
    // Extract competitor mentioned
    let competitor_mentioned: string | null = null;
    for (const competitor of competitorKeywords) {
      if (lowerReview.includes(competitor)) {
        competitor_mentioned = competitor.charAt(0).toUpperCase() + competitor.slice(1);
        break;
      }
    }
    
    // Enhanced aspect analysis
    const analyzeAspect = (aspectKeywords: string[], aspectName: string) => {
      const found = aspectKeywords.filter(keyword => lowerReview.includes(keyword));
      if (found.length === 0) return "Không có thông tin";
      
      const positiveInAspect = found.filter(keyword => 
        positiveKeywords.some(pos => keyword.includes(pos) || pos.includes(keyword))
      ).length;
      const negativeInAspect = found.filter(keyword => 
        negativeKeywords.some(neg => keyword.includes(neg) || neg.includes(keyword))
      ).length;
      
      if (positiveInAspect > negativeInAspect) return "Tốt";
      if (negativeInAspect > positiveInAspect) return "Kém";
      return "Trung bình";
    };
    
    // Extract suggested features
    const suggested_features: string[] = [];
    const featureKeywords = ['ước gì', 'giá mà', 'nên có', 'mong muốn', 'hy vọng', 'wish', 'hope', 'should have'];
    if (featureKeywords.some(keyword => lowerReview.includes(keyword))) {
      if (lowerReview.includes('đèn nền') || lowerReview.includes('backlight')) suggested_features.push('Đèn nền bàn phím');
      if (lowerReview.includes('thunderbolt') || lowerReview.includes('usb-c')) suggested_features.push('Cổng Thunderbolt/USB-C');
      if (lowerReview.includes('webcam') || lowerReview.includes('camera')) suggested_features.push('Webcam chất lượng cao');
      if (lowerReview.includes('loa') || lowerReview.includes('speaker')) suggested_features.push('Loa tốt hơn');
      if (lowerReview.includes('pin') || lowerReview.includes('battery')) suggested_features.push('Pin dung lượng cao hơn');
    }
    
    // Create enhanced demo response
    const demoResult: SentimentAnalysis = {
      rating_score: rating_score,
      sentiment: sentiment,
      is_fake_review: lowerReview.split(' ').filter(word => positiveKeywords.includes(word) || negativeKeywords.includes(word)).length > 5 && review.length < 50,
      aspects: {
        pin: analyzeAspect(['pin', 'battery', 'sạc'], 'pin'),
        man_hinh: analyzeAspect(['màn hình', 'screen', 'display', 'hiển thị'], 'màn hình'),
        hieu_nang: analyzeAspect(['hiệu năng', 'performance', 'cpu', 'ram', 'xử lý'], 'hiệu năng')
      },
      justification: `DEMO MODE: Hugging Face API key not configured. Please set up your API key to get real AI analysis. Current result: ${sentiment}`,
      competitor_mentioned: competitor_mentioned,
      needs_support: technicalKeywords.some(keyword => lowerReview.includes(keyword)) || lowerReview.includes('hỗ trợ') || lowerReview.includes('support'),
      technical_issue: technicalKeywords.some(keyword => lowerReview.includes(keyword)) ? 
        (technicalKeywords.find(keyword => lowerReview.includes(keyword)) || null) : null,
      primary_emotion: primary_emotion,
      priority: priority,
      suggested_features: suggested_features,
      helpfulness_score: Math.min(10, Math.max(1, Math.round((review.length / 20) + (suggested_features.length * 2) + (competitor_mentioned ? 2 : 0))))
    };
    
    console.log("✅ Phân tích enhanced demo hoàn tất");
    return demoResult;
  }

  // Retry mechanism với nhiều model
  console.log("🤖 Sử dụng Hugging Face API thật với cơ chế retry...");
  
  const prompt = `Bạn là một chuyên gia phân tích sentiment cho các đánh giá sản phẩm laptop. Hãy phân tích review sau và trả về kết quả THEO ĐÚNG FORMAT JSON sau:

{
  "rating_score": số từ 1-5,
  "sentiment": "Positive" hoặc "Negative" hoặc "Neutral",
  "is_fake_review": true hoặc false,
  "aspects": {
    "pin": "Tốt" hoặc "Kém" hoặc "Trung bình" hoặc "Không có thông tin",
    "man_hinh": "Tốt" hoặc "Kém" hoặc "Trung bình" hoặc "Không có thông tin",
    "hieu_nang": "Tốt" hoặc "Kém" hoặc "Trung bình" hoặc "Không có thông tin"
  },
  "justification": "giải thích chi tiết lý do phân tích",
  "competitor_mentioned": "tên đối thủ" hoặc null,
  "needs_support": true hoặc false,
  "technical_issue": "mô tả lỗi" hoặc null,
  "primary_emotion": "Anger" hoặc "Disappointment" hoặc "Joy" hoặc "Satisfaction" hoặc "Neutral",
  "priority": "CRITICAL" hoặc "HIGH" hoặc "MEDIUM" hoặc "LOW",
  "suggested_features": ["tính năng 1", "tính năng 2"],
  "helpfulness_score": số từ 1-10
}

Review cần phân tích: "${review}"

QUAN TRỌNG: CHỈ TRẢ VỀ JSON THUẦN TÚY, KHÔNG CÓ MARKDOWN, KHÔNG CÓ GIẢI THÍCH THÊM.`;

  // Thử từng model cho đến khi thành công
  for (let attempt = 0; attempt < models.length; attempt++) {
    const currentModel = models[attempt];
    console.log(`🔄 Đang thử kết nối API thật lần ${attempt + 1} với Model: ${currentModel}...`);
    
    try {
      // Sử dụng textClassification endpoint cho sentiment analysis
      let response;
      try {
        response = await hf.textClassification({
          model: currentModel,
          inputs: review
        });
      } catch (classificationError) {
        // Fallback: thử với fillMask endpoint
        try {
          response = await hf.fillMask({
            model: currentModel,
            inputs: `The review "${review.substring(0, 100)}" is </think>.`
          });
        } catch (maskError) {
          // Final fallback: thử với textGeneration
          response = await hf.textGeneration({
            model: currentModel,
            inputs: `Analyze sentiment: ${review.substring(0, 200)}`,
            parameters: {
              max_new_tokens: 50,
              temperature: 0.1,
              return_full_text: false
            }
          });
        }
      }
      
      console.log("✅ Kết nối API thật THÀNH CÔNG!");
      console.log("🤖 Model sử dụng:", currentModel);
      console.log("📄 Raw response từ Hugging Face:", JSON.stringify(response, null, 2));
      
      // Phân tích response thực tế từ Hugging Face API
      let sentiment: "Positive" | "Negative" | "Neutral" = "Neutral";
      let rating_score = 3;
      let primary_emotion: "Anger" | "Disappointment" | "Joy" | "Satisfaction" | "Neutral" = "Neutral";
      let justification = "";
      
      // Lấy nội dung thực tế từ response
      let actualResponse = "";
      
      // Xử lý different response types
      if (Array.isArray(response) && response.length > 0 && (response[0] as any).label) {
        // TextClassification response - format: [{label: "POSITIVE", score: 0.98}]
        const topResult = response[0] as any;
        actualResponse = `sentiment: ${topResult.label.toLowerCase()}, confidence: ${topResult.score}`;
      } else if ('generated_text' in response) {
        // TextGeneration response
        actualResponse = (response as any).generated_text.toLowerCase();
      } else if (Array.isArray(response) && response.length > 0 && 'sequence' in response[0]) {
        // FillMask response
        actualResponse = (response[0] as any).sequence.toLowerCase();
      } else {
        // Fallback: parse JSON string của response
        actualResponse = JSON.stringify(response).toLowerCase();
      }
      
      console.log("🔍 Analyzing actual AI response:", actualResponse);
      console.log("📊 Processing response with model type:", currentModel.includes('nlptown') ? 'nlptown (star rating)' : 'standard sentiment');
      
      // Phân tích sentiment dựa trên nội dung AI thực tế với model đa ngôn ngữ
      
      // Xử lý đặc biệt cho nlptown model (trả về "1 star", "2 stars", etc.)
      if (currentModel.includes('nlptown')) {
        console.log("⭐ Phát hiện nlptown model - xử lý star rating...");
        const starMatch = actualResponse.match(/(\d)\s*star/);
        if (starMatch) {
          const starRating = parseInt(starMatch[1]);
          rating_score = starRating;
          console.log(`🎯 Star rating detected: ${starRating} stars`);
          
          // Map star rating sang sentiment
          if (starRating <= 2) {
            sentiment = "Negative";
            primary_emotion = starRating === 1 ? "Anger" : "Disappointment";
            console.log(`📉 Mapped to Negative sentiment (rating: ${starRating})`);
          } else if (starRating >= 4) {
            sentiment = "Positive";
            primary_emotion = starRating === 5 ? "Joy" : "Satisfaction";
            console.log(`📈 Mapped to Positive sentiment (rating: ${starRating})`);
          } else {
            sentiment = "Neutral";
            primary_emotion = "Neutral";
            console.log(`➡️ Mapped to Neutral sentiment (rating: ${starRating})`);
          }
          
          justification = `Hugging Face AI (${currentModel}) detected ${starRating} star rating: "${actualResponse.substring(0, 100)}..."`;
        } else {
          // Fallback nếu không tìm thấy star rating
          sentiment = "Neutral";
          rating_score = 3;
          primary_emotion = "Neutral";
          justification = `Hugging Face AI (${currentModel}) unclear response: "${actualResponse.substring(0, 100)}..."`;
          console.log("⚠️ Không tìm thấy star rating trong response - sử dụng fallback");
        }
      } else {
        // Xử lý cho các model khác (cardiffnlp, distilbert multilingual)
        if (actualResponse.includes('negative') || actualResponse.includes('NEGATIVE') || actualResponse.includes('label_negative') || actualResponse.includes('terrible') || actualResponse.includes('hate') || actualResponse.includes('awful') || actualResponse.includes('bad')) {
          sentiment = "Negative";
          rating_score = 1;
          primary_emotion = actualResponse.includes('hate') || actualResponse.includes('angry') ? "Anger" : "Disappointment";
          justification = `Hugging Face AI (${currentModel}) detected negative sentiment: "${actualResponse.substring(0, 100)}..."`;
        } else if (actualResponse.includes('positive') || actualResponse.includes('POSITIVE') || actualResponse.includes('label_positive') || actualResponse.includes('good') || actualResponse.includes('great') || actualResponse.includes('excellent') || actualResponse.includes('amazing')) {
          sentiment = "Positive";
          rating_score = actualResponse.includes('excellent') || actualResponse.includes('amazing') ? 5 : 4;
          primary_emotion = actualResponse.includes('amazing') || actualResponse.includes('excellent') ? "Joy" : "Satisfaction";
          justification = `Hugging Face AI (${currentModel}) detected positive sentiment: "${actualResponse.substring(0, 100)}..."`;
        } else {
          sentiment = "Neutral";
          rating_score = 3;
          primary_emotion = "Neutral";
          justification = `Hugging Face AI (${currentModel}) detected neutral sentiment: "${actualResponse.substring(0, 100)}..."`;
        }
      }
      
      const result: SentimentAnalysis = {
        rating_score: rating_score,
        sentiment: sentiment,
        is_fake_review: false,
        aspects: {
          pin: actualResponse.includes('battery') || actualResponse.includes('pin') ? "Trung bình" : "Không có thông tin",
          man_hinh: actualResponse.includes('screen') || actualResponse.includes('màn hình') ? "Trung bình" : "Không có thông tin",
          hieu_nang: actualResponse.includes('performance') || actualResponse.includes('hiệu năng') ? "Trung bình" : "Không có thông tin"
        },
        justification: justification,
        competitor_mentioned: null,
        needs_support: actualResponse.includes('support') || actualResponse.includes('help') || actualResponse.includes('lỗi'),
        technical_issue: actualResponse.includes('error') || actualResponse.includes('lỗi') ? "Technical issue detected" : null,
        primary_emotion: primary_emotion,
        priority: (sentiment === "Negative" && (review.toLowerCase().includes('lừa đảo') || review.toLowerCase().includes('scam') || review.toLowerCase().includes('hỏng') || review.toLowerCase().includes('thất vọng') || actualResponse.includes('hate') || actualResponse.includes('angry'))) ? "HIGH" : (sentiment === "Negative" ? "MEDIUM" : "LOW"),
        suggested_features: [],
        helpfulness_score: 6
      };
      
      console.log(`✅ Phân tích thành công bằng Hugging Face API với model: ${currentModel}`);
      console.log("📈 Kết quả cuối cùng:");
      console.log(`   - Sentiment: ${result.sentiment}`);
      console.log(`   - Rating Score: ${result.rating_score}`);
      console.log(`   - Primary Emotion: ${result.primary_emotion}`);
      console.log(`   - Justification: ${result.justification}`);
      console.log(`   - Priority: ${result.priority}`);
      return result;
      
    } catch (error) {
      console.error(`❌ Lỗi khi kết nối với model ${currentModel}:`, error);
      
      // Nếu còn model khác để thử, tiếp tục
      if (attempt < models.length - 1) {
        console.log(`🔄 Thử model tiếp theo...`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Đợi 1 giây trước khi thử lại
      } else {
        console.log("❌ Tất cả models đều thất bại. Chuyển sang Enhanced Demo Mode...");
        
        // Chuyển sang demo mode làm phương án cuối cùng
        const lowerReview = review.toLowerCase();
        let sentiment: "Positive" | "Negative" | "Neutral" = "Neutral";
        let rating_score = 3;
        let primary_emotion: "Anger" | "Disappointment" | "Joy" | "Satisfaction" | "Neutral" = "Neutral";
        let priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" = "LOW";
        
        const positiveKeywords = ['tốt', 'hay', 'nhanh', 'sắc nét', 'hài lòng', 'tuyệt vời', 'good', 'great', 'amazing', 'excellent', 'perfect'];
        const negativeKeywords = ['kém', 'chậm', 'hỏng', 'tệ', 'thất vọng', 'dở', 'bad', 'slow', 'broken', 'terrible', 'disappoint'];
        
        const positiveCount = positiveKeywords.filter(keyword => lowerReview.includes(keyword)).length;
        const negativeCount = negativeKeywords.filter(keyword => lowerReview.includes(keyword)).length;
        
        if (positiveCount > negativeCount) {
          sentiment = "Positive";
          rating_score = 4;
          primary_emotion = "Satisfaction";
        } else if (negativeCount > positiveCount) {
          sentiment = "Negative";
          rating_score = 2;
          primary_emotion = "Disappointment";
          priority = "MEDIUM";
        }
        
        const fallbackResult: SentimentAnalysis = {
          rating_score: rating_score,
          sentiment: sentiment,
          is_fake_review: false,
          aspects: {
            pin: "Không có thông tin",
            man_hinh: "Không có thông tin",
            hieu_nang: "Không có thông tin"
          },
          justification: `API ERROR: All Hugging Face models failed. Please check your API key and network connection. Current result: ${sentiment}`,
          competitor_mentioned: null,
          needs_support: false,
          technical_issue: null,
          primary_emotion: primary_emotion,
          priority: priority,
          suggested_features: [],
          helpfulness_score: 5
        };
        
        return fallbackResult;
      }
    }
  }
  
  // This should never be reached due to the return statements in the loop
  throw new Error("All API attempts failed");
}

/**
 * Phân tích nhiều reviews cùng lúc
 * @param reviews - Mảng các review cần phân tích
 * @returns Promise<SentimentAnalysis[]> - Mảng kết quả phân tích
 */
export async function analyzeMultipleSentiments(reviews: string[]): Promise<SentimentAnalysis[]> {
  const results = await Promise.all(
    reviews.map(review => analyzeSentiment(review))
  );
  return results;
}