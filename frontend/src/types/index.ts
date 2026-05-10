export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stockQuantity: number;
  category: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface ShippingInfo {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Order {
  orderId: string;
  createdAt: string;
  totalAmount: number;
  status: OrderStatus;
  items: OrderItem[];
  shippingInfo: ShippingInfo;
  customerEmail: string;
}

export interface Coupon {
  id: number;
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  expiryDate: string;
  active: boolean;
  createdAt: string;
  minSpend?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
}

export interface CartItem {
  product: Product;
  quantity: number;
}

// ---------- AI / NLP Review analytics ----------
export type ReviewSentiment = "Positive" | "Negative" | "Neutral";
export type ReviewPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface Review {
  id: number;
  userId: number;
  productId: number;
  content: string;
  rating: number;
  sentiment: ReviewSentiment;
  isFake: boolean;
  priority: ReviewPriority;
  helpfulnessScore: number;
  // AI fields from NLP service
  aiSentiment: ReviewSentiment;
  aiRating: number;
  aiPriority: ReviewPriority;
  aiPrimaryEmotion: string;
  createdAt: string;
  /** Optional — used for client-side data segregation (current user's reviews) */
  customerEmail?: string;
}
