import { Check } from "lucide-react";
import type { OrderStatus } from "@/types";
import { CUSTOMER_FLOW, flowIndex } from "@/lib/order-state-machine";
import { cn } from "@/lib/utils";

const LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export function OrderStatusStepper({ status }: { status: OrderStatus }) {
  if (status === "CANCELLED") {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        This order was cancelled.
      </div>
    );
  }

  const current = flowIndex(status);

  return (
    <ol className="flex items-center gap-0">
      {CUSTOMER_FLOW.map((step, i) => {
        const reached = i <= current;
        const isCurrent = i === current;
        const isLast = i === CUSTOMER_FLOW.length - 1;

        return (
          <li key={step} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-full border text-xs font-semibold transition-colors",
                  reached
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground",
                  isCurrent && "ring-2 ring-primary/30",
                )}
              >
                {reached ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={cn(
                  "mt-1 text-[11px] font-medium",
                  reached ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {LABELS[step]}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  "mx-2 h-0.5 flex-1 -translate-y-2.5 rounded-full",
                  i < current ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
