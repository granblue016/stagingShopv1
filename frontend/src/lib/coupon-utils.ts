import type { Coupon } from "@/types";

export interface DiscountCalculation {
  discount: number;
  shippingFee: number;
  total: number;
}

/**
 * Calculate discount, shipping fee, and total based on coupon and subtotal
 */
export function calculateOrderTotals(
  subtotal: number,
  coupon: Coupon | null,
  shippingFee: number = 50000
): DiscountCalculation {
  const discount = coupon
    ? coupon.type === "PERCENT"
      ? subtotal * (coupon.value / 100)
      : coupon.value
    : 0;
  
  const actualShippingFee = subtotal > 0 ? shippingFee : 0;
  const total = Math.max(0, subtotal - discount + actualShippingFee);

  return {
    discount,
    shippingFee: actualShippingFee,
    total,
  };
}

/**
 * Check if a coupon is valid (not expired and active)
 */
export function isCouponValid(coupon: Coupon): boolean {
  const now = new Date();
  const expiryDate = new Date(coupon.expiryDate);
  return coupon.active && expiryDate > now;
}

/**
 * Calculate the final price after applying a discount
 */
export function applyDiscount(
  originalPrice: number,
  coupon: Coupon | null
): number {
  if (!coupon || !coupon.active) {
    return originalPrice;
  }

  const discount = coupon.type === "PERCENT"
    ? originalPrice * (coupon.value / 100)
    : coupon.value;

  return Math.max(0, originalPrice - discount);
}
