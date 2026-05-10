# Hướng Dẫn Dòng Chảy Thông Tin Toàn Bộ Hệ Thống

## Tổng Quan Kiến Trúc

Hệ thống ShopCart bao gồm 3 phần chính:

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  Frontend   │         │   Backend   │         │ NLP Service│
│  (React)    │◄────────►│  (Spring)   │◄────────►│  (Node.js)  │
│  Port: 5173 │         │  Port: 8081 │         │  Port: 3001 │
└─────────────┘         └─────────────┘         └─────────────┘
      │                       │                       │
      │                       │                       │
      ▼                       ▼                       ▼
  Browser               PostgreSQL           Hugging Face API
  (localStorage)         (Database)           (AI Model)
```

---

## Scenario 1: Người Dùng Xem Chi Tiết Sản Phẩm

### Data Flow Diagram

```
User Action (Click Product)
    ↓
Frontend Route: product.$id.tsx
    ↓
useEffect hook triggers
    ↓
apiFetch<Product>('/api/products/{id}')
    ↓
[HTTP GET] → Backend (Port 8081)
    ↓
ProductController.getProductById()
    ↓
ProductService.getProductById()
    ↓
ProductRepository (JPA/Hibernate)
    ↓
PostgreSQL Database (products table)
    ↓
Product Entity mapped to JSON
    ↓
[HTTP Response 200] → Frontend
    ↓
setProduct(state) updates React state
    ↓
UI renders product details
```

### Chi Tách Từng Bước

#### Bước 1: User Click vào Product

**File:** `frontend/src/routes/product.$id.tsx` (Dòng 46)

```typescript
const { id } = Route.useParams();
```

- **Giải thích:** Khi user click vào sản phẩm, React Router chuyển hướng đến route `/product/{id}`
- **Thông tin:** `id` được lấy từ URL parameter
- **Lưu trữ:** Không có (chỉ là navigation)

#### Bước 2: useEffect Hook Trigger

**File:** `frontend/src/routes/product.$id.tsx` (Dòng 58-74)

```typescript
useEffect(() => {
  setProduct(null);
  setReviews(null);
  setError(null);
  setQty(1);
  apiFetch<Product>(`/api/products/${id}`).then(setProduct).catch((e) => setError(e.message));
  apiFetch<Review[]>(`/api/products/${id}/reviews`)
    .then((r) => setReviews(Array.isArray(r) ? r : []))
    .catch(() => setReviews([]));
  // ...
}, [id, token]);
```

- **Giải thích:** Khi component mount hoặc `id` thay đổi, useEffect chạy
- **Function:** `apiFetch()` - gọi API
- **Thông tin:** Gửi 2 request song song:
  1. GET `/api/products/{id}` - lấy thông tin sản phẩm
  2. GET `/api/products/{id}/reviews` - lấy danh sách review
- **Lưu trữ:** State React (`product`, `reviews`)

#### Bước 3: apiFetch Function

**File:** `frontend/src/lib/api-service.ts` (Dòng 25-97)

```typescript
export async function apiFetch<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const method = init?.method ?? "GET";
  let backendPath = path;

  // Route translations for Spring Boot backend
  if (path.match(/^\/api\/products\/[^/]+$/) && method === "GET") {
    backendPath = path; // Keep as-is: /api/products/{id}
  }

  const url = `${BASE_URL}${backendPath}`; // BASE_URL = "http://localhost:8081"

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token = getToken(); // Lấy token từ localStorage
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (init?.body) {
    options.body = JSON.stringify(init.body);
  }

  const response = await fetch(url, options);
  // ... error handling
  return await response.json();
}
```

- **Giải thích:** Hàm wrapper cho fetch API
- **Function:** 
  - `getToken()` (Dòng 13-23): Lấy JWT token từ localStorage
  - Xây dựng URL đầy đủ: `http://localhost:8081/api/products/{id}`
  - Thêm Authorization header nếu có token
  - Gửi HTTP request
- **Thông tin:**
  - Input: `path = "/api/products/1"`
  - Output: JSON response từ backend
- **Lưu trữ:** Token trong `localStorage.getItem("shopcart_auth")`

#### Bước 4: Backend Controller Nhận Request

**File:** `backend/src/main/java/com/shopcart/backend/controller/ProductController.java` (Dòng 36-41)

```java
@GetMapping("/{id}")
public ResponseEntity<Product> getProductById(@PathVariable Long id) {
  return productService.getProductById(id)
          .map(ResponseEntity::ok)
          .orElse(ResponseEntity.notFound().build());
}
```

- **Giải thích:** Spring Boot Controller nhận HTTP GET request
- **Function:** `productService.getProductById(id)`
- **Thông tin:**
  - Input: `id` từ URL path
  - Output: ResponseEntity<Product> hoặc 404 Not Found
- **Lưu trữ:** Không có (chỉ routing)

#### Bước 5: Service Layer Xử Lý Logic

**File:** `backend/src/main/java/com/shopcart/backend/service/ProductService.java` (cần đọc thêm)

```java
// Giả định cấu trúc (dựa trên pattern Spring Boot)
@Service
public class ProductService {
  @Autowired
  private ProductRepository productRepository;

  public Optional<Product> getProductById(Long id) {
    return productRepository.findById(id);
  }
}
```

