import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch, ApiError } from "@/lib/api-service";
import type { Order, OrderItem } from "@/types";
import { toast } from "sonner";

interface Props {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted?: () => void;
  initialProductId?: string;
  lockProduct?: boolean;
}

export function WriteReviewModal({ order, open, onOpenChange, onSubmitted, initialProductId, lockProduct }: Props) {
  const [productId, setProductId] = useState<string>(initialProductId ?? order.items[0]?.productId ?? "");
  const [rating, setRating] = useState<number>(5);
  const [hover, setHover] = useState<number>(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setProductId(order.items[0]?.productId ?? "");
    setRating(5);
    setHover(0);
    setText("");
  };

  const submit = async () => {
    if (!productId) return toast.error("Pick a product to review");
    if (text.trim().length < 10) return toast.error("Review must be at least 10 characters");
    setSubmitting(true);
    try {
      await apiFetch("/api/reviews", {
        method: "POST",
        body: { orderId: order.orderId, productId, rating, text: text.trim() },
      });
      toast.success("Thanks! Your verified review has been submitted.");
      reset();
      onOpenChange(false);
      onSubmitted?.();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Write a verified review</DialogTitle>
          <DialogDescription>
            Order {order.orderId} · Verified purchase review.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {order.items.length > 1 && !lockProduct && (
            <div className="space-y-2">
              <Label>Product</Label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {order.items.map((it: OrderItem) => (
                    <SelectItem key={it.productId} value={it.productId}>
                      {it.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => {
                const active = (hover || rating) >= n;
                return (
                  <button
                    key={n}
                    type="button"
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(n)}
                    className="p-0.5"
                    aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
                  >
                    <Star
                      className={cn(
                        "h-7 w-7 transition-colors",
                        active ? "fill-warning text-warning" : "text-muted-foreground",
                      )}
                    />
                  </button>
                );
              })}
              <span className="ml-2 text-sm text-muted-foreground">{rating}/5</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-text">Your review</Label>
            <Textarea
              id="review-text"
              rows={5}
              placeholder="Share what worked, what didn't, and any suggestions…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={1000}
            />
            <p className="text-right text-xs text-muted-foreground">{text.length}/1000</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
