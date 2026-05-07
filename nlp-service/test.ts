import "dotenv/config";
import { analyzeSentiment, analyzeMultipleSentiments } from "./sentiment-analyzer";

// Interface cho test data
type SampleReview = {
  id: number;
  product: string;
  review: string;
};

// Bộ dữ liệu mẫu đánh giá về Laptop Acer
const sampleReviews: SampleReview[] = [
  {
    id: 1,
    product: "Laptop Acer Aspire 5",
    review: "Máy này tuyệt vời! Mình đã dùng được 3 tháng và rất hài lòng. Màn hình sắc nét, bàn phím êm, pin trâu được 7-8 tiếng dùng văn phòng. Giá cả hợp lý so với cấu hình. Rất recommend cho sinh viên và dân văn phòng."
  },
  {
    id: 2,
    product: "Laptop Acer Nitro 5",
    review: "Đừng mua máy này! Hư hỏng liên tục, mới dùng 2 tuần đã bị lỗi màn hình. Dịch vụ chăm sóc khách hàng cũng tệ, gọi mãi không ai nghe. Pin yếu chỉ được 2 tiếng, máy nóng kinh khủng khi chơi game. Thất vọng vô cùng!"
  },
  {
    id: 3,
    product: "Laptop Acer Swift 3",
    review: "Máy ổn trong tầm giá. Thiết kế mỏng nhẹ dễ mang đi, cấu hình đủ dùng word, excel, lướt web. Tuy nhiên bàn phím hơi cứng và loa không được to lắm. Tạm ổn cho nhu cầu cơ bản."
  },
  {
    id: 4,
    product: "Laptop Acer Predator Helios",
    review: "Tốt tốt tốt tốt tốt! Mua ngay đi! Sản phẩm tốt nhất! Rất tốt! Tốt quá! Tốt! Tốt! Tốt!"
  },
  {
    id: 5,
    product: "Laptop Acer Aspire 7",
    review: "Laptop Acer Aspire 7 là một lựa chọn tốt cho người dùng cần hiệu năng cao với giá phải chăng. CPU Intel Core i5 thế hệ 12 kết hợp với NVIDIA GTX 1650 cho phép chạy mượt các ứng dụng đồ họa nhẹ và game phổ thông. SSD 512GB đủ lưu trữ tài liệu và phần mềm."
  },
  {
    id: 6,
    product: "Laptop Acer Nitro 5",
    review: "Máy này gắt luôn! 🤣 Chạy game mượt, pin trâu, màn hình xịn sò. 10 điểm không có nhưng! 💯"
  },
  {
    id: 7,
    product: "Laptop Acer Swift Go",
    review: "Tuyệt vời nhưng máy tạch sau 1 tuần dùng. 😭 Hài lòng thật sự!"
  },
  {
    id: 8,
    product: "Laptop Acer Aspire 3",
    review: "Mua ngay hôm nay! Giảm giá 30%! Free ship toàn quốc! Hàng chính hãng cam kết 100%! 🔥🔥🔥"
  },
  {
    id: 9,
    product: "Laptop Acer Aspire 5",
    review: "Dùng Acer ổn nhưng so với Dell thì vẫn kém hơn. Dell màn hình đẹp hơn, pin trâu hơn. Acer giá rẻ nhưng chất lượng không bằng."
  },
  {
    id: 10,
    product: "Laptop Acer Nitro 5",
    review: "Máy này TỨC GIẬN quá! Mới mua 3 ngày đã bị màn hình xanh (blue screen) liên tục. Phím hỏng 2 phím, không thể gõ được. Gọi hỗ trợ thì không ai nghe! ĐỪNG MUA! SCAM!"
  },
  {
    id: 11,
    product: "Laptop Acer Swift X",
    review: "Đã dùng Acer Swift X được 6 tháng và muốn chia sẻ trải nghiệm chi tiết. Về ưu điểm: Màn hình 14 inch IPS Full HD rất nét, màu sắc hiển thị tốt, góc nhìn rộng. Hiệu năng với CPU Ryzen 7 5800U và RTX 3050 rất mượt, chạy được Photoshop, Premiere Pro và một số game nhẹ như Valorant, League of Legends ở setting medium. Thiết kế mỏng nhẹ chỉ 1.4kg, dễ dàng mang đi làm hàng ngày. Bàn phím êm, hành trình phím vừa phải, gõ thoải mái. Pin trâu, dùng văn phòng được 8-9 tiếng, sạc nhanh về 80% chỉ trong 1 giờ. Về nhược điểm: Loa hơi nhỏ, không đủ to để xem phim trong phòng lớn. Cổng USB-C không hỗ trợ sạc (chỉ truyền dữ liệu), hơi bất tiện khi đi du lịch. Nóng nhẹ khi render video nhưng vẫn trong mức chấp nhận được. Ướ gì Acer trang bị thêm đèn nền cho bàn phím để dùng tối tốt hơn. Giá mà pin trâu hơn chút nữa thì tuyệt vời. Nên có thêm cổng Thunderbolt 4 để kết nối màn hình ngoài tốt hơn. Mong muốn phiên bản sau có tùy chọn màn hình OLED hoặc 2.8K. Nếu có cải thiện loa to hơn và thêm webcam 1080p thì sẽ hoàn hảo. Tốt hơn nếu Acer bao gồm cả túi chống sốc trong hộp. Nhìn chung, đây là chiếc laptop rất đáng mua cho dân sáng tạo nội dung với mức giá hợp lý."
  }
];