- **Giải thích:** Service layer chứa business logic
- **Function:** `productRepository.findById(id)`
- **Thông tin:**
  - Input: `id` (Long)
  - Output: Optional<Product>
- **Lưu trữ:** Không có (gọi repository)

#### Bước 6: Repository Layer Truy Cập Database

**File:** `backend/src/main/java/com/shopcart/backend/repository/ProductRepository.java` (giả định)

```java
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
  // JPA tự động implement CRUD methods
}
```

- **Giải thích:** JPA Repository interface
- **Function:** `findById()` - tự động implement bởi Spring Data JPA
- **Thông tin:**
  - Input: `id` (Long)
  - Output: SQL query được tự động tạo: `SELECT * FROM products WHERE id = ?`
- **Lưu trữ:** Không có (gọi database)

#### Bước 7: PostgreSQL Database

**File:** `backend/src/main/resources/data.sql` (dữ liệu mẫu)

```sql
INSERT INTO products (id, name, description, price, image_url, stock_quantity, category) VALUES
(1, 'MacBook Pro 14"', 'Powerful laptop with M3 chip', 1999.00, 'https://example.com/macbook.jpg', 10, 'Electronics');
```

- **Giải thích:** Database lưu trữ dữ liệu sản phẩm
- **Table:** `products`
- **Columns:** 
  - `id` (Primary Key)
  - `name` (Tên sản phẩm)
  - `description` (Mô tả)
  - `price` (Giá)
  - `image_url` (URL ảnh)
  - `stock_quantity` (Số lượng tồn kho)
  - `category` (Danh mục)
- **Lưu trữ:** PostgreSQL database (persistent storage)

#### Bước 8: Entity Mapping

**File:** `backend/src/main/java/com/shopcart/backend/model/Product.java` (Dòng 1-34)

```java
@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private Double price;

    private String imageUrl;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity;

    private String category;
}
```

- **Giải thích:** JPA Entity mapping database table sang Java object
- **Annotations:**
  - `@Entity`: Đánh dấu là JPA entity
  - `@Table(name = "products")`: Map đến table `products`
  - `@Id`: Primary key
  - `@GeneratedValue`: Auto-increment
  - `@Column`: Map column
- **Thông tin:** Database row → Java object
- **Lưu trữ:** Java object trong memory (tạm thời)

#### Bước 9: Response Trả Về Frontend

**File:** `backend/src/main/java/com/shopcart/backend/controller/ProductController.java` (Dòng 38-40)

```java
.map(ResponseEntity::ok)
```

- **Giải thích:** Chuyển Product entity sang HTTP Response
- **Function:** Jackson JSON serialization (tự động)
- **Thông tin:**
  - Java object → JSON string
  - Ví dụ: `{"id":1,"name":"MacBook Pro 14\"","description":"Powerful laptop...","price":1999.00,...}`
- **Lưu trữ:** Không có (HTTP response)

#### Bước 10: Frontend Nhận Response

**File:** `frontend/src/routes/product.$id.tsx` (Dòng 63)

```typescript
apiFetch<Product>(`/api/products/${id}`).then(setProduct).catch((e) => setError(e.message));
```

- **Giải thích:** Promise resolve với JSON response
- **Function:** `setProduct()` - React setState
- **Thông tin:**
  - JSON → TypeScript object
  - Lưu vào React state
- **Lưu trữ:** React state (memory)

#### Bước 11: UI Render

**File:** `frontend/src/routes/product.$id.tsx` (Dòng 127-221)

```typescript
{!product ? (
  <Skeleton />
) : (
  <div className="grid gap-10 md:grid-cols-2">
    <img src={product.imageUrl} alt={product.name} />
    <div>
      <h1>{product.name}</h1>
      <span>{formatPrice(product.price)}</span>
      <p>{product.description}</p>
      {/* ... */}
    </div>
  </div>
)}
```

- **Giải thích:** React render UI dựa trên state
- **Function:** React render cycle
- **Thông tin:** State → DOM elements
- **Lưu trữ:** DOM (browser memory)

---

## Scenario 2: Người Dùng Viết Review (Với AI Analysis)

### Data Flow Diagram

```
User Action (Submit Review)
    ↓
Frontend: WriteReviewModal component
    ↓
apiFetch('/api/reviews', { method: 'POST', body: {...} })
    ↓
[HTTP POST] → Backend (Port 8081)
    ↓
ReviewController.createReview()
    ↓
ReviewService.submitReview()
    ↓
NlpService.analyzeSentimentWithUserRating()
    ↓
[HTTP POST] → NLP Service (Port 3001)
    ↓
sentiment-analyzer.analyzeSentiment()
    ↓
Hugging Face API (AI Model)
    ↓
NLP Response → Backend
    ↓
Review Entity populated with AI data
    ↓
ReviewRepository.save()
    ↓
PostgreSQL Database (reviews table)
    ↓
[HTTP Response 201] → Frontend
    ↓
UI updates with new review
```

### Chi Tách Từng Bước

#### Bước 1: User Submit Review

**File:** `frontend/src/components/write-review-modal.tsx` (giả định)

