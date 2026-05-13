import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { apiFetch } from "@/lib/api-service";
import { useAuthStore } from "@/stores/auth-store";
import type { Review, ReviewPriority } from "@/types";
import { AlertTriangle, Lightbulb, ShieldAlert, Star, Loader2, X, Brain, TrendingUp } from "lucide-react";

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
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [chartData, setChartData] = useState<any | null>(null);

  useEffect(() => {
    apiFetch<any>("/api/admin/analytics")
      .then((d) => { 
        setAnalytics(d); 
        setLoading(false); 
      })
      .catch((err) => { setError("Failed to load analytics"); setLoading(false); console.error(err); });
  }, []);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">AI Review Analytics</h1>
        <p className="text-sm text-muted-foreground">
          NLP-powered insights from customer reviews — sentiment, fraud signals, and product aspects.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full" />
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button size="sm" variant="outline" onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      ) : !analytics || !analytics.recentComments || analytics.recentComments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <p className="text-sm text-muted-foreground">No reviews found. Start by adding product reviews to see analytics.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-6">
            <TriageAlerts reviews={analytics.recentComments || []} onReviewClick={setSelectedReview} />
            <div className="grid gap-6 lg:grid-cols-2">
              <SentimentOverview reviews={analytics.recentComments || []} onChartClick={setChartData} />
              <AiSentimentComparison reviews={analytics.recentComments || []} onChartClick={setChartData} />
            </div>
            <EmotionAnalysis reviews={analytics.recentComments || []} />
            <AllReviewsTable reviews={analytics.recentComments || []} onReviewClick={setSelectedReview} />
          </div>

          {/* Review Detail Modal */}
          <ReviewDetailModal review={selectedReview} onClose={() => setSelectedReview(null)} />

          {/* Chart Detail Modal */}
          <ChartDetailModal data={chartData} onClose={() => setChartData(null)} />
        </>
      )}
    </div>
  );
}

