"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Clock, 
  User, 
  Folder, 
  Zap, 
  Activity,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileJson,
  Code,
  Globe
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HistoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: any;
}

const HistoryDetailModal = ({ isOpen, onClose, entry }: HistoryDetailModalProps) => {
  if (!entry) return null;

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

  const getStatusIcon = (status?: number) => {
    if (!status) return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    if (status >= 200 && status < 300) return <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />;
    if (status >= 400 && status < 500) return <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />;
    return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
  };

  const getStatusColor = (status?: number) => {
    if (!status) return "text-muted-foreground";
    if (status >= 200 && status < 300) return "text-green-600 dark:text-green-400";
    if (status >= 300 && status < 400) return "text-blue-600 dark:text-blue-400";
    if (status >= 400 && status < 500) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="space-y-3">
            {/* Method and Request Name */}
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className={cn(
                  "text-xs font-bold font-mono px-2 py-1 border",
                  getMethodColor(entry.method)
                )}
              >
                {entry.method}
              </Badge>
              <DialogTitle className="text-xl font-semibold">
                {entry.requestName}
              </DialogTitle>
            </div>

            {/* URL */}
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
              <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
              <code className="text-sm font-mono text-muted-foreground break-all">
                {entry.url}
              </code>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-180px)]">
          <div className="px-6 py-4 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-3">
              <StatCard
                icon={getStatusIcon(entry.statusCode)}
                label="Status"
                value={entry.statusCode ? `${entry.statusCode} ${entry.statusText || ""}` : "N/A"}
                valueColor={getStatusColor(entry.statusCode)}
              />
              <StatCard
                icon={<Zap className="h-5 w-5 text-yellow-500" />}
                label="Response Time"
                value={entry.responseTime ? `${entry.responseTime}ms` : "N/A"}
              />
              <StatCard
                icon={<Activity className="h-5 w-5 text-blue-500" />}
                label="Size"
                value={formatBytes(entry.responseSize)}
              />
              <StatCard
                icon={<Clock className="h-5 w-5 text-purple-500" />}
                label="Executed"
                value={format(new Date(entry.executedAt), "HH:mm:ss")}
              />
            </div>

            <Separator />

            {/* Context Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <FileJson className="h-4 w-4 text-primary" />
                Request Context
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                {/* Workspace */}
                <InfoRow
                  icon={<User className="h-4 w-4 text-muted-foreground" />}
                  label="Workspace"
                  value={entry.workspaceName}
                />

                {/* Collection */}
                {entry.collectionName && (
                  <InfoRow
                    icon={<Folder className="h-4 w-4 text-muted-foreground" />}
                    label="Collection"
                    value={entry.collectionName}
                  />
                )}

                {/* Executed At */}
                <InfoRow
                  icon={<Clock className="h-4 w-4 text-muted-foreground" />}
                  label="Executed At"
                  value={format(new Date(entry.executedAt), "PPpp")}
                />

                {/* Expires At */}
                <InfoRow
                  icon={<AlertCircle className="h-4 w-4 text-muted-foreground" />}
                  label="Expires At"
                  value={format(new Date(entry.expiresAt), "PPpp")}
                  subtext="(Auto-deleted after 24 hours)"
                />
              </div>
            </div>

            <Separator />

            {/* Request/Response Details */}
            <Tabs defaultValue="headers" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="headers">Headers</TabsTrigger>
                <TabsTrigger value="params">Params</TabsTrigger>
                <TabsTrigger value="body">Body</TabsTrigger>
                <TabsTrigger value="response">Response</TabsTrigger>
              </TabsList>

              <TabsContent value="headers" className="mt-4">
                <JsonDisplay data={entry.headers} emptyMessage="No headers recorded" />
              </TabsContent>

              <TabsContent value="params" className="mt-4">
                <JsonDisplay data={entry.params} emptyMessage="No parameters recorded" />
              </TabsContent>

              <TabsContent value="body" className="mt-4">
                <JsonDisplay data={entry.body} emptyMessage="No request body recorded" />
              </TabsContent>

              <TabsContent value="response" className="mt-4">
                <JsonDisplay data={entry.response} emptyMessage="No response data recorded" />
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
}

const StatCard = ({ icon, label, value, valueColor }: StatCardProps) => (
  <div className="bg-muted/30 rounded-lg p-4 border border-border space-y-2">
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
    </div>
    <div className={cn("text-sm font-semibold truncate", valueColor)}>
      {value}
    </div>
  </div>
);

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
}

const InfoRow = ({ icon, label, value, subtext }: InfoRowProps) => (
  <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border">
    <div className="mt-0.5">{icon}</div>
    <div className="flex-1 min-w-0">
      <div className="text-xs text-muted-foreground font-medium">{label}</div>
      <div className="text-sm font-medium mt-1 break-all">{value}</div>
      {subtext && <div className="text-xs text-muted-foreground mt-1">{subtext}</div>}
    </div>
  </div>
);

interface JsonDisplayProps {
  data: any;
  emptyMessage: string;
}

const JsonDisplay = ({ data, emptyMessage }: JsonDisplayProps) => {
  if (!data || (typeof data === "object" && Object.keys(data).length === 0)) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="bg-muted/30 rounded-lg p-4 border">
      <pre className="text-xs font-mono overflow-x-auto">
        <code>{JSON.stringify(data, null, 2)}</code>
      </pre>
    </div>
  );
};

export default HistoryDetailModal;
