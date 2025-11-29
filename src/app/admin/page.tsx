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
  Users,
  FolderOpen,
  FileText,
  Activity,
  TrendingUp,
  Database,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "./_components/stats-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface AdminStats {
  totalUsers: number;
  totalWorkspaces: number;
  totalCollections: number;
  totalRequests: number;
  totalRequestHistory: number;
  authMethods: Array<{ providerId: string; _count: number }>;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    createdAt: string;
    image: string | null;
    role: string;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch stats");
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

  const CHART_COLORS = {
    chart1: "#FF8C42",
    chart2: "#4ECDC4",
    chart3: "#6366F1",
    chart4: "#FCD34D",
    chart5: "#FB923C",
  };

  const authMethodsChartData = stats.authMethods.map((method) => ({
    name: method.providerId,
    users: method._count,
    percentage: ((method._count / stats.totalUsers) * 100).toFixed(1),
  }));

  const overviewData = [
    { name: "Users", value: stats.totalUsers, color: CHART_COLORS.chart1 },
    {
      name: "Workspaces",
      value: stats.totalWorkspaces,
      color: CHART_COLORS.chart2,
    },
    {
      name: "Collections",
      value: stats.totalCollections,
      color: CHART_COLORS.chart3,
    },
    {
      name: "Requests",
      value: stats.totalRequests,
      color: CHART_COLORS.chart4,
    },
  ];

  return (
    <div className="min-h-screen bg-background pl-2">
      <div className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/30">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-chart-2 to-chart-3 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Monitor and manage PostBoy platform analytics
                </p>
              </div>
            </div>
            <Badge className="px-3 py-1 bg-primary/10 text-primary border-primary/20">
              <Shield className="w-3 h-3 mr-1" />
              Admin Access
            </Badge>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-chart-1 bg-gradient-to-br from-chart-1/5 to-transparent hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
              <Users className="h-5 w-5 text-chart-1" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Registered accounts
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-chart-2 bg-gradient-to-br from-chart-2/5 to-transparent hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Workspaces
              </CardTitle>
              <FolderOpen className="h-5 w-5 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalWorkspaces}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active workspaces
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-chart-3 bg-gradient-to-br from-chart-3/5 to-transparent hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Collections
              </CardTitle>
              <Database className="h-5 w-5 text-chart-3" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalCollections}</div>
              <p className="text-xs text-muted-foreground mt-1">
                API collections
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-chart-4 bg-gradient-to-br from-chart-4/5 to-transparent hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Requests
              </CardTitle>
              <FileText className="h-5 w-5 text-chart-4" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalRequests}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Saved requests
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Platform Overview Bar Chart */}
          <Card className="col-span-full bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5 text-primary" />
                Platform Overview
              </CardTitle>
              <CardDescription>Key metrics across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={overviewData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    stroke="#9ca3af"
                  />
                  <YAxis
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    stroke="#9ca3af"
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    labelStyle={{ color: "#111827", fontWeight: "600" }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {overviewData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Auth Methods Pie Chart */}
          <Card className="bg-gradient-to-br from-chart-1/5 via-card to-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-chart-1" />
                Authentication Methods
              </CardTitle>
              <CardDescription>User sign-in distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={authMethodsChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="users"
                  >
                    {authMethodsChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={Object.values(CHART_COLORS)[index % 5]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    labelStyle={{ color: "#111827", fontWeight: "600" }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: "20px" }}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Secondary Stats */}
          <Card className="bg-gradient-to-br from-chart-2/5 via-card to-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-chart-2" />
                Platform Activity
              </CardTitle>
              <CardDescription>Request and usage statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-chart-5/10 border border-chart-5/20">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    API Calls
                  </p>
                  <p className="text-2xl font-bold">
                    {stats.totalRequestHistory}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-chart-5" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-chart-2/10 border border-chart-2/20">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Avg Workspaces/User
                  </p>
                  <p className="text-2xl font-bold">
                    {stats.totalUsers > 0
                      ? Math.round(stats.totalWorkspaces / stats.totalUsers)
                      : 0}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-chart-2" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-chart-3/10 border border-chart-3/20">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Avg Requests/Collection
                  </p>
                  <p className="text-2xl font-bold">
                    {stats.totalCollections > 0
                      ? Math.round(stats.totalRequests / stats.totalCollections)
                      : 0}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-chart-3" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Users */}
        <Card className="bg-gradient-to-br from-chart-4/5 via-card to-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-chart-4" />
              Recent Users
            </CardTitle>
            <CardDescription>Latest registered accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentUsers.slice(0, 5).map((user, index) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/50 hover:border-primary/30 hover:bg-card/80 transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10 ring-2 ring-chart-4/20">
                        <AvatarImage src={user.image || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-chart-4/20 to-chart-5/20 text-chart-4 font-semibold">
                          {user.name?.[0]?.toUpperCase() ||
                            user.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-chart-2 border-2 border-card" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {user.name || "Anonymous"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge
                      variant={user.role === "ADMIN" ? "default" : "secondary"}
                      className={
                        user.role === "ADMIN"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary"
                      }
                    >
                      {user.role}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(user.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-br from-primary/5 via-card to-chart-2/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>Manage platform resources</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Link href="/admin/users">
              <Button className="bg-gradient-to-r from-chart-1 to-chart-1/80 hover:from-chart-1/90 hover:to-chart-1/70 text-white shadow-lg shadow-chart-1/25">
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Button>
            </Link>
            <Link href="/admin/api_calls">
              <Button className="bg-gradient-to-r from-chart-2 to-chart-2/80 hover:from-chart-2/90 hover:to-chart-2/70 text-white shadow-lg shadow-chart-2/25">
                <Activity className="w-4 h-4 mr-2" />
                View API Calls
              </Button>
            </Link>
            <Link href="/admin/analytics">
              <Button className="bg-gradient-to-r from-chart-3 to-chart-3/80 hover:from-chart-3/90 hover:to-chart-3/70 text-white shadow-lg shadow-chart-3/25">
                <BarChart className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </Link>
            <Link href="/">
              <Button
                variant="outline"
                className="border-primary/30 hover:bg-primary/10 hover:text-primary"
              >
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Back to App
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
