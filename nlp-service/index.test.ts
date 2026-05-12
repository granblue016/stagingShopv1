import request from 'supertest';
import { app } from './index';
import { analyzeSentiment } from './sentiment-analyzer';

// Mock analyzeSentiment function
jest.mock('./sentiment-analyzer', () => ({
  analyzeSentiment: jest.fn()
}));

describe('NLP Service API', () => {

  describe('POST /analyze', () => {
    it('should return 400 when reviewText is missing', async () => {
      const response = await request(app)
        .post('/analyze')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "reviewText is required" });
    });

    it('should return 400 when reviewText is empty', async () => {
      const response = await request(app)
        .post('/analyze')
        .send({ reviewText: "" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "reviewText is required" });
    });

    it('should return 200 and analysis result when reviewText is provided', async () => {
      const mockResult = {
        sentiment: "Positive",
        rating_score: 4,
        is_fake_review: false,
        aspects: {
          pin: "Không có thông tin",
          man_hinh: "Không có thông tin",
          hieu_nang: "Không có thông tin"
        },
        justification: "Test result",
        competitor_mentioned: null,
        needs_support: false,
        technical_issue: null,
        primary_emotion: "Satisfaction",
        priority: "LOW",
        suggested_features: [],
        helpfulness_score: 5
      };

      (analyzeSentiment as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/analyze')
        .send({ reviewText: "Sản phẩm tốt, rất hài lòng" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(analyzeSentiment).toHaveBeenCalledWith("Sản phẩm tốt, rất hài lòng");
    });

    it('should handle errors gracefully', async () => {
      (analyzeSentiment as jest.Mock).mockRejectedValue(new Error("API failed"));

      const response = await request(app)
        .post('/analyze')
        .send({ reviewText: "Test review" });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Failed to analyze sentiment" });
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ 
        status: "ok", 
        service: "nlp-service" 
      });
    });
  });
});
