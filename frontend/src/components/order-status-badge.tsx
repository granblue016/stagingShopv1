import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/types";
import { cn } from "@/lib/utils";

const styles: Record<OrderStatus, string> = {
  pending: "bg-warning/15 text-warning-foreground border-warning/30",
  paid: "bg-success/15 text-success border-success/30",
  shipped: "bg-info/15 text-info border-info/30",
  delivered: "bg-primary/15 text-primary border-primary/30",
  cancelled: "bg-destructive/15 text-destructive border-destructive/30",
};

const labels: Record<OrderStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant="outline" className={cn("font-medium", styles[status])}>
      {labels[status]}
    </Badge>
  );
}