```typescript
const handleSubmit = async () => {
  await apiFetch('/api/reviews', {
    method: 'POST',
    body: {
      productId: product.id,
      content: reviewText,
      rating: selectedRating,
      userId: user.id
    }
  });
  // Refresh reviews list
  onSubmitted();
};
```

- **Giải thích:** User điền form review và click submit
- **Function:** `apiFetch()` với method POST
- **Thông tin:**
  - Input: `{ productId, content, rating, userId }`
  - Output: Promise<Review>
- **Lưu trữ:** Không có (gửi request)

#### Bước 2: Frontend API Call

**File:** `frontend/src/lib/api-service.ts` (Dòng 40-41)

```typescript
} else if (path === "/api/reviews" && method === "POST") {
  backendPath = "/api/reviews";
}
```

- **Giải thích:** Route translation giữ nguyên
- **Function:** `apiFetch()` gửi POST request
- **Thông tin:**
  - URL: `http://localhost:8081/api/reviews`
  - Headers: `Content-Type: application/json`, `Authorization: Bearer {token}`
  - Body: JSON string của review data
- **Lưu trữ:** Token từ localStorage

#### Bước 3: Backend Controller Nhận Request

**File:** `backend/src/main/java/com/shopcart/backend/controller/ReviewController.java` (Dòng 22-30)

```java
@PostMapping
public ResponseEntity<Review> createReview(@RequestBody ReviewRequest request) {
    // Lấy userId từ request, fallback về 1L nếu không có
    Long currentUserId = request.getUserId() != null ? request.getUserId() : 1L;

    // GlobalExceptionHandler sẽ tự bắt các lỗi: "Chưa mua hàng", "AI phát hiện spam"
    Review savedReview = reviewService.submitReview(currentUserId, request);
    return new ResponseEntity<>(savedReview, HttpStatus.CREATED);
}
```

- **Giải thích:** Controller nhận POST request với JSON body
- **Function:** `reviewService.submitReview()`
- **Thông tin:**
  - Input: `ReviewRequest` DTO (productId, content, rating, userId)
  - Output: `Review` entity
- **Lưu trữ:** Không có (gọi service)

#### Bước 4: ReviewService Xử Lý Logic

**File:** `backend/src/main/java/com/shopcart/backend/service/ReviewService.java` (Dòng 30-78)

```java
@Transactional
public Review submitReview(Long userId, ReviewRequest request) {
    // 1. Kiểm tra Verified Purchase
    // Chỉ cho phép bình luận nếu đơn hàng đã thanh toán, đang giao hoặc đã nhận
    // TODO: Bypass tạm thời cho testing - cần enable lại cho production
    // checkVerifiedPurchase(userId, request.getProductId());

    // 2. Tạo review trước với dữ liệu cơ bản
    Review review = new Review();
    review.setUserId(userId);
    review.setProductId(request.getProductId());
    review.setContent(request.getContent());
    review.setRating(request.getRating());

    // 3. Gọi AI để phân tích nội dung với accuracy logic cho tiếng Việt
    try {
        NlpResponse aiResult = nlpService.analyzeSentimentWithUserRating(request.getContent(), request.getRating()).block();
        
        if (aiResult != null) {
            log.info("AI analysis successful for review: {}", aiResult.getSentiment());
            
            // Map kết quả AI vào Entity Review (cả cũ và mới)
            review.setSentiment(aiResult.getSentiment());
            review.setIsFake(aiResult.getIsFakeReview());
            review.setPriority(aiResult.getPriority());
            review.setHelpfulnessScore(aiResult.getHelpfulnessScore());
            
            // Đổ dữ liệu vào các trường AI mới (Option C)
            review.setAiSentiment(aiResult.getSentiment());
            review.setAiRating(aiResult.getRatingScore());
            review.setAiPriority(aiResult.getPriority());
            review.setAiPrimaryEmotion(aiResult.getPrimaryEmotion());
            
            // Lưu lại các tính năng gợi ý trích xuất bởi AI (nếu có)
            if (aiResult.getJustification() != null && !aiResult.getJustification().isEmpty()) {
                log.debug("AI justification: {}", aiResult.getJustification());
            }
        } else {
            log.warn("AI analysis returned null result, using fallback values");
            setDefaultAiValues(review);
        }
    } catch (Exception e) {
        log.error("AI analysis failed, using fallback values. Error: {}", e.getMessage());
        setDefaultAiValues(review);
    }

    // 4. Lưu review vào database
    return reviewRepository.save(review);
}
```

- **Giải thích:** Service layer xử lý business logic và gọi AI
- **Function:** 
  - `checkVerifiedPurchase()` (Dòng 98-105): Kiểm tra user đã mua sản phẩm chưa
  - `nlpService.analyzeSentimentWithUserRating()` (Dòng 46): Gọi AI phân tích
  - `setDefaultAiValues()` (Dòng 83-96): Set giá trị mặc định nếu AI fail
  - `reviewRepository.save()` (Dòng 77): Lưu vào database
- **Thông tin:**
  - Input: `userId`, `ReviewRequest`
  - Output: `Review` entity với AI data
- **Lưu trữ:** Java object trong memory

