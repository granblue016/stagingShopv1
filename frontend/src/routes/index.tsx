import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-service";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/format";
import { ShoppingCart, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";

export const Route = createFileRoute("/")({
  component: ShopPage,
});

function ShopPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    apiFetch<Product[]>("/api/products")
      .then(setProducts)
      .catch((e) => setError(e.message));
  }, []);

  const handleAdd = useDebouncedCallback((p: Product) => {
    const inCart = items.find((i) => i.product.id === p.id)?.quantity ?? 0;
    if (inCart >= p.stockQuantity) {
      toast.warning("Maximum stock reached", { duration: 2000 });
      return;
    }
    addItem(p);
    toast.success(`${p.name} added to cart`);
  }, 500);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[image:var(--gradient-hero)] opacity-[0.08]" />
        <div className="container relative mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Curated tech, fast checkout
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Premium gear, <span className="bg-[image:var(--gradient-hero)] bg-clip-text text-transparent">delivered fast</span>
            </h1>
            <p className="mt-4 text-base text-muted-foreground md:text-lg">
              Shop the latest in audio, wearables, and home tech. Real-time inventory, instant checkout.
            </p>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Featured products</h2>
            <p className="text-sm text-muted-foreground">Hand-picked items in stock now.</p>
          </div>
          <Link to="/cart" className="text-sm font-medium text-primary hover:underline">
            View cart →
          </Link>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {!products
            ? Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <CardContent className="space-y-2 p-4">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))
            : products.map((p) => (
                <Card key={p.id} data-testid="product-card" className="group overflow-hidden border-border shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]">
                  <Link to="/product/$id" params={{ id: p.id }} className="block">
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {p.stockQuantity <= 3 && p.stockQuantity > 0 && (
                        <Badge className="absolute left-3 top-3 bg-warning text-warning-foreground">
                          Only {p.stockQuantity} left
                        </Badge>
                      )}
                      {p.stockQuantity === 0 && (
                        <Badge variant="destructive" className="absolute left-3 top-3">
                          Sold out
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">{p.category}</div>
                      <h3 className="font-semibold leading-tight" data-testid="product-name">{p.name}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                    </CardContent>
                  </Link>
                  <CardFooter className="flex items-center justify-between p-4 pt-0">
                    <span className="text-lg font-bold" data-testid="product-price">{formatPrice(p.price)}</span>
                    {(() => {
                      const inCart = items.find((i) => i.product.id === p.id)?.quantity ?? 0;
                      const maxed = inCart >= p.stockQuantity;
                      const soldOut = p.stockQuantity === 0;
                      return (
                        <Button
                          size="sm"
                          disabled={soldOut || maxed}
                          onClick={() => handleAdd(p)}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          {soldOut ? "Sold out" : maxed ? "Max in cart" : "Add"}
                        </Button>
                      );
                    })()}
                  </CardFooter>
                </Card>
              ))}
        </div>
      </section>
    </div>
  );
}