async function runTests() {
  console.log("=== Bắt đầu test Sentiment Analyzer ===\n");
  console.log(`📊 Tổng số reviews cần phân tích: ${sampleReviews.length}\n`);

  const testStartTime = Date.now();

  try {
    // Phân tích tất cả reviews cùng lúc
    const results = await analyzeMultipleSentiments(
      sampleReviews.map(r => r.review)
    );

    const testDuration = Date.now() - testStartTime;
    console.log(`\n⏱️  Tổng thời gian chạy test: ${testDuration}ms`);
    console.log(`⏱️  Thời gian trung bình mỗi review: ${(testDuration / sampleReviews.length).toFixed(2)}ms\n`);

    // Tạo bảng kết quả
    const tableData = results.map((result, index) => ({
      ID: sampleReviews[index].id,
      Product: sampleReviews[index].product,
      Rating: result.rating_score,
      Sentiment: result.sentiment,
      Priority: result.priority,
      Helpfulness: result.helpfulness_score,
      Features: result.suggested_features && result.suggested_features.length > 0 ? `${result.suggested_features.length} suggestions` : "-",
      NeedSupport: result.needs_support ? "Yes" : "No",
      Emotion: result.primary_emotion
    }));

    console.log("\n--- Kết quả phân tích sentiment ---\n");
    console.table(tableData);

    // In chi tiết từng review
    console.log("\n--- Chi tiết từng review ---\n");
    results.forEach((result, index) => {
      console.log(`\nReview #${sampleReviews[index].id} - ${sampleReviews[index].product}`);
      console.log(`Nội dung: "${sampleReviews[index].review}"`);
      console.log(`Rating Score: ${result.rating_score}`);
      console.log(`Sentiment: ${result.sentiment}`);
      console.log(`Is Fake Review: ${result.is_fake_review}`);
      console.log(`Priority: ${result.priority}`);
      console.log(`Helpfulness Score: ${result.helpfulness_score}/10`);
      if (result.suggested_features && result.suggested_features.length > 0) {
        console.log(`Suggested Features:`);
        result.suggested_features.forEach((feature, i) => {
          console.log(`  ${i + 1}. ${feature}`);
        });
      } else {
        console.log(`Suggested Features: None`);
      }
      console.log(`Aspects:`);
      console.log(`  - Pin: ${result.aspects.pin}`);
      console.log(`  - Màn hình: ${result.aspects.man_hinh}`);
      console.log(`  - Hiệu năng: ${result.aspects.hieu_nang}`);
      console.log(`Competitor Mentioned: ${result.competitor_mentioned || "None"}`);
      console.log(`Needs Support: ${result.needs_support ? "Yes" : "No"}`);
      console.log(`Technical Issue: ${result.technical_issue || "None"}`);
      console.log(`Primary Emotion: ${result.primary_emotion}`);
      console.log(`Justification: ${result.justification}`);
    });

    // === Thống kê tổng kết ===
    const stats = {
      total: results.length,
      positive: results.filter(r => r.sentiment === "Positive").length,
      negative: results.filter(r => r.sentiment === "Negative").length,
      neutral: results.filter(r => r.sentiment === "Neutral").length,
      fake: results.filter(r => r.is_fake_review).length,
      needsSupport: results.filter(r => r.needs_support).length,
      critical: results.filter(r => r.priority === "CRITICAL").length,
      high: results.filter(r => r.priority === "HIGH").length,
      medium: results.filter(r => r.priority === "MEDIUM").length,
      low: results.filter(r => r.priority === "LOW").length,
      avgRating: (results.reduce((sum, r) => sum + r.rating_score, 0) / results.length).toFixed(2),
      avgHelpfulness: (results.reduce((sum, r) => sum + r.helpfulness_score, 0) / results.length).toFixed(2)
    };

    console.log("\n=== Thống kê tổng kết ===");
    console.log(`Tổng reviews: ${stats.total}`);
    console.log(`✅ Positive: ${stats.positive} (${((stats.positive / stats.total) * 100).toFixed(1)}%)`);
    console.log(`❌ Negative: ${stats.negative} (${((stats.negative / stats.total) * 100).toFixed(1)}%)`);
    console.log(`⚪ Neutral: ${stats.neutral} (${((stats.neutral / stats.total) * 100).toFixed(1)}%)`);
    console.log(`🚫 Fake reviews: ${stats.fake} (${((stats.fake / stats.total) * 100).toFixed(1)}%)`);
    console.log(`🔧 Cần hỗ trợ kỹ thuật: ${stats.needsSupport}`);
    console.log(`\n📊 Phân bố Priority:`);
    console.log(`   🔴 CRITICAL: ${stats.critical}`);
    console.log(`   🟠 HIGH: ${stats.high}`);
    console.log(`   🟡 MEDIUM: ${stats.medium}`);
    console.log(`   🟢 LOW: ${stats.low}`);
    console.log(`\n⭐ Rating trung bình: ${stats.avgRating}/5`);
    console.log(`📝 Helpfulness trung bình: ${stats.avgHelpfulness}/10`);

    console.log("\n=== Test hoàn thành thành công ===");
  } catch (error) {
    console.error("❌ Lỗi khi chạy test:", error);
    process.exit(1);
  }
}

// Chạy test
runTests();
