import type { Coupon, Order, OrderStatus, Product, Review, ShippingInfo, User } from "@/types";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const BASE_URL = "http://localhost:8081";  // Native: Use localhost directly

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("shopcart_auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token || null;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const method = init?.method ?? "GET";
  let backendPath = path;

  // Route translations for Spring Boot backend
  if (path === "/api/orders" && method === "POST") {
    backendPath = "/api/orders/checkout";
  } else if (path === "/api/orders" && method === "GET") {
    backendPath = "/api/orders/me";
  } else if (path === "/api/coupons/validate" && method === "POST") {
    backendPath = "/api/coupons/validate";
  } else if (path.match(/^\/api\/products\/[^/]+\/reviews$/) && method === "GET") {
    backendPath = path; // Keep as-is: /api/products/{id}/reviews
  // Admin endpoints are now implemented in backend
  } else if (path === "/api/reviews" && method === "POST") {
    backendPath = "/api/reviews";
  } else if (path.match(/^\/api\/admin\/products\/[^/]+\/stock$/) && method === "PATCH") {
    backendPath = path.replace("/api/admin/products", "/api/admin/inventory"); // Translate to: /api/admin/inventory/{id}
  } else if (path.match(/^\/api\/admin\/products\/[^/]+\/stock$/) && method === "PUT") {
    backendPath = path.replace("/api/admin/products", "/api/admin/inventory"); // Translate to: /api/admin/inventory/{id}
  } else if (path === "/api/auth/login" && method === "POST") {
    backendPath = "/api/auth/login";
  } else if (path === "/api/admin/orders" && method === "GET") {
    backendPath = "/api/admin/orders"; // Admin orders endpoint
  } else if (path.match(/^\/api\/admin\/orders\/\d+\/status$/) && method === "PATCH") {
    backendPath = path; // Admin order status update endpoint
  } else if (path === "/api/products" && method === "GET") {
    backendPath = "/api/products";
  } else if (path.match(/^\/api\/products\/[^/]+$/) && method === "GET") {
    backendPath = path; // Keep as-is: /api/products/{id}
  } else if (path.match(/^\/api\/orders\/\d+\/comments$/) && (method === "GET" || method === "POST")) {
    backendPath = path.replace("/api/orders", "/api/order-comments"); // Translate to: /api/order-comments/{id}/comments
  }

  const url = `${BASE_URL}${backendPath}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token = getToken();
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

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      let errorMessage = "Đã xảy ra lỗi hệ thống từ máy chủ.";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || await response.text() || errorMessage;
      } catch (e) {
        errorMessage = await response.text() || errorMessage;
      }
      throw new ApiError(response.status, errorMessage);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Không thể kết nối đến máy chủ 8081. Hãy kiểm tra xem Backend đã chạy chưa.");
  }
}

export function resetMockDB() {
  console.log("Mock DB đã bị gỡ bỏ. Dữ liệu hiện tại là dữ liệu thật từ Backend.");
}