#### Bước 5: NlpService Gọi NLP Microservice

**File:** `backend/src/main/java/com/shopcart/backend/service/NlpService.java` (Dòng 57-77)

```java
public Mono<NlpResponse> analyzeSentimentWithUserRating(String reviewText, Integer userRating) {
    log.info("Bắt đầu phân tích sentiment cho review: \"{}\"", reviewText.substring(0, Math.min(100, reviewText.length())) + "...");
    
    Map<String, String> requestBody = Map.of("reviewText", reviewText);
    
    return webClient.post()
            .bodyValue(requestBody)
            .retrieve()
            .bodyToMono(String.class)
            .timeout(TIMEOUT)
            .retryWhen(Retry.backoff(2, Duration.ofSeconds(1))
                    .maxBackoff(Duration.ofSeconds(3))
                    .doBeforeRetry(retrySignal -> 
                        log.warn("Retry attempt {} for NLP service", retrySignal.totalRetries() + 1)))
            .map(responseBody -> this.parseNlpResponseWithAccuracyCheck(responseBody, userRating))
            .doOnSuccess(response -> log.info("Phân tích sentiment thành công: {}", response))
            .onErrorResume(throwable -> {
                log.error("Lỗi khi phân tích sentiment, sử dụng fallback values. Lỗi: {}", throwable.getMessage());
                return Mono.just(createDefaultNlpResponse());
            });
}
```

- **Giải thích:** Spring WebFlux WebClient gọi NLP service async
- **Function:** 
  - `webClient.post()`: Gửi HTTP POST
  - `timeout()`: Timeout sau 15 giây
  - `retryWhen()`: Retry 2 lần nếu fail
  - `parseNlpResponseWithAccuracyCheck()`: Parse response với accuracy correction
  - `createDefaultNlpResponse()`: Fallback nếu AI fail
- **Thông tin:**
  - Input: `reviewText`, `userRating`
  - URL: `http://localhost:3001/analyze`
  - Body: `{"reviewText": "..."}`
  - Output: `Mono<NlpResponse>` (reactive stream)
- **Lưu trữ:** Không có (HTTP call)

#### Bước 6: NLP Service Nhận Request

**File:** `nlp-service/index.ts` (Dòng 12-26)

```typescript
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
```

- **Giải thích:** Express server nhận POST request
- **Function:** `analyzeSentiment()`
- **Thông tin:**
  - Input: `{ reviewText: "..." }`
  - Output: JSON response với sentiment analysis
- **Lưu trữ:** Không có (gọi analyzer)

#### Bước 7: Sentiment Analyzer Phân Tích

**File:** `nlp-service/sentiment-analyzer.ts` (Dòng 53-412)

```typescript
export async function analyzeSentiment(review: string): Promise<SentimentAnalysis> {
  // Danh sách model đa ngôn ngữ ưu tiên để thử kết nối
  const models = [
    "nlptown/bert-base-multilingual-uncased-sentiment",    // Model đa ngôn ngữ mạnh mẽ
    "cardiffnlp/twitter-xlm-roberta-base-sentiment",       // Model đa ngôn ngữ hiện đại
    "distilbert-base-multilingual-cased"                   // Model đa ngôn ngữ nhẹ
  ];

  if (!hasValidApiKey) {
    // Enhanced demo mode logic - phân tích chi tiết dựa trên keywords
    // ... (keyword-based analysis)
    return demoResult;
  }

  // Thử từng model cho đến khi thành công
  for (const currentModel of models) {
    try {
      const response = await hf.textClassification({
        model: currentModel,
        inputs: review
      });
      
      // Phân tích response từ Hugging Face
      // ... (parse sentiment, rating, emotion)
      return result;
    } catch (error) {
      // Retry next model
    }
  }
}
```

- **Giải thích:** Phân tích sentiment sử dụng Hugging Face API hoặc demo mode
- **Function:** 
  - `hf.textClassification()`: Gọi Hugging Face API
  - Keyword analysis nếu không có API key
- **Thông tin:**
  - Input: `review` (string)
  - Output: `SentimentAnalysis` object:
    ```typescript
    {
      rating_score: 1-5,
      sentiment: "Positive" | "Negative" | "Neutral",
      is_fake_review: boolean,
      aspects: { pin, man_hinh, hieu_nang },
      justification: string,
      competitor_mentioned: string | null,
      needs_support: boolean,
      technical_issue: string | null,
      primary_emotion: "Anger" | "Disappointment" | "Joy" | "Satisfaction" | "Neutral",
      priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      suggested_features: string[],
      helpfulness_score: 1-10
    }
    ```
- **Lưu trữ:** Không có (chỉ processing)

#### Bước 8: Hugging Face API (Optional)

- **Giải thích:** Nếu có API key, gọi Hugging Face Inference API
- **Function:** External AI model inference
- **Thông tin:**
  - Input: Review text
  - Output: Sentiment classification
- **Lưu trữ:** Không có (external service)

#### Bước 9: NLP Response Trả Về Backend

**File:** `nlp-service/index.ts` (Dòng 21)

```typescript
res.json(result);
```

