# NLP Service - Sentiment Analyzer

Service phân tích sentiment của đánh giá khách hàng sử dụng LangChain và Gemini 1.5 Flash.

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Tạo file `.env` và thêm Google API Key:
```bash
cp .env.example .env
```
Sau đó chỉnh sửa file `.env` và thêm API key của bạn:
```
GOOGLE_API_KEY=your_actual_api_key_here
```

## Cấu trúc Project

- `sentiment-analyzer.ts`: Main service phân tích sentiment
- `sample-reviews.ts`: Bộ dữ liệu mẫu 5 đánh giá về Laptop Acer
- `test.ts`: File test để chạy thử nghiệm

## Chạy Test

```bash
npm test
```

## Output Format

Service trả về JSON với cấu trúc sau:
```typescript
{
  rating_score: number,      // 1-5 sao
  sentiment: "Positive" | "Negative" | "Neutral",
  is_fake_review: boolean    // true nếu review bị nghi ngờ là giả
}
```

## Bộ dữ liệu mẫu

Bao gồm 5 đánh giá về Laptop Acer:
1. **Review tích cực** - Acer Aspire 5 (5 sao, Positive, không giả)
2. **Review tiêu cực** - Acer Nitro 5 (1 sao, Negative, không giả)
3. **Review trung lập** - Acer Swift 3 (3 sao, Neutral, không giả)
4. **Review nghi ngờ giả** - Acer Predator Helios (5 sao, Positive, có thể giả)
5. **Review tích cực chi tiết** - Acer Aspire 7 (4 sao, Positive, không giả)

## Sử dụng trong code

```typescript
import { analyzeSentiment, analyzeMultipleSentiments } from "./sentiment-analyzer";

// Phân tích 1 review
const result = await analyzeSentiment("Review text here");

// Phân tích nhiều reviews
const results = await analyzeMultipleSentiments(["Review 1", "Review 2"]);
```
