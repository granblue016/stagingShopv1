import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { OrderStatusStepper } from "@/components/order-status-stepper";
import { WriteReviewModal } from "@/components/write-review-modal";
import { OrderComments } from "@/components/order-comments";
import { apiFetch } from "@/lib/api-service";
import type { Order } from "@/types";
import { useAuthStore } from "@/stores/auth-store";
import { formatDate, formatPrice } from "@/lib/format";
import { Eye, Package, Star } from "lucide-react";

export const Route = createFileRoute("/orders")({
  beforeLoad: () => {
    if (!useAuthStore.getState().token) {
      throw redirect({ to: "/login" });
    }
  },
  component: OrdersPage,
});

function OrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [selected, setSelected] = useState<Order | null>(null);
  const [reviewing, setReviewing] = useState<Order | null>(null);

  const load = () => 
    apiFetch<any[]>("/api/orders/me")
      .then(orders => orders.map(order => ({
        orderId: order.orderId,
        createdAt: order.createdAt,
        totalAmount: order.total || 0,
        status: order.status,
        items: order.items || [],
        shippingInfo: {
          fullName: order.shipping?.fullName || '',
          address: order.shipping?.address || '',
          city: order.shipping?.city || '',
          postalCode: order.shipping?.postalCode || '',
          country: order.shipping?.country || 'Vietnam',
        },
        customerEmail: order.shipping?.email || ''
      })))
      .then(setOrders);

  useEffect(() => { load(); }, []);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My orders</h1>
          <p className="text-sm text-muted-foreground">Track every order placed with your account.</p>
        </div>
        <Button asChild variant="outline"><Link to="/">Continue shopping</Link></Button>
      </div>

      {!orders ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Package className="h-10 w-10 text-muted-foreground" />
            <p className="font-medium">No orders yet</p>
            <Button asChild><Link to="/">Start shopping</Link></Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const canReview = o.status === "delivered";
            return (
              <div key={o.orderId} className="space-y-3">
                <Card className="transition-shadow hover:shadow-[var(--shadow-card)]">
                  <CardContent className="flex flex-col gap-5 p-5">
                    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-mono text-sm font-semibold">{o.orderId}</span>
                          <OrderStatusBadge status={o.status} />
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {formatDate(o.createdAt)} · {o.items?.length || 0} item{(o.items?.length || 0) > 1 ? "s" : ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-semibold">
                          {o.status === "pending" ? "---" : formatPrice(o.totalAmount)}
                        </span>
                        <Button size="sm" variant="outline" onClick={() => setSelected(o)}>
                          <Eye className="mr-2 h-4 w-4" /> View receipt
                        </Button>
                        {canReview && (
                          <Button size="sm" onClick={() => setReviewing(o)}>
                            <Star className="mr-2 h-4 w-4" /> Write a review
                          </Button>
                        )}
                      </div>
                    </div>
                    <OrderStatusStepper status={o.status} />
                  </CardContent>
                </Card>
                <OrderComments order={o} />
              </div>
            );
          })}
        </div>
      )}

      {reviewing && (
        <WriteReviewModal
          order={reviewing}
          open={!!reviewing}
          onOpenChange={(o) => !o && setReviewing(null)}
          onSubmitted={load}
        />
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>Receipt · {selected.orderId}</DialogTitle>
                <DialogDescription>{formatDate(selected.createdAt)}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <OrderStatusBadge status={selected.status} />
                  <span className="text-sm text-muted-foreground">{selected.customerEmail}</span>
                </div>
                <div className="rounded-md border border-border">
                  <div className="border-b border-border bg-muted/40 px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Items
                  </div>
                  <div className="divide-y divide-border">
                    {selected.items?.map((it) => (
                      <div key={it.productId} className="flex justify-between px-3 py-2 text-sm">
                        <span>{it.name} × {it.quantity}</span>
                        <span className="font-medium">{formatPrice(it.price * it.quantity)}</span>
                      </div>
                    )) || <div className="px-3 py-2 text-sm text-muted-foreground">No items</div>}
                  </div>
                  <div className="flex justify-between border-t border-border bg-muted/40 px-3 py-2 text-sm font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(selected.totalAmount)}</span>
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Shipping to</div>
                  <div className="rounded-md border border-border p-3 text-sm">
                    <div className="font-medium">{selected.shippingInfo?.fullName || 'N/A'}</div>
                    <div className="text-muted-foreground">
                      {selected.shippingInfo?.address || 'N/A'}<br />
                      {selected.shippingInfo?.city || 'N/A'}, {selected.shippingInfo?.postalCode || 'N/A'}<br />
                      {selected.shippingInfo?.country || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