// --------- Helper to get product name from productId (simplified) ---------
function TriageAlerts({ reviews, onReviewClick }: { reviews: Review[]; onReviewClick: (review: Review) => void }) {
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
                <TableHead>Product ID</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Flags</TableHead>
                <TableHead>AI Sentiment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flagged.map((r) => (
                <TableRow key={r.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onReviewClick(r)}>
                  <TableCell className="font-medium">{r.productId}</TableCell>
                  <TableCell className="max-w-[260px] truncate text-sm text-muted-foreground" title={r.content}>
                    {r.content}
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
                    {r.aiSentiment} ({r.aiPrimaryEmotion})
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
function SentimentOverview({ reviews, onChartClick }: { reviews: Review[]; onChartClick: (data: any) => void }) {
  const data = useMemo(() => {
    const counts = { Positive: 0, Negative: 0, Neutral: 0 };
    for (const r of reviews) counts[r.sentiment]++;
    const total = reviews.length;
    return (Object.keys(counts) as Array<keyof typeof counts>).map((k) => ({
      name: k,
      value: counts[k],
      total,
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
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label onClick={(data) => onChartClick(data)} cursor="pointer">
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

// --------- AI Sentiment Comparison ---------
function AiSentimentComparison({ reviews, onChartClick }: { reviews: Review[]; onChartClick: (data: any) => void }) {
  const data = useMemo(() => {
    const matches = reviews.filter(r => r.sentiment === r.aiSentiment).length;
    const total = reviews.length;
    return [
      { name: "User Sentiment", value: total, total },
      { name: "AI Agreement", value: matches, total },
      { name: "AI Disagreement", value: total - matches, total },
    ];
  }, [reviews]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Sentiment Analysis</CardTitle>
        <CardDescription>Comparison between user sentiment and AI analysis accuracy.</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label onClick={(data) => onChartClick(data)} cursor="pointer">
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.name === "AI Agreement" ? "oklch(0.72 0.16 155)" : entry.name === "AI Disagreement" ? "oklch(0.62 0.22 25)" : "oklch(0.7 0.04 260)"} />
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

// --------- Review Detail Modal ---------
function ReviewDetailModal({ review, onClose }: { review: Review | null; onClose: () => void }) {
  if (!review) return null;

  return (
    <Dialog open={!!review} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Review Analysis Details
          </DialogTitle>
          <DialogDescription>Full AI analysis and review information</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Review Content</h4>
            <p className="text-sm bg-muted p-3 rounded-lg">{review.content}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">User Rating</h4>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-current text-warning" />
                <span className="text-2xl font-bold">{review.rating}</span>
                <span className="text-sm text-muted-foreground">/ 5</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">AI Rating</h4>
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                <span className="text-2xl font-bold">{review.aiRating}</span>
                <span className="text-sm text-muted-foreground">/ 5</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">User Sentiment</h4>
              <Badge variant={review.sentiment === "Positive" ? "default" : review.sentiment === "Negative" ? "destructive" : "secondary"}>
                {review.sentiment}
              </Badge>
            </div>
            <div>
              <h4 className="font-semibold mb-2">AI Sentiment</h4>
              <Badge variant={review.aiSentiment === "Positive" ? "default" : review.aiSentiment === "Negative" ? "destructive" : "secondary"}>
                {review.aiSentiment}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Priority</h4>
              <Badge variant={PRIORITY_VARIANT[review.priority]}>{review.priority}</Badge>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Primary Emotion</h4>
              <Badge variant="outline">{review.aiPrimaryEmotion}</Badge>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Fake Detection</h4>
            {review.isFake ? (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" /> Flagged as Fake
              </Badge>
            ) : (
              <Badge variant="default">Legitimate Review</Badge>
            )}
          </div>

          <div>
            <h4 className="font-semibold mb-2">Helpfulness Score</h4>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-lg font-semibold">{review.helpfulnessScore}</span>
              <span className="text-sm text-muted-foreground">/ 10</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Product ID</h4>
            <p className="text-sm text-muted-foreground">{review.productId}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Review ID</h4>
            <p className="text-sm text-muted-foreground">{review.id}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Created At</h4>
            <p className="text-sm text-muted-foreground">{new Date(review.createdAt).toLocaleString()}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// --------- Chart Detail Modal ---------
function ChartDetailModal({ data, onClose }: { data: any; onClose: () => void }) {
  if (!data) return null;

  // Calculate contextual information based on segment type
  const getSegmentInfo = (name: string, value: number) => {
    const sentimentInfo: Record<string, { description: string; icon: string; color: string; recommendation: string }> = {
      Positive: {
        description: "Reviews expressing satisfaction, praise, or positive feedback about products.",
        icon: "😊",
        color: "oklch(0.72 0.16 155)",
        recommendation: "Maintain quality and encourage these customers to share their experience."
      },
      Negative: {
        description: "Reviews expressing dissatisfaction, complaints, or negative feedback about products.",
        icon: "😞",
        color: "oklch(0.62 0.22 25)",
        recommendation: "Investigate issues and reach out to customers for resolution."
      },
      Neutral: {
        description: "Reviews with balanced or objective feedback without strong emotional tone.",
        icon: "😐",
        color: "oklch(0.7 0.04 260)",
        recommendation: "Consider follow-up to understand customer needs better."
      },
      "User Sentiment": {
        description: "Total number of reviews with sentiment labels assigned by users.",
        icon: "👥",
        color: "oklch(0.7 0.04 260)",
        recommendation: "Review sentiment distribution to understand overall customer satisfaction."
      },
      "AI Agreement": {
        description: "Reviews where AI sentiment analysis matches the user's sentiment label.",
        icon: "✅",
        color: "oklch(0.72 0.16 155)",
        recommendation: "High agreement indicates reliable AI analysis for these reviews."
      },
      "AI Disagreement": {
        description: "Reviews where AI sentiment analysis differs from the user's sentiment label.",
        icon: "⚠️",
        color: "oklch(0.62 0.22 25)",
        recommendation: "Review these cases manually to improve AI accuracy or detect sarcasm/nuance."
      }
    };

    return sentimentInfo[name] || {
      description: "Chart segment information.",
      icon: "📊",
      color: "oklch(0.7 0.04 260)",
      recommendation: "Analyze this segment for insights."
    };
  };

  const segmentInfo = getSegmentInfo(data.name, data.value);
  const total = data.total || 0;
  const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : null;

  return (
    <Dialog open={!!data} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{segmentInfo.icon}</span>
            Chart Details
          </DialogTitle>
          <DialogDescription>Detailed information about the selected chart segment</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <h4 className="font-semibold mb-1">Segment Name</h4>
              <p className="text-lg font-medium">{data.name}</p>
            </div>
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${segmentInfo.color}20` }}
            >
              {segmentInfo.icon}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-accent/50">
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Count</h4>
              <p className="text-3xl font-bold">{data.value}</p>
            </div>
            {percentage !== null && (
              <div className="p-4 rounded-lg bg-accent/50">
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Percentage</h4>
                <p className="text-3xl font-bold">{percentage}%</p>
              </div>
            )}
          </div>

          <div className="p-4 rounded-lg border">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <span>📝</span> Description
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{segmentInfo.description}</p>
          </div>

          <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <span>💡</span> Recommendation
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{segmentInfo.recommendation}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// --------- Emotion Analysis ---------
function EmotionAnalysis({ reviews }: { reviews: Review[] }) {
  const emotions = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of reviews) {
      if (r.aiPrimaryEmotion) {
        map.set(r.aiPrimaryEmotion, (map.get(r.aiPrimaryEmotion) ?? 0) + 1);
      }
    }
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [reviews]);

  const max = emotions[0]?.count ?? 1;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          <CardTitle>Primary Emotions</CardTitle>
        </div>
        <CardDescription>Dominant emotions detected by AI analysis — sized by frequency.</CardDescription>
      </CardHeader>
      <CardContent>
        {emotions.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No emotion data available yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {emotions.map((f) => {
              const ratio = f.count / max;
              const size = 0.85 + ratio * 0.6;
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

// --------- All Reviews Table ---------
function AllReviewsTable({ reviews, onReviewClick }: { reviews: Review[]; onReviewClick: (review: Review) => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSentiment, setFilterSentiment] = useState<string>("all");

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchesSearch = r.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           String(r.productId).toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterSentiment === "all" || r.sentiment === filterSentiment;
      return matchesSearch && matchesFilter;
    });
  }, [reviews, searchTerm, filterSentiment]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle>All User Reviews</CardTitle>
          </div>
          <Badge variant="outline">{filteredReviews.length} reviews</Badge>
        </div>
        <CardDescription>Complete list of all customer reviews with AI analysis results.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by content or product ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <select
              value={filterSentiment}
              onChange={(e) => setFilterSentiment(e.target.value)}
              className="px-4 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Sentiments</option>
              <option value="Positive">Positive</option>
              <option value="Negative">Negative</option>
              <option value="Neutral">Neutral</option>
            </select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-25">Product ID</TableHead>
                  <TableHead>Review Content</TableHead>
                  <TableHead className="w-20">Rating</TableHead>
                  <TableHead className="w-25">Sentiment</TableHead>
                  <TableHead className="w-25">AI Sentiment</TableHead>
                  <TableHead className="w-25">Priority</TableHead>
                  <TableHead className="w-20">Fake</TableHead>
                  <TableHead className="w-25">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReviews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No reviews found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReviews.map((r) => (
                    <TableRow
                      key={r.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onReviewClick(r)}
                    >
                      <TableCell className="font-medium">{r.productId}</TableCell>
                      <TableCell className="max-w-75 truncate text-sm text-muted-foreground" title={r.content}>
                        {r.content}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-sm">
                          <Star className="h-3.5 w-3.5 fill-current text-warning" />
                          {r.rating}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={r.sentiment === "Positive" ? "default" : r.sentiment === "Negative" ? "destructive" : "secondary"}
                        >
                          {r.sentiment}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={r.aiSentiment === "Positive" ? "default" : r.aiSentiment === "Negative" ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          {r.aiSentiment}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={PRIORITY_VARIANT[r.priority]}>{r.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        {r.isFake ? (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" /> Yes
                          </Badge>
                        ) : (
                          <Badge variant="outline">No</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