- **Giải thích:** Express gửi JSON response
- **Function:** Express res.json()
- **Thông tin:** `SentimentAnalysis` object → JSON string
- **Lưu trữ:** Không có (HTTP response)

#### Bước 10: Backend Parse Response với Accuracy Check

**File:** `backend/src/main/java/com/shopcart/backend/service/NlpService.java` (Dòng 89-125)

```java
private NlpResponse parseNlpResponseWithAccuracyCheck(String responseBody, Integer userRating) {
    try {
        JsonNode jsonNode = objectMapper.readTree(responseBody);
        
        NlpResponse response = new NlpResponse();
        String aiSentiment = jsonNode.path("sentiment").asText("Neutral");
        int aiRating = jsonNode.path("rating_score").asInt(3);
        
        // Apply Vietnamese accuracy logic
        if (userRating != null && shouldApplyAccuracyCorrection(userRating, aiSentiment, aiRating)) {
            log.warn("VIETNAMESE ACCURACY CORRECTION: User rating={} vs AI sentiment={}, rating={}. Applying correction.", userRating, aiSentiment, aiRating);
            
            // Keep user's rating but mark for manual review
            response.setRatingScore(userRating);
            response.setSentiment(determineSentimentFromRating(userRating));
            response.setPriority("MANUAL_REVIEW");
            response.setJustification(String.format("AI accuracy correction applied: User gave %d stars but AI detected %s (%d stars). Marked for manual review.", userRating, aiSentiment, aiRating));
        } else {
            // Use AI results as-is
            response.setSentiment(aiSentiment);
            response.setRatingScore(aiRating);
            response.setPriority(jsonNode.path("priority").asText("LOW"));
            response.setJustification(jsonNode.path("justification").asText(""));
        }
        
        response.setIsFakeReview(jsonNode.path("is_fake_review").asBoolean(false));
        response.setHelpfulnessScore(jsonNode.path("helpfulness_score").asInt(5));
        response.setPrimaryEmotion(jsonNode.path("primary_emotion").asText("Neutral"));
        
        return response;
    } catch (Exception e) {
        log.error("Lỗi khi parse response từ NLP service: {}", e.getMessage(), e);
        return createDefaultNlpResponse();
    }
}
```

- **Giải thích:** Parse JSON và apply accuracy correction cho tiếng Việt
- **Function:** 
  - `shouldApplyAccuracyCorrection()`: Kiểm tra có cần correction không
  - `determineSentimentFromRating()`: Xác định sentiment từ user rating
- **Thông tin:**
  - Input: JSON string, `userRating`
  - Logic correction:
    - User 4-5 stars nhưng AI nói Negative → Correction
    - User 1-2 stars nhưng AI nói Positive → Correction
    - Chênh lệch >= 3 stars → Correction
  - Output: `NlpResponse` object
- **Lưu trữ:** Java object trong memory

#### Bước 11: Review Entity Được Populate

**File:** `backend/src/main/java/com/shopcart/backend/service/ReviewService.java` (Dòng 52-66)

```java
// Map kết quả AI vào Entity Review
review.setSentiment(aiResult.getSentiment());
review.setIsFake(aiResult.getIsFakeReview());
review.setPriority(aiResult.getPriority());
review.setHelpfulnessScore(aiResult.getHelpfulnessScore());

// Đổ dữ liệu vào các trường AI mới
review.setAiSentiment(aiResult.getSentiment());
review.setAiRating(aiResult.getRatingScore());
review.setAiPriority(aiResult.getPriority());
review.setAiPrimaryEmotion(aiResult.getPrimaryEmotion());
```

- **Giải thích:** Map AI result vào Review entity
- **Function:** Setter methods
- **Thông tin:** AI data → Review entity fields
- **Lưu trữ:** Java object trong memory

#### Bước 12: Review Entity Structure

**File:** `backend/src/main/java/com/shopcart/backend/model/Review.java` (Dòng 1-51)

```java
@Entity
@Table(name = "reviews")
@Data
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long productId;

    @Column(length = 1000)
    private String content; // Nội dung review từ frontend

    private Integer rating;

    // Các trường dữ liệu từ AI NLP-Service
    private String sentiment; // Positive, Negative, Neutral
    private Boolean isFake;
    private String priority; // CRITICAL, HIGH, LOW...
    private Integer helpfulnessScore;

    // Các trường AI mới để phân biệt với dữ liệu người dùng
    @Column(name = "ai_sentiment")
    private String aiSentiment;
    
    @Column(name = "ai_rating")
    private Integer aiRating;
    
    @Column(name = "ai_priority")
    private String aiPriority;
    
    @Column(name = "ai_primary_emotion")
    private String aiPrimaryEmotion;

    // Tối ưu: Lưu trữ các tính năng được AI trích xuất
    @ElementCollection
    @CollectionTable(name = "review_suggested_features", joinColumns = @JoinColumn(name = "review_id"))
    @Column(name = "feature")
    private List<String> suggestedFeatures;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
```

- **Giải thích:** JPA Entity mapping reviews table
- **Annotations:**
  - `@Entity`: JPA entity
  - `@Table`: Table name
  - `@ElementCollection`: Collection mapping cho suggested features
- **Thông tin:** Review entity với cả user data và AI analysis
- **Lưu trữ:** Java object trong memory

