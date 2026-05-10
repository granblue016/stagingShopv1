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
  const discount = coupon && isCouponApplicable(subtotal, coupon)
    ? coupon.type === "PERCENT"
      ? calculatePercentDiscount(subtotal, coupon)
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
 * Calculate percentage discount with max discount limit
 */
function calculatePercentDiscount(subtotal: number, coupon: Coupon): number {
  const discount = subtotal * (coupon.value / 100);
  // Apply max discount limit if specified
  if (coupon.maxDiscount && coupon.maxDiscount > 0) {
    return Math.min(discount, coupon.maxDiscount);
  }
  return discount;
}

/**
 * Check if coupon is applicable to the current order
 */
export function isCouponApplicable(subtotal: number, coupon: Coupon): boolean {
  // Check if coupon is valid (active and not expired)
  if (!isCouponValid(coupon)) {
    return false;
  }

  // Check minimum spend requirement (only if minSpend is defined)
  if (coupon.minSpend !== undefined && subtotal < coupon.minSpend) {
    return false;
  }

  // Check usage limit (only if usageLimit is defined)
  if (coupon.usageLimit !== undefined && coupon.usageLimit !== null && (coupon.usedCount || 0) >= coupon.usageLimit) {
    return false;
  }

  return true;
}

/**
 * Check if a coupon is valid (not expired and active)
 */
export function isCouponValid(coupon: Coupon): boolean {
  const now = new Date();
  const expiryDate = new Date(coupon.expiryDate);
  // Compare only date parts by setting to UTC midnight
  const nowUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const expiryUTC = Date.UTC(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate());
  return coupon.active && expiryUTC >= nowUTC;
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
    ? calculatePercentDiscount(originalPrice, coupon)
    : coupon.value;

  return Math.max(0, originalPrice - discount);
}
