import type { OrderStatus } from "@/types";

/**
 * Strict state machine for admin-side order transitions.
 * Admins can ONLY advance to the next step — never skip stages.
 * Cancellation is allowed from PENDING or PAID only.
 */
export interface NextAction {
  next: OrderStatus;
  label: string;
}

export function getNextAction(status: OrderStatus): NextAction | null {
  switch (status) {
    case "pending":
      return { next: "paid", label: "Mark as Paid" };
    case "paid":
      return { next: "shipped", label: "Ship Order" };
    case "shipped":
      return { next: "delivered", label: "Mark Delivered" };
    case "delivered":
    case "cancelled":
    default:
      return null;
  }
}

export function canCancel(status: OrderStatus): boolean {
  return status === "pending" || status === "paid";
}

/** Ordered customer-facing journey — used by the timeline/stepper. */
export const CUSTOMER_FLOW: OrderStatus[] = ["pending", "paid", "shipped", "delivered"];

export function flowIndex(status: OrderStatus): number {
  const i = CUSTOMER_FLOW.indexOf(status);
  return i === -1 ? -1 : i;
}