#### Bước 13: Lưu Vào Database

**File:** `backend/src/main/java/com/shopcart/backend/service/ReviewService.java` (Dòng 77)

```java
return reviewRepository.save(review);
```

- **Giải thích:** JPA save entity vào database
- **Function:** `reviewRepository.save()`
- **Thông tin:**
  - Input: `Review` entity
  - SQL: `INSERT INTO reviews (...) VALUES (...)`
- **Lưu trữ:** PostgreSQL database (persistent)

**Database Schema:**
```sql
CREATE TABLE reviews (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT,
  product_id BIGINT,
  content VARCHAR(1000),
  rating INTEGER,
  sentiment VARCHAR(50),
  is_fake BOOLEAN,
  priority VARCHAR(50),
  helpfulness_score INTEGER,
  ai_sentiment VARCHAR(50),
  ai_rating INTEGER,
  ai_priority VARCHAR(50),
  ai_primary_emotion VARCHAR(50),
  created_at TIMESTAMP
);

CREATE TABLE review_suggested_features (
  review_id BIGINT REFERENCES reviews(id),
  feature VARCHAR(255)
);
```

#### Bước 14: Response Trả Về Frontend

**File:** `backend/src/main/java/com/shopcart/backend/controller/ReviewController.java` (Dòng 29)

```java
return new ResponseEntity<>(savedReview, HttpStatus.CREATED);
```

- **Giải thích:** Trả về saved review với status 201 Created
- **Function:** Jackson JSON serialization
- **Thông tin:** Review entity → JSON
- **Lưu trữ:** Không có (HTTP response)

#### Bước 15: Frontend Nhận Response và Update UI

**File:** `frontend/src/components/write-review-modal.tsx` (giả định)

```typescript
const handleSubmit = async () => {
  await apiFetch('/api/reviews', {
    method: 'POST',
    body: { productId, content, rating, userId }
  });
  onSubmitted(); // Callback to refresh reviews
};

// Trong product.$id.tsx
onSubmitted={() => {
  apiFetch<Review[]>(`/api/products/${id}/reviews`).then(setReviews).catch(() => {});
}}
```

- **Giải thích:** Refresh reviews list sau khi submit thành công
- **Function:** `apiFetch()` để get reviews mới
- **Thông tin:** Get updated reviews from database
- **Lưu trữ:** React state updated

---

## Scenario 3: User Add to Cart (State Management)

### Data Flow Diagram

```
User Action (Click "Add to Cart")
    ↓
Frontend: product.$id.tsx
    ↓
handleAdd() function
    ↓
useCartStore.addItem(product, quantity)
    ↓
Zustand Store Update
    ↓
persist middleware saves to localStorage
    ↓
localStorage.setItem("shopcart_cart", JSON.stringify(state))
    ↓
Header component re-renders (cart badge updates)
    ↓
UI shows updated cart count
```

### Chi Tách Từng Bước

#### Bước 1: User Click Add to Cart

**File:** `frontend/src/routes/product.$id.tsx` (Dòng 201-212)

```typescript
<Button
  size="lg"
  onClick={handleAdd}
  disabled={product.stockQuantity === 0 || inCart >= product.stockQuantity}
>
  <ShoppingCart className="mr-2 h-4 w-4" />
  {product.stockQuantity === 0
    ? "Sold out"
    : inCart >= product.stockQuantity
      ? "Max in cart"
      : "Add to cart"}
</Button>
```

- **Giải thích:** User click button Add to Cart
- **Function:** `handleAdd()` (debounced)
- **Thông tin:** Trigger add to cart action
- **Lưu trữ:** Không có

#### Bước 2: handleAdd Function

**File:** `frontend/src/routes/product.$id.tsx` (Dòng 78-91)

```typescript
const handleAdd = useDebouncedCallback(() => {
  if (!product) return;
  const remaining = product.stockQuantity - inCart;
  if (remaining <= 0) {
    toast.warning("Maximum stock reached", { duration: 2000 });
    return;
  }
  const toAdd = Math.min(qty, remaining);
  addItem(product, toAdd);
  toast.success(`Added ${toAdd} × ${product.name} to cart`);
  if (toAdd < qty) {
    toast.info(`Only ${toAdd} added — stock limit reached`);
  }
}, 500);
```

- **Giải thích:** Debounced function để prevent rapid clicks
- **Function:** 
  - Check stock limit
  - Call `addItem()` from cart store
  - Show toast notification
- **Thông tin:**
  - Input: `product`, `qty`, `inCart`
  - Output: Toast notification
- **Lưu trữ:** Không có (gọi store)

#### Bước 3: Cart Store Update

**File:** `frontend/src/stores/cart-store.ts` (Dòng 15-53)

```typescript
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id);
          const currentQty = existing?.quantity ?? 0;
          const nextQty = Math.min(currentQty + quantity, product.stockQuantity);
          if (nextQty === currentQty) return state; // already at max
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id ? { ...i, quantity: nextQty } : i,
              ),
            };
          }
          return { items: [...state.items, { product, quantity: nextQty }] };
        }),
      // ... other methods
    }),
    { name: "shopcart_cart" },
  ),
);
```

