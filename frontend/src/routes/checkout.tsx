import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { apiFetch, ApiError } from "@/lib/api-service";
import type { Coupon, Order, ShippingInfo } from "@/types";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, CreditCard, Loader2, TicketPercent } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const clear = useCartStore((s) => s.clear);
  const removeItem = useCartStore((s) => s.removeItem);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const [shipping, setShipping] = useState<ShippingInfo>({
    fullName: user?.name ?? "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [paying, setPaying] = useState(false);
  const [conflictMsg, setConflictMsg] = useState<string | null>(null);

  const discount = coupon
    ? coupon.type === "PERCENT"
      ? subtotal * (coupon.value / 100)
      : coupon.value
    : 0;
  const shippingFee = subtotal > 0 ? 50000 : 0; // 50k shipping fee in VND
  const total = Math.max(0, subtotal - discount + shippingFee);

  const validateCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    try {
      // For now, we'll just validate the coupon locally since backend doesn't have a validate endpoint
      // In production, you'd call a backend endpoint to validate
      const c: Coupon = {
        id: 1,
        code: couponCode.trim(),
        type: couponCode.trim() === "FIXED20" ? "FIXED" : "PERCENT",
        value: couponCode.trim() === "FIXED20" ? 20 : 10,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        active: true,
        createdAt: new Date().toISOString(),
      };
      setCoupon(c);
      toast.success(`Coupon applied: ${c.type === "PERCENT" ? c.value + "%" : formatPrice(c.value)} off`);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Invalid coupon";
      toast.error(msg);
      setCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handlePay = async () => {
    setConflictMsg(null);
    if (items.length === 0) return toast.error("Your cart is empty");
    if (!shipping.fullName || !shipping.address || !shipping.city || !shipping.postalCode || !shipping.country) {
      return toast.error("Please complete your shipping information");
    }
    setPaying(true);
    try {
      const order = await apiFetch<Order>("/api/orders", {
        method: "POST",
        body: {
          cartItems: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
          shipping: shipping,
          subtotal: subtotal,
          discount: discount,
          shippingFee: shippingFee,
          total: total,
          couponCode: coupon?.code || null,
        },
      });
      clear();
      toast.success("Payment successful!");
      navigate({ to: "/orders", search: { highlight: order.orderId } as never });
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        // Remove conflicting item heuristically — last item in cart
        const last = items[items.length - 1];
        if (last) removeItem(last.product.id);
        setConflictMsg("Someone else just bought the last item. Your cart has been updated.");
      } else {
        toast.error(e instanceof ApiError ? e.message : "Payment failed");
      }
    } finally {
      setPaying(false);
    }
  };

  if (items.length === 0 && !conflictMsg) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold">Nothing to check out</h1>
        <Button asChild className="mt-4"><Link to="/">Back to shop</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Checkout</h1>

      {conflictMsg && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Stock conflict</AlertTitle>
          <AlertDescription>{conflictMsg}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Shipping information</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" value={shipping.fullName} onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={shipping.address} onChange={(e) => setShipping({ ...shipping, address: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="postal">Postal code</Label>
                <Input id="postal" value={shipping.postalCode} onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" value={shipping.country} onChange={(e) => setShipping({ ...shipping, country: e.target.value })} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><TicketPercent className="h-5 w-5" /> Coupon code</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input placeholder="Try WELCOME10 or SAVE20" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
                <Button variant="outline" onClick={validateCoupon} disabled={validatingCoupon}>
                  {validatingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                </Button>
              </div>
              {coupon && (
                <div className="mt-3 flex items-center gap-2 rounded-md border border-success/30 bg-success/10 p-2 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{coupon.code} — {coupon.type === "PERCENT" ? coupon.value + "%" : formatPrice(coupon.value)} off applied</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader><CardTitle>Order summary</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{product.name} × {quantity}</span>
                  <span>{formatPrice(product.price * quantity)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 border-t border-border pt-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              {discount > 0 && (
                <div className="flex justify-between text-success"><span>Discount</span><span>-{formatPrice(discount)}</span></div>
              )}
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{formatPrice(shippingFee)}</span></div>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
              <span>Total</span><span>{formatPrice(total)}</span>
            </div>
            <Button className="w-full" size="lg" onClick={handlePay} disabled={paying || items.length === 0}>
              {paying ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : <><CreditCard className="mr-2 h-4 w-4" /> Pay with Sandbox</>}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Tip: add the "Vortex Mechanical Keyboard" twice to trigger a 409 stock conflict.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
