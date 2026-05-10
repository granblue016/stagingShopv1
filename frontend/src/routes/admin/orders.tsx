import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { apiFetch } from "@/lib/api-service";
import type { Order, OrderStatus, Product } from "@/types";
import { useAuthStore } from "@/stores/auth-store";
import { formatDate, formatPrice } from "@/lib/format";
import { ArrowDownUp, Loader2, Pencil, ArrowRight, XCircle } from "lucide-react";
import { toast } from "sonner";
import { canCancel, getNextAction } from "@/lib/order-state-machine";

export const Route = createFileRoute("/admin/orders")({
  beforeLoad: () => {
    const s = useAuthStore.getState();
    if (!s.token) throw redirect({ to: "/login" });
    if (s.user?.role !== "ADMIN") throw redirect({ to: "/" });
  },
  component: AdminPage,
});

type SortKey = "date" | "amount";

function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Admin control center</h1>
      <p className="mb-6 text-sm text-muted-foreground">Manage orders and inventory in real time.</p>

      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>
        <TabsContent value="orders" className="mt-4"><OrdersTable /></TabsContent>
        <TabsContent value="inventory" className="mt-4"><InventoryTable /></TabsContent>
      </Tabs>
    </div>
  );
}

function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    apiFetch<Order[]>("/api/admin/orders")
      .then((d) => { setOrders(d); setLoading(false); })
      .catch((err) => { setError("Failed to load orders"); setLoading(false); console.error(err); });
  }, []);

  const view = useMemo(() => {
    let arr = [...orders];
    if (statusFilter !== "ALL") arr = arr.filter((o) => o.status === statusFilter);
    arr.sort((a, b) => {
      const va = sortKey === "date" ? new Date(a.createdAt).getTime() : a.totalAmount;
      const vb = sortKey === "date" ? new Date(b.createdAt).getTime() : b.totalAmount;
      return sortDir === "asc" ? va - vb : vb - va;
    });
    return arr;
  }, [orders, statusFilter, sortKey, sortDir]);

  const updateStatus = async (id: string, status: OrderStatus) => {
    const prev = orders;
    setOrders((o) => o.map((x) => (x.orderId === id ? { ...x, status } : x)));
    try {
      await apiFetch<Order>(`/api/admin/orders/${id}/status`, { method: "PATCH", body: { status } });
      toast.success(`Order ${id} → ${status}`);
    } catch {
      setOrders(prev);
      toast.error("Failed to update order");
    }
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>All orders</CardTitle>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Filter</Label>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as OrderStatus | "ALL")}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="SHIPPED">Shipped</SelectItem>
              <SelectItem value="DELIVERED">Delivered</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button size="sm" variant="outline" className="mt-2" onClick={() => window.location.reload()}>Retry</Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>
                  <button className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort("date")}>
                    Date <ArrowDownUp className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>
                  <button className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort("amount")}>
                    Amount <ArrowDownUp className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Next action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {view.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">No orders found.</TableCell></TableRow>
              ) : (
                view.map((o) => {
                  const next = getNextAction(o.status);
                  return (
                    <TableRow key={o.orderId}>
                      <TableCell className="font-mono text-xs">{o.orderId}</TableCell>
                      <TableCell>{formatDate(o.createdAt)}</TableCell>
                      <TableCell>{o.customerEmail}</TableCell>
                      <TableCell className="font-medium">{formatPrice(o.totalAmount || 0)}</TableCell>
                      <TableCell><OrderStatusBadge status={o.status} /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {next ? (
                            <Button size="sm" onClick={() => updateStatus(o.orderId, next.next)}>
                              {next.label} <ArrowRight className="ml-2 h-3.5 w-3.5" />
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">No further action</span>
                          )}
                          {canCancel(o.status) && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:text-destructive"
                              onClick={() => updateStatus(o.orderId, "CANCELLED")}
                            >
                              <XCircle className="mr-1.5 h-3.5 w-3.5" /> Cancel
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function InventoryTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [newStock, setNewStock] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  const refresh = () => {
    setLoading(true);
    setError(null);
    apiFetch<Product[]>("/api/products")
      .then((d) => { setProducts(d); setLoading(false); })
      .catch((err) => { setError("Failed to load products"); setLoading(false); console.error(err); });
  };

  useEffect(refresh, []);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await apiFetch<Product>(`/api/admin/products/${editing.id}/stock`, {
        method: "PATCH",
        body: { stockQuantity: newStock },
      });
      toast.success("Stock updated");
      setEditing(null);
      refresh();
    } catch {
      toast.error("Failed to update stock");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Inventory sync</CardTitle></CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button size="sm" variant="outline" className="mt-2" onClick={refresh}>Retry</Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">No products found.</TableCell></TableRow>
              ) : (
                products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img src={p.imageUrl} alt={p.name} className="h-10 w-10 rounded object-cover" />
                        <span className="font-medium">{p.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{p.category}</TableCell>
                    <TableCell>{formatPrice(p.price)}</TableCell>
                    <TableCell>
                      <span className={p.stockQuantity === 0 ? "text-destructive font-medium" : p.stockQuantity <= 3 ? "text-warning-foreground font-medium" : ""}>
                        {p.stockQuantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => { setEditing(p); setNewStock(p.stockQuantity); }}>
                        <Pencil className="mr-2 h-3.5 w-3.5" /> Edit stock
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit stock — {editing?.name}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="stock">Stock quantity</Label>
            <Input id="stock" type="number" min={0} value={newStock} onChange={(e) => setNewStock(parseInt(e.target.value || "0", 10))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