- **Giải thích:** Zustand store với persist middleware
- **Function:** 
  - `addItem()`: Thêm hoặc update item trong cart
  - `persist()`: Tự động lưu state vào localStorage
- **Thông tin:**
  - Input: `product`, `quantity`
  - Logic: 
    - Nếu product đã có trong cart → tăng quantity
    - Nếu chưa có → thêm mới
    - Respect stock limit
  - Output: Updated state
- **Lưu trữ:** 
  - Memory: Zustand store
  - Persistent: `localStorage.getItem("shopcart_cart")`

#### Bước 4: localStorage Persistence

**File:** `frontend/src/stores/cart-store.ts` (Dòng 50)

```typescript
{ name: "shopcart_cart" }
```

- **Giải thích:** Zustand persist middleware tự động sync state với localStorage
- **Function:** Tự động bởi zustand/middleware
- **Thông tin:**
  - Key: `shopcart_cart`
  - Value: JSON string của state
  - Ví dụ: `{"state":{"items":[{...}]},"version":0}`
- **Lưu trữ:** Browser localStorage (persistent across sessions)

#### Bước 5: Header Component Re-render

**File:** `frontend/src/components/Header.tsx` (giả định)

```typescript
const totalItems = useCartStore(state => state.totalItems());

return (
  <div>
    <ShoppingCart />
    <Badge>{totalItems}</Badge>
  </div>
);
```

- **Giải thích:** Header component subscribe to cart store
- **Function:** `useCartStore()` hook
- **Thông tin:** Khi store update, component re-render tự động
- **Lưu trữ:** Không có (React render)

---

## Scenario 4: User Login (Authentication)

### Data Flow Diagram

```
User Action (Submit Login Form)
    ↓
Frontend: login.tsx
    ↓
useAuthStore.login(email, password)
    ↓
apiFetch('/api/auth/login', { method: 'POST', body: {...} })
    ↓
[HTTP POST] → Backend (Port 8081)
    ↓
AuthController.login()
    ↓
AuthService.authenticate()
    ↓
UserRepository.findByEmail()
    ↓
PostgreSQL Database (users table)
    ↓
JWT Token Generation
    ↓
[HTTP Response 200] → Frontend
    ↓
setUser(user), setToken(token)
    ↓
persist middleware saves to localStorage
    ↓
localStorage.setItem("shopcart_auth", JSON.stringify(state))
    ↓
UI updates (show user avatar)
```

### Chi Tách Từng Bước

#### Bước 1: User Submit Login Form

**File:** `frontend/src/routes/login.tsx` (giả định)

```typescript
const handleSubmit = async () => {
  await login(email, password);
  navigate('/');
};
```

- **Giải thích:** User nhập email/password và submit
- **Function:** `login()` từ auth store
- **Thông tin:** Email, password
- **Lưu trữ:** Không có

#### Bước 2: Auth Store Login

**File:** `frontend/src/stores/auth-store.ts` (Dòng 53-61)

```typescript
login: async (email, _password) => {
  // Always start a fresh session — never inherit a previous user's cart.
  purgeSession();
  const { user, token } = await apiFetch<{ user: User; token: string }>(
    "/api/auth/login",
    { method: "POST", body: { email, password: _password } },
  );
  set({ user, token });
},
```

- **Giải thích:** Login function trong auth store
- **Function:** 
  - `purgeSession()`: Xóa session cũ
  - `apiFetch()`: Gọi backend API
  - `set()`: Update store state
- **Thông tin:**
  - Input: `email`, `password`
  - Output: `{ user, token }`
- **Lưu trữ:** Zustand store + localStorage

#### Bước 3: purgeSession Function

**File:** `frontend/src/stores/auth-store.ts` (Dòng 28-43)

```typescript
export function purgeSession() {
  // Reset in-memory stores first so subscribers re-render immediately.
  useCartStore.getState().clear();

  if (typeof window !== "undefined") {
    try {
      // Persist middleware keys
      localStorage.removeItem("shopcart_auth");
      localStorage.removeItem("shopcart_cart");
      // Any private session-scoped data
      sessionStorage.clear();
    } catch {
      // ignore storage failures (private mode, quota, etc.)
    }
  }
}
```

- **Giải thích:** Xóa toàn bộ session data cũ
- **Function:** 
  - Clear cart store
  - Remove localStorage entries
  - Clear sessionStorage
- **Thông tin:** Xóa dữ liệu cũ
- **Lưu trữ:** Xóa localStorage, sessionStorage

#### Bước 4: Backend Auth Controller

**File:** `backend/src/main/java/com/shopcart/backend/controller/AuthController.java` (giả định)

```java
@PostMapping("/login")
public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
    String token = authService.authenticate(request.getEmail(), request.getPassword());
    User user = authService.getUserByEmail(request.getEmail());
    return ResponseEntity.ok(new LoginResponse(user, token));
}
```

- **Giải thích:** Controller nhận login request
- **Function:** `authService.authenticate()`
- **Thông tin:** Email, password → JWT token
- **Lưu trữ:** Không có

#### Bước 5: JWT Token Generation

**File:** `backend/src/main/java/com/shopcart/backend/service/AuthService.java` (giả định)

