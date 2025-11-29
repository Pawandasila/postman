"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Loader2,
  Activity,
  ArrowLeft,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, formatDistanceToNow } from "date-fns";
import AdminBarChart from "@/app/admin/_components/admin-bar-chart";
import AdminLineChart from "@/app/admin/_components/admin-line-chart";
import Link from "next/link";
import { StatsCard } from "@/app/admin/_components/stats-card";

interface ApiCallStats {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  avgDuration: number;
  topUsers: Array<{
    user: {
      id: string;
      name: string;
      email: string;
      image: string | null;
    };
    _count: number;
    avgDuration: number;
  }>;
  recentCalls: Array<{
    id: string;
    statusCode: number | null;
    duration: number | null;
    createdAt: string;
    request: {
      name: string;
      method: string;
      url: string;
    };
  }>;
}

export default function ApiCallsPage() {
  const [stats, setStats] = useState<ApiCallStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/api-calls");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch API call stats");
      }

      setStats(data.stats);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="p-6 max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) return null;

  const topUsersData = stats.topUsers.map((u) => ({
    name: u.user.name || u.user.email,
    value: u._count,
  }));

  const callsByDateMap: Record<string, { date: string; count: number }> = {};
  stats.recentCalls.forEach((c) => {
    const day = format(new Date(c.createdAt), "yyyy-MM-dd");
    if (!callsByDateMap[day]) callsByDateMap[day] = { date: day, count: 0 };
    callsByDateMap[day].count += 1;
  });
  const callsByDate = Object.values(callsByDateMap)
    .sort((a, b) => (a.date > b.date ? 1 : -1))
    .map((d) => ({ time: format(new Date(d.date), "MMM dd"), count: d.count }));

  const successRate =
    stats.totalCalls > 0
      ? ((stats.successfulCalls / stats.totalCalls) * 100).toFixed(1)
      : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                API Call Analytics
              </h1>
              <p className="text-muted-foreground">
                Monitor API usage and performance metrics
              </p>
            </div>
            <Badge variant="outline" className="px-3 py-1">
              <Activity className="w-3 h-3 mr-1" />
              {stats.totalCalls} Total Calls
            </Badge>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <StatsCard
            title="Total API Calls"
            value={stats.totalCalls}
            icon={Activity}
            description="All time requests"
          />
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Success Rate
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{successRate}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.successfulCalls} successful
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Failed Calls
              </CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.failedCalls}</div>
              <p className="text-xs text-muted-foreground">Error responses</p>
            </CardContent>
          </Card>
          <StatsCard
            title="Avg Duration"
            value={`${stats.avgDuration}ms`}
            icon={Clock}
            description="Response time"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top Users by API Calls</CardTitle>
              <CardDescription>Most active API users (visual)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-60">
                <AdminBarChart data={topUsersData} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requests Over Time</CardTitle>
              <CardDescription>Call volume by day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-60">
                <AdminLineChart data={callsByDate} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Top Users by API Calls</CardTitle>
              <CardDescription>Most active API users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topUsers.map((userStat, index) => (
                  <div
                    key={userStat.user.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <Badge
                        variant="outline"
                        className="h-6 w-6 flex items-center justify-center p-0"
                      >
                        {index + 1}
                      </Badge>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={userStat.user.image || undefined} />
                        <AvatarFallback>
                          {userStat.user.name?.[0]?.toUpperCase() ||
                            userStat.user.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {userStat.user.name || "Anonymous"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {userStat.user.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{userStat._count}</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round(userStat.avgDuration)}ms avg
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent API Calls</CardTitle>
              <CardDescription>Latest request executions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentCalls.map((call) => (
                  <div
                    key={call.id}
                    className="flex items-start justify-between space-x-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {call.request.method}
                        </Badge>
                        <p className="text-sm font-medium truncate">
                          {call.request.name}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {call.request.url}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(call.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <Badge
                        variant={
                          call.statusCode &&
                          call.statusCode >= 200 &&
                          call.statusCode < 300
                            ? "default"
                            : "destructive"
                        }
                        className="text-xs"
                      >
                        {call.statusCode || "N/A"}
                      </Badge>
                      {call.duration && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {call.duration}ms
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All API Calls</CardTitle>
            <CardDescription>Complete request history</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Method</TableHead>
                  <TableHead>Request Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentCalls.map((call) => (
                  <TableRow key={call.id}>
                    <TableCell>
                      <Badge variant="outline">{call.request.method}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{call.request.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-md">
                          {call.request.url}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          call.statusCode &&
                          call.statusCode >= 200 &&
                          call.statusCode < 300
                            ? "default"
                            : call.statusCode
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {call.statusCode || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {call.duration ? `${call.duration}ms` : "N/A"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(call.createdAt), "MMM dd, HH:mm:ss")}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
