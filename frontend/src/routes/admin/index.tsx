import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiFetch, ApiError } from "@/lib/api-service";
import { useAuthStore } from "@/stores/auth-store";
import type { Coupon } from "@/types";
import { toast } from "sonner";
import { DollarSign, Plus, Trash2, RefreshCw, Shield, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = useAuthStore((s) => s.isAdmin());

  const [revenue, setRevenue] = useState<number>(0);
  const [loadingRevenue, setLoadingRevenue] = useState(true);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);

  // New coupon form
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponType, setNewCouponType] = useState<"PERCENT" | "FIXED">("PERCENT");
  const [newCouponValue, setNewCouponValue] = useState("");
  const [newCouponExpiry, setNewCouponExpiry] = useState("");
  const [newCouponMinSpend, setNewCouponMinSpend] = useState("");
  const [newCouponMaxDiscount, setNewCouponMaxDiscount] = useState("");
  const [newCouponUsageLimit, setNewCouponUsageLimit] = useState("");
  const [creatingCoupon, setCreatingCoupon] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    fetchRevenue();
    fetchCoupons();
  }, [isAdmin]);

  const fetchRevenue = async () => {
    setLoadingRevenue(true);
    try {
      const response = await apiFetch<{ revenue: number; currency: string }>("/api/admin/revenue");
      setRevenue(response.revenue);
    } catch (e) {
      console.error("Failed to fetch revenue:", e);
      toast.error("Không thể tải doanh thu");
    } finally {
      setLoadingRevenue(false);
    }
  };

  const fetchCoupons = async () => {
    setLoadingCoupons(true);
    try {
      const response = await apiFetch<Coupon[]>("/api/admin/coupons");
      setCoupons(response);
    } catch (e) {
      console.error("Failed to fetch coupons:", e);
      toast.error("Không thể tải danh sách mã giảm giá");
    } finally {
      setLoadingCoupons(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode || !newCouponValue || !newCouponExpiry) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setCreatingCoupon(true);
    try {
      const body: any = {
        code: newCouponCode.toUpperCase(),
        type: newCouponType,
        value: parseFloat(newCouponValue),
        expiryDate: newCouponExpiry,
      };

      // Add optional fields if provided
      if (newCouponMinSpend) body.minSpend = parseFloat(newCouponMinSpend);
      if (newCouponMaxDiscount) body.maxDiscount = parseFloat(newCouponMaxDiscount);
      if (newCouponUsageLimit) body.usageLimit = parseInt(newCouponUsageLimit);

      await apiFetch<Coupon>("/api/admin/coupons", {
        method: "POST",
        body,
      });
      toast.success("Đã tạo mã giảm giá thành công");
      setNewCouponCode("");
      setNewCouponValue("");
      setNewCouponExpiry("");
      setNewCouponMinSpend("");
      setNewCouponMaxDiscount("");
      setNewCouponUsageLimit("");
      fetchCoupons();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Không thể tạo mã giảm giá");
    } finally {
      setCreatingCoupon(false);
    }
  };

  const handleDeleteCoupon = async (couponId: number) => {
    try {
      await apiFetch(`/api/admin/coupons/${couponId}`, {
        method: "DELETE",
      });
      toast.success("Đã xóa mã giảm giá");
      fetchCoupons();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Không thể xóa mã giảm giá");
    }
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <Shield className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Truy cập bị từ chối</h1>
        <p className="text-muted-foreground">Bạn cần quyền ADMIN để truy cập trang này.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Quản lý doanh thu và mã giảm giá</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Tổng doanh thu
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingRevenue ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-4xl font-bold">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(revenue)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Tổng doanh thu từ các đơn hàng thành công (PAID, SHIPPED, DELIVERED)
                </p>
                <Button variant="outline" size="sm" onClick={fetchRevenue}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Cập nhật
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Coupon Management Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Quản lý mã giảm giá
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Create Coupon Form */}
            <form onSubmit={handleCreateCoupon} className="space-y-3">
              <div>
                <Label htmlFor="couponCode">Mã giảm giá</Label>
                <Input
                  id="couponCode"
                  placeholder="SAVE10"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="couponType">Loại</Label>
                  <select
                    id="couponType"
                    value={newCouponType}
                    onChange={(e) => setNewCouponType(e.target.value as "PERCENT" | "FIXED")}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="PERCENT">Phần trăm (%)</option>
                    <option value="FIXED">Cố định (VND)</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="couponValue">Giá trị</Label>
                  <Input
                    id="couponValue"
                    type="number"
                    step="0.01"
                    placeholder="10"
                    value={newCouponValue}
                    onChange={(e) => setNewCouponValue(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="couponExpiry">Ngày hết hạn</Label>
                <Input
                  id="couponExpiry"
                  type="datetime-local"
                  value={newCouponExpiry}
                  onChange={(e) => setNewCouponExpiry(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="couponMinSpend">Chi tiêu tối thiểu (VND)</Label>
                  <Input
                    id="couponMinSpend"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={newCouponMinSpend}
                    onChange={(e) => setNewCouponMinSpend(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="couponMaxDiscount">Giảm giá tối đa (VND)</Label>
                  <Input
                    id="couponMaxDiscount"
                    type="number"
                    step="0.01"
                    placeholder="Chỉ %"
                    value={newCouponMaxDiscount}
                    onChange={(e) => setNewCouponMaxDiscount(e.target.value)}
                    disabled={newCouponType !== "PERCENT"}
                  />
                </div>
                <div>
                  <Label htmlFor="couponUsageLimit">Giới hạn sử dụng</Label>
                  <Input
                    id="couponUsageLimit"
                    type="number"
                    placeholder="Không giới hạn"
                    value={newCouponUsageLimit}
                    onChange={(e) => setNewCouponUsageLimit(e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={creatingCoupon}>
                {creatingCoupon ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                Tạo mã giảm giá
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Coupon List */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Danh sách mã giảm giá hiện có</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingCoupons ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : coupons.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Chưa có mã giảm giá nào.</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-card"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{coupon.code}</span>
                      <span className={`text-xs px-2 py-1 rounded ${coupon.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {coupon.active ? "Hoạt động" : "Không hoạt động"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {coupon.type === "PERCENT" ? `${coupon.value}% giảm giá` : `${coupon.value.toLocaleString("vi-VN")} VND giảm giá`}
                    </p>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <p>Hết hạn: {new Date(coupon.expiryDate).toLocaleString("vi-VN")}</p>
                      {coupon.minSpend && coupon.minSpend > 0 && (
                        <p>Chi tiêu tối thiểu: {coupon.minSpend.toLocaleString("vi-VN")} VND</p>
                      )}
                      {coupon.maxDiscount && coupon.maxDiscount > 0 && (
                        <p>Giảm giá tối đa: {coupon.maxDiscount.toLocaleString("vi-VN")} VND</p>
                      )}
                      {coupon.usageLimit && (
                        <p>Giới hạn sử dụng: {coupon.usedCount || 0}/{coupon.usageLimit}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteCoupon(coupon.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
