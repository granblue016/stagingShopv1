import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquare, Loader2, Send, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api-service";
import type { Order } from "@/types";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";

interface OrderComment {
  id: number;
  orderId: number;
  userId: number;
  content: string;
  createdAt: string;
}

interface Props {
  order: Order;
}

export function OrderComments({ order }: Props) {
  const [comments, setComments] = useState<OrderComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuthStore.getState();

  const canComment = order.status === "paid" || order.status === "shipped" || order.status === "delivered";
  const isAdmin = user?.role === "ADMIN";

  const loadComments = async () => {
    try {
      const data = await apiFetch<OrderComment[]>(`/api/order-comments/${order.orderId}`);
      setComments(data);
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canComment) {
      loadComments();
    } else {
      setLoading(false);
    }
  }, [order.orderId, canComment]);

  const submitComment = async () => {
    if (!newComment.trim()) {
      toast.error("Vui lòng nhập nội dung bình luận");
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch("/api/order-comments", {
        method: "POST",
        body: {
          orderId: parseInt(order.orderId),
          content: newComment.trim(),
        },
      });
      toast.success("Bình luận đã được thêm thành công");
      setNewComment("");
      loadComments();
    } catch (error) {
      toast.error("Không thể thêm bình luận");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteComment = async (commentId: number) => {
    if (!isAdmin) {
      toast.error("Chỉ admin mới có thể xóa bình luận");
      return;
    }

    try {
      await apiFetch(`/api/order-comments/${commentId}`, {
        method: "DELETE",
      });
      toast.success("Đã xóa bình luận");
      loadComments();
    } catch (error) {
      toast.error("Không thể xóa bình luận");
    }
  };

  if (!canComment) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
          <MessageSquare className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Bình luận chỉ khả dụng sau khi đơn hàng được thanh toán
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Bình luận đơn hàng
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Form thêm bình luận */}
        <div className="space-y-2">
          <Label htmlFor="comment">Thêm bình luận</Label>
          <div className="flex gap-2">
            <Textarea
              id="comment"
              placeholder="Chia sẻ thắc mắc hoặc nhận xét về đơn hàng..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px]"
              maxLength={500}
            />
          </div>
          <Button 
            onClick={submitComment} 
            disabled={!newComment.trim() || submitting}
            size="sm"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Gửi bình luận
          </Button>
        </div>

        {/* Danh sách bình luận */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            {comments.length} bình luận
          </h4>
          
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-lg border border-border p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      User {comment.userId} · {formatDate(comment.createdAt)}
                    </div>
                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteComment(comment.id)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
