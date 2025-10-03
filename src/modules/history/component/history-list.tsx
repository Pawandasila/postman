"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, 
  Trash2, 
  ChevronRight,
  Calendar,
  History as HistoryIcon,
  Zap,
  RefreshCw
} from "lucide-react";
import { useRequestHistory, useClearHistory } from "@/hooks/use-request-history";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import HistoryDetailModal from "./history-detail-modal";

interface HistoryListProps {
  workspaceId?: string;
}

const HistoryList = ({ workspaceId }: HistoryListProps) => {
  const { data, isLoading, refetch } = useRequestHistory(workspaceId);
  const { mutate: clearHistory, isPending: isClearing } = useClearHistory();
  const [selectedHistory, setSelectedHistory] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClearHistory = () => {
    clearHistory(workspaceId, {
      onSuccess: () => {
        toast.success("History cleared successfully");
      },
      onError: () => {
        toast.error("Failed to clear history");
      },
    });
  };

  const handleHistoryClick = (entry: any) => {
    setSelectedHistory(entry);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-sm text-muted-foreground">Loading history...</p>
      </div>
    );
  }

  const history = data?.history;
  const stats = data?.stats;
  const hasHistory = (history?.today?.length || 0) + (history?.older?.length || 0) > 0;

  if (!hasHistory) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
          <HistoryIcon className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg mb-2">No History Yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Your API request history will appear here
        </p>
        <p className="text-xs text-muted-foreground">
          History is automatically cleared after 24 hours
        </p>
      </div>
    );
  }

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: "bg-green-500/10 text-green-600 border-green-500/30 dark:text-green-400",
      POST: "bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400",
      PUT: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30 dark:text-yellow-400",
      DELETE: "bg-red-500/10 text-red-600 border-red-500/30 dark:text-red-400",
      PATCH: "bg-orange-500/10 text-orange-600 border-orange-500/30 dark:text-orange-400",
    };
    return colors[method] || "bg-gray-500/10 text-gray-600 border-gray-500/30";
  };

  const getStatusColor = (status?: number) => {
    if (!status) return "text-muted-foreground";
    if (status >= 200 && status < 300) return "text-green-600 dark:text-green-400";
    if (status >= 300 && status < 400) return "text-blue-600 dark:text-blue-400";
    if (status >= 400 && status < 500) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header with Stats */}
        <div className="border-b bg-gradient-to-br from-card/50 to-card">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-1 bg-primary rounded-full"></div>
                <h3 className="font-semibold text-sm">Request History</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => refetch()}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-muted/50 rounded-lg p-3 border border-border">
                <div className="text-2xl font-bold text-primary">
                  {stats?.todayCount || 0}
                </div>
                <div className="text-xs text-muted-foreground">Today</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 border border-border">
                <div className="text-2xl font-bold text-primary">
                  {stats?.totalCount || 0}
                </div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 border border-border">
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-yellow-500" />
                  <div className="text-lg font-bold text-primary">
                    {Math.round(stats?.avgResponseTime || 0)}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">Avg (ms)</div>
              </div>
            </div>

            {stats?.totalCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleClearHistory}
                disabled={isClearing}
              >
                <Trash2 className="h-3 w-3 mr-2" />
                Clear History
              </Button>
            )}
          </div>
        </div>

        {/* History List */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* Today's History */}
            {history?.today?.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>TODAY</span>
                </div>
                <div className="space-y-2">
                  {history.today.map((entry: any) => (
                    <HistoryCard
                      key={entry.id}
                      entry={entry}
                      getMethodColor={getMethodColor}
                      getStatusColor={getStatusColor}
                      onClick={() => handleHistoryClick(entry)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Older History */}
            {history?.older?.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>EARLIER</span>
                </div>
                <div className="space-y-2">
                  {history.older.map((entry: any) => (
                    <HistoryCard
                      key={entry.id}
                      entry={entry}
                      getMethodColor={getMethodColor}
                      getStatusColor={getStatusColor}
                      onClick={() => handleHistoryClick(entry)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Detail Modal */}
      <HistoryDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        entry={selectedHistory}
      />
    </>
  );
};

interface HistoryCardProps {
  entry: any;
  getMethodColor: (method: string) => string;
  getStatusColor: (status?: number) => string;
  onClick: () => void;
}

const HistoryCard = ({ entry, getMethodColor, getStatusColor, onClick }: HistoryCardProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full group relative bg-card hover:bg-accent/50 border border-border rounded-lg p-3 transition-all hover:shadow-md hover:border-primary/30 text-left"
    >
      {/* Method Badge */}
      <div className="flex items-start gap-3">
        <Badge
          variant="outline"
          className={cn(
            "text-xs font-bold font-mono px-2 py-0.5 border",
            getMethodColor(entry.method)
          )}
        >
          {entry.method}
        </Badge>

        <div className="flex-1 min-w-0 space-y-2">
          {/* Request Name */}
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
              {entry.requestName}
            </h4>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform shrink-0" />
          </div>

          {/* URL */}
          <p className="text-xs text-muted-foreground truncate font-mono">
            {entry.url}
          </p>

          {/* Footer Info */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              {/* Status */}
              {entry.statusCode && (
                <span className={cn("font-semibold", getStatusColor(entry.statusCode))}>
                  {entry.statusCode}
                </span>
              )}

              {/* Response Time */}
              {entry.responseTime && (
                <span className="text-muted-foreground flex items-center gap-1">
                  <Zap className="h-3 w-3 text-yellow-500" />
                  {entry.responseTime}ms
                </span>
              )}
            </div>

            {/* Time Ago */}
            <span className="text-muted-foreground">
              {formatDistanceToNow(new Date(entry.executedAt), { addSuffix: true })}
            </span>
          </div>

          {/* Collection Badge */}
          {entry.collectionName && (
            <Badge variant="secondary" className="text-xs">
              {entry.collectionName}
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
};

export default HistoryList;
