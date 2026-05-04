import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RTooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiFetch } from "@/lib/api-service";
import { useAuthStore } from "@/stores/auth-store";
import type { Review, ReviewPriority } from "@/types";
import { AlertTriangle, Lightbulb, ShieldAlert, Star } from "lucide-react";

export const Route = createFileRoute("/admin/analytics")({
  beforeLoad: () => {
    const s = useAuthStore.getState();
    if (!s.token) throw redirect({ to: "/login" });
    if (s.user?.role !== "ADMIN") throw redirect({ to: "/" });
  },
  component: AnalyticsPage,
});

const SENTIMENT_COLORS: Record<string, string> = {
  Positive: "oklch(0.72 0.16 155)",
  Negative: "oklch(0.62 0.22 25)",
  Neutral: "oklch(0.7 0.04 260)",
};

const PRIORITY_VARIANT: Record<ReviewPriority, "default" | "secondary" | "destructive" | "outline"> = {
  CRITICAL: "destructive",
  HIGH: "destructive",
  MEDIUM: "secondary",
  LOW: "outline",
};

// Map textual aspect rating → numeric score for radar
function aspectScore(label: string): number {
  switch (label.toLowerCase()) {
    case "excellent": return 5;
    case "good": return 4;
    case "average": return 3;
    case "poor": return 2;
    case "very poor": return 1;
    default: return 0;
  }
}

function AnalyticsPage() {
  const [reviews, setReviews] = useState<Review[] | null>(null);

  useEffect(() => {
    apiFetch<Review[]>("/api/admin/reviews").then(setReviews);
  }, []);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">AI Review Analytics</h1>
        <p className="text-sm text-muted-foreground">
          NLP-powered insights from customer reviews — sentiment, fraud signals, and product aspects.
        </p>
      </div>

      {!reviews ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <TriageAlerts reviews={reviews} />
          <div className="grid gap-6 lg:grid-cols-2">
            <SentimentOverview reviews={reviews} />
            <AspectsRadar reviews={reviews} />
          </div>
          <FeatureRequests reviews={reviews} />
        </div>
      )}
    </div>
  );
}

// --------- Triage Alerts ---------
function TriageAlerts({ reviews }: { reviews: Review[] }) {
  const flagged = useMemo(
    () => reviews.filter((r) => r.priority === "CRITICAL" || r.isFake),
    [reviews],
  );

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-destructive" />
          <CardTitle>Triage Alerts</CardTitle>
        </div>
        <CardDescription>
          Reviews flagged as <span className="font-medium text-destructive">CRITICAL</span> or potentially fake — requires immediate moderation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {flagged.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No alerts. All clear.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Flags</TableHead>
                <TableHead>Justification</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flagged.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.product}</TableCell>
                  <TableCell className="max-w-[260px] truncate text-sm text-muted-foreground" title={r.review}>
                    {r.review}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-sm">
                      <Star className="h-3.5 w-3.5 fill-current text-warning" />
                      {r.rating}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={PRIORITY_VARIANT[r.priority]}>{r.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    {r.isFake && (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="h-3 w-3" /> Fake
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[280px] text-xs text-muted-foreground">
                    {r.justification}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// --------- Sentiment Pie ---------
function SentimentOverview({ reviews }: { reviews: Review[] }) {
  const data = useMemo(() => {
    const counts = { Positive: 0, Negative: 0, Neutral: 0 };
    for (const r of reviews) counts[r.sentiment]++;
    return (Object.keys(counts) as Array<keyof typeof counts>).map((k) => ({
      name: k,
      value: counts[k],
    }));
  }, [reviews]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sentiment Overview</CardTitle>
        <CardDescription>Distribution of review sentiment across all products.</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
              {data.map((entry) => (
                <Cell key={entry.name} fill={SENTIMENT_COLORS[entry.name]} />
              ))}
            </Pie>
            <RTooltip
              contentStyle={{
                background: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// --------- Aspects Radar ---------
function AspectsRadar({ reviews }: { reviews: Review[] }) {
  const data = useMemo(() => {
    const totals = { pin: 0, manHinh: 0, hieuNang: 0 };
    const counts = { pin: 0, manHinh: 0, hieuNang: 0 };
    for (const r of reviews) {
      (Object.keys(totals) as Array<keyof typeof totals>).forEach((k) => {
        const score = aspectScore(r.aspects[k]);
        if (score > 0) {
          totals[k] += score;
          counts[k]++;
        }
      });
    }
    return [
      { aspect: "Battery (Pin)", score: counts.pin ? totals.pin / counts.pin : 0 },
      { aspect: "Screen (Màn hình)", score: counts.manHinh ? totals.manHinh / counts.manHinh : 0 },
      { aspect: "Performance (Hiệu năng)", score: counts.hieuNang ? totals.hieuNang / counts.hieuNang : 0 },
    ];
  }, [reviews]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Aspects</CardTitle>
        <CardDescription>Average score (1–5) per aspect, derived from NLP analysis.</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey="aspect" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
            <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
            <Radar
              name="Score"
              dataKey="score"
              stroke="oklch(0.62 0.18 265)"
              fill="oklch(0.62 0.18 265)"
              fillOpacity={0.4}
            />
            <RTooltip
              contentStyle={{
                background: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// --------- Feature Requests ---------
function FeatureRequests({ reviews }: { reviews: Review[] }) {
  const features = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of reviews) {
      for (const f of r.suggested_features) {
        map.set(f, (map.get(f) ?? 0) + 1);
      }
    }
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [reviews]);

  const max = features[0]?.count ?? 1;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          <CardTitle>Feature Requests</CardTitle>
        </div>
        <CardDescription>Most-requested capabilities surfaced from reviews — sized by frequency.</CardDescription>
      </CardHeader>
      <CardContent>
        {features.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No suggested features yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {features.map((f) => {
              // Word-cloud-style sizing
              const ratio = f.count / max;
              const size = 0.85 + ratio * 0.6; // 0.85rem → 1.45rem
              return (
                <span
                  key={f.name}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-accent/40 px-3 py-1 font-medium text-foreground transition-colors hover:bg-accent"
                  style={{ fontSize: `${size}rem` }}
                >
                  {f.name}
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">
                    ×{f.count}
                  </span>
                </span>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
