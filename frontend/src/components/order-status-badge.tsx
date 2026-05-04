import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/types";
import { cn } from "@/lib/utils";

const styles: Record<OrderStatus, string> = {
  PENDING: "bg-warning/15 text-warning-foreground border-warning/30",
  PAID: "bg-success/15 text-success border-success/30",
  SHIPPED: "bg-info/15 text-info border-info/30",
  DELIVERED: "bg-primary/15 text-primary border-primary/30",
  CANCELLED: "bg-destructive/15 text-destructive border-destructive/30",
};

const labels: Record<OrderStatus, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant="outline" className={cn("font-medium", styles[status])}>
      {labels[status]}
    </Badge>
  );
}
