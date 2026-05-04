import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api-service";
import type { Order, Product, Review } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Minus, Plus, ShoppingCart, Sparkles, Star, ArrowLeft, ShieldCheck } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { formatPrice } from "@/lib/format";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { WriteReviewModal } from "@/components/write-review-modal";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$id")({
  component: ProductDetailPage,
});

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            "h-4 w-4",
            n <= value ? "fill-warning text-warning" : "text-muted-foreground/40",
          )}
        />
      ))}
    </div>
  );
}

function ProductDetailPage() {
  const { id } = Route.useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [reviewOpen, setReviewOpen] = useState(false);

  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    setProduct(null);
    setReviews(null);
    setError(null);
    setQty(1);
    apiFetch<Product>(`/api/products/${id}`).then(setProduct).catch((e) => setError(e.message));
    apiFetch<Review[]>(`/api/products/${id}/reviews`)
      .then((r) => setReviews(Array.isArray(r) ? r : []))
      .catch(() => setReviews([]));
    if (token) {
      apiFetch<Order[]>("/api/orders")
        .then((o) => setOrders(Array.isArray(o) ? o : []))
        .catch(() => setOrders([]));
    } else {
      setOrders([]);
    }
  }, [id, token]);

  const inCart = items.find((i) => i.product.id === id)?.quantity ?? 0;

  const handleAdd = useDebouncedCallback(() => {
    if (!product) return;
    const remaining = product.stockQuantity - inCart;
    if (remaining <= 0) {
      toast.warning("Maximum stock reached", { duration: 2000 });
      return;
    }
    const toAdd = Math.min(qty, remaining);
    addItem(product, toAdd);
    toast.success(`Added ${toAdd} × ${product.name} to cart`);
    if (toAdd < qty) {
      toast.info(`Only ${toAdd} added — stock limit reached`);
    }
  }, 500);

  // Verified purchase eligibility — user must own an order containing this product
  // with status >= PAID (PAID, SHIPPED, or DELIVERED).
  const eligibleOrder = useMemo<Order | null>(() => {
    if (!orders || !product) return null;
    return (
      orders.find(
        (o) =>
          ["PAID", "SHIPPED", "DELIVERED"].includes(o.status) &&
          o.items.some((it) => it.productId === product.id),
      ) ?? null
    );
  }, [orders, product]);

  const reviewTooltip = !token
    ? "Sign in to review purchased items."
    : "You must purchase and pay for this item to leave a review.";

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-destructive">{error}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/">Back to shop</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link to="/"><ArrowLeft className="mr-1 h-4 w-4" />Back to shop</Link>
      </Button>

      {!product ? (
        <div className="grid gap-8 md:grid-cols-2">
          <Skeleton className="aspect-square w-full" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
            <Skeleton className="h-12 w-40" />
          </div>
        </div>
      ) : (
        <div className="grid gap-10 md:grid-cols-2">
          <div className="overflow-hidden rounded-lg border border-border bg-muted">
            <img src={product.imageUrl} alt={product.name} className="aspect-square w-full object-cover" />
          </div>

          <div className="flex flex-col gap-5">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">{product.category}</div>
              <h1 className="mt-1 text-3xl font-bold tracking-tight">{product.name}</h1>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
              {product.stockQuantity === 0 ? (
                <Badge variant="destructive">Sold out</Badge>
              ) : product.stockQuantity <= 3 ? (
                <Badge className="bg-warning text-warning-foreground">Only {product.stockQuantity} left</Badge>
              ) : (
                <Badge variant="secondary">In stock · {product.stockQuantity}</Badge>
              )}
            </div>

            <p className="text-muted-foreground">{product.description}</p>

            <div className="flex flex-wrap items-end gap-4 pt-2">
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Quantity
                </label>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-r-none"
                    disabled={qty <= 1}
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min={1}
                    max={product.stockQuantity}
                    value={qty}
                    onChange={(e) => {
                      const v = parseInt(e.target.value || "1", 10);
                      if (Number.isNaN(v)) return setQty(1);
                      setQty(Math.min(Math.max(1, v), Math.max(1, product.stockQuantity)));
                    }}
                    className="h-10 w-16 rounded-none border-x-0 text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-l-none"
                    disabled={qty >= product.stockQuantity}
                    onClick={() => setQty((q) => Math.min(product.stockQuantity, q + 1))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button
                size="lg"
                onClick={handleAdd}
                disabled={product.stockQuantity === 0 || inCart >= product.stockQuantity}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {product.stockQuantity === 0
                  ? "Sold out"
                  : inCart >= product.stockQuantity
                    ? "Max in cart"
                    : "Add to cart"}
              </Button>
            </div>

            {inCart > 0 && (
              <p className="text-xs text-muted-foreground">
                {inCart} already in your cart.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Reviews */}
      <section className="mt-16">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold tracking-tight">Customer reviews</h2>

          <TooltipProvider delayDuration={100}>
            {eligibleOrder ? (
              <Button onClick={() => setReviewOpen(true)}>
                <Star className="mr-2 h-4 w-4" /> Write a review
              </Button>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0}>
                    <Button disabled>
                      <Star className="mr-2 h-4 w-4" /> Write a review
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>{reviewTooltip}</TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </div>

        {/* AI Insight box */}
        <Card className="mb-6 border-primary/30 bg-[image:var(--gradient-hero)]/5">
          <CardContent className="flex gap-3 p-5">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">AI Review Summary</h3>
                <Badge variant="outline" className="text-xs">Beta</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                AI notes that customers love the build quality and battery life, but mention shipping
                can be slow and the screen brightness could be improved in direct sunlight.
              </p>
            </div>
          </CardContent>
        </Card>

        {!reviews ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        ) : reviews.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No reviews yet. Be the first to share your thoughts.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <Card key={r.id}>
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {r.customerEmail ? r.customerEmail.split("@")[0] : "Anonymous"}
                      </span>
                      <Badge variant="outline" className="gap-1 text-xs">
                        <ShieldCheck className="h-3 w-3" /> Verified purchase
                      </Badge>
                    </div>
                    <Stars value={r.rating} />
                  </div>
                  <p className="mt-2 text-sm text-foreground/90">{r.review}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {eligibleOrder && product && (
        <WriteReviewModal
          order={eligibleOrder}
          open={reviewOpen}
          onOpenChange={setReviewOpen}
          initialProductId={product.id}
          lockProduct
          onSubmitted={() => {
            apiFetch<Review[]>(`/api/products/${id}/reviews`).then(setReviews).catch(() => {});
          }}
        />
      )}
    </div>
  );
}
