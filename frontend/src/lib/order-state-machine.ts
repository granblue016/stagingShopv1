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
    case "PENDING":
      return { next: "PAID", label: "Mark as Paid" };
    case "PAID":
      return { next: "SHIPPED", label: "Ship Order" };
    case "SHIPPED":
      return { next: "DELIVERED", label: "Mark Delivered" };
    case "DELIVERED":
    case "CANCELLED":
    default:
      return null;
  }
}

export function canCancel(status: OrderStatus): boolean {
  return status === "PENDING" || status === "PAID";
}

/** Ordered customer-facing journey — used by the timeline/stepper. */
export const CUSTOMER_FLOW: OrderStatus[] = ["PENDING", "PAID", "SHIPPED", "DELIVERED"];

export function flowIndex(status: OrderStatus): number {
  const i = CUSTOMER_FLOW.indexOf(status);
  return i === -1 ? -1 : i;
}