```java
public String authenticate(String email, String password) {
    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("User not found"));
    
    if (!passwordEncoder.matches(password, user.getPassword())) {
        throw new RuntimeException("Invalid password");
    }
    
    return jwtUtil.generateToken(user);
}
```

- **Giải thích:** Verify credentials và generate JWT token
- **Function:** 
  - `userRepository.findByEmail()`: Find user
  - `passwordEncoder.matches()`: Verify password
  - `jwtUtil.generateToken()`: Generate JWT
- **Thông tin:** Email, password → JWT token
- **Lưu trữ:** Không có (token returned)

#### Bước 6: Frontend Save Token

**File:** `frontend/src/stores/auth-store.ts` (Dòng 60)

```typescript
set({ user, token });
```

- **Giải thích:** Update auth store state
- **Function:** Zustand `set()`
- **Thông tin:** User object, JWT token
- **Lưu trữ:** 
  - Memory: Zustand store
  - Persistent: `localStorage.getItem("shopcart_auth")`

---

## Tóm Tắt Các File Quan Trọng

### Frontend

| File | Chức Năng | Lưu Trữ |
|------|-----------|---------|
| `frontend/src/lib/api-service.ts` | API client wrapper | Token từ localStorage |
| `frontend/src/stores/cart-store.ts` | Cart state management | localStorage (shopcart_cart) |
| `frontend/src/stores/auth-store.ts` | Auth state management | localStorage (shopcart_auth) |
| `frontend/src/routes/product.$id.tsx` | Product detail page | React state |
| `frontend/src/components/write-review-modal.tsx` | Review submission form | React state |

### Backend

| File | Chức Năng | Lưu Trữ |
|------|-----------|---------|
| `backend/src/main/java/com/shopcart/backend/controller/ProductController.java` | Product endpoints | Không có |
| `backend/src/main/java/com/shopcart/backend/controller/ReviewController.java` | Review endpoints | Không có |
| `backend/src/main/java/com/shopcart/backend/controller/AuthController.java` | Auth endpoints | Không có |
| `backend/src/main/java/com/shopcart/backend/service/ProductService.java` | Product business logic | Không có |
| `backend/src/main/java/com/shopcart/backend/service/ReviewService.java` | Review business logic + AI integration | Không có |
| `backend/src/main/java/com/shopcart/backend/service/NlpService.java` | NLP service client | Không có |
| `backend/src/main/java/com/shopcart/backend/service/AuthService.java` | Auth business logic + JWT | Không có |
| `backend/src/main/java/com/shopcart/backend/model/Product.java` | Product entity mapping | Không có |
| `backend/src/main/java/com/shopcart/backend/model/Review.java` | Review entity mapping | Không có |
| `backend/src/main/java/com/shopcart/backend/repository/ProductRepository.java` | Product data access | Không có |
| `backend/src/main/java/com/shopcart/backend/repository/ReviewRepository.java` | Review data access | Không có |

### NLP Service

| File | Chức Năng | Lưu Trữ |
|------|-----------|---------|
| `nlp-service/index.ts` | Express server | Không có |
| `nlp-service/sentiment-analyzer.ts` | Sentiment analysis logic | Không có |

### Database

| Table | Chức Năng |
|-------|-----------|
| `products` | Lưu trữ thông tin sản phẩm |
| `reviews` | Lưu trữ review + AI analysis |
| `review_suggested_features` | Lưu trữ features gợi ý từ AI |
| `users` | Lưu trữ thông tin user |
| `orders` | Lưu trữ đơn hàng |
| `coupons` | Lưu trữ mã giảm giá |

---

## Storage Summary

### Browser Storage

| Storage Type | Key | Data | Scope |
|-------------|-----|------|-------|
| localStorage | `shopcart_auth` | `{ user, token, idToken }` | Persistent |
| localStorage | `shopcart_cart` | `{ items: [...] }` | Persistent |
| sessionStorage | - | Session data | Session only |

### Database Storage

| Table | Persistent? | Backup? |
|-------|-------------|---------|
| products | Yes | Yes (SQL dump) |
| reviews | Yes | Yes (SQL dump) |
| users | Yes | Yes (SQL dump) |
| orders | Yes | Yes (SQL dump) |
| coupons | Yes | Yes (SQL dump) |

### In-Memory Storage

| Component | Data | Duration |
|-----------|------|----------|
| React State | Component state | Until unmount |
| Zustand Store | Global state | Until page reload (persisted to localStorage) |
| Java Objects | Entity objects | Until request ends |

---

## Key Insights

1. **Frontend-Backend Communication**: HTTP/REST API với JSON
2. **Backend-NLP Communication**: HTTP/REST API với JSON (async/reactive)
3. **State Management**: 
   - Frontend: Zustand + localStorage persistence
   - Backend: JPA entities + PostgreSQL
4. **AI Integration**: Backend gọi NLP microservice, có fallback mechanism
5. **Authentication**: JWT token stored in localStorage, sent in Authorization header
6. **Data Flow**: Unidirectional (User → Frontend → Backend → Database)
7. **Error Handling**: Try-catch với fallback values
8. **Performance**: Debouncing, caching, async/await, reactive streams
