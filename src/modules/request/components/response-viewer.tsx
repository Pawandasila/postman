import React, { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import MonacoEditor from "@monaco-editor/react";
import {
  Clock,
  HardDrive,
  Copy,
  Download,
  Search,
  FileJson,
  Settings,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Network,
} from "lucide-react";

type HeadersMap = Record<string, string>;

interface RequestRun {
  id: string;
  requestId?: string;
  status?: number;
  statusText?: string;
  headers?: HeadersMap;
  body?: string | object | null;
  durationMs?: number;
  createdAt?: string;
}

interface Result {
  status?: number;
  statusText?: string;
  duration?: number;
  size?: number;
}

export interface ResponseData {
  success: boolean;
  requestRun: RequestRun;
  result?: Result;
}

interface Props {
  responseData: ResponseData;
}

const ResponseViewer = ({ responseData }: Props) => {
  const [activeTab, setActiveTab] = useState("body");
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusColor = (status?: number): string => {
    const s = typeof status === "number" ? status : 0;
    if (s >= 200 && s < 300) return "text-green-500";
    if (s >= 300 && s < 400) return "text-yellow-500";
    if (s >= 400 && s < 500) return "text-orange-500";
    if (s >= 500) return "text-red-500";
    return "text-muted-foreground";
  };

  const getStatusBgColor = (status?: number): string => {
    const s = typeof status === "number" ? status : 0;
    if (s >= 200 && s < 300) return "bg-green-500/10 border-green-500/20";
    if (s >= 300 && s < 400) return "bg-yellow-500/10 border-yellow-500/20";
    if (s >= 400 && s < 500) return "bg-orange-500/10 border-orange-500/20";
    if (s >= 500) return "bg-red-500/10 border-red-500/20";
    return "bg-muted/10 border-border";
  };

  const getStatusIcon = (status?: number) => {
    const s = typeof status === "number" ? status : 0;
    if (s >= 200 && s < 300) return <CheckCircle2 className="w-4 h-4" />;
    if (s >= 300 && s < 400) return <AlertCircle className="w-4 h-4" />;
    if (s >= 400) return <XCircle className="w-4 h-4" />;
    return <Network className="w-4 h-4" />;
  };

  const formatBytes = (bytes?: number): string => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const copyToClipboard = async (text: string, label: string = "Content") => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const downloadResponse = () => {
    try {
      const blob = new Blob([formattedJsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `response-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Response downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download response");
    }
  };

  // Memoize parsed response data
  const { responseBody, formattedJsonString, rawBody, isJson } = useMemo(() => {
    let body: any = {};
    let formatted = "";
    let isJsonResponse = false;
    const raw = responseData?.requestRun?.body;

    try {
      if (typeof raw === "string") {
        body = raw.length ? JSON.parse(raw) : raw;
        isJsonResponse = true;
      } else {
        body = raw ?? {};
      }
      formatted = JSON.stringify(body, null, 2);
    } catch (e) {
      body = raw ?? {};
      formatted = typeof body === "string" ? body : JSON.stringify(body, null, 2);
    }

    return {
      responseBody: body,
      formattedJsonString: formatted,
      rawBody: raw,
      isJson: isJsonResponse,
    };
  }, [responseData]);

  const status: number | undefined =
    responseData.result?.status ?? responseData.requestRun?.status;
  const statusText: string | undefined =
    responseData.result?.statusText ?? responseData.requestRun?.statusText;
  const duration: number | undefined =
    responseData.result?.duration ?? responseData.requestRun?.durationMs;
  const size: number | undefined = responseData.result?.size;

  // Filter headers based on search
  const filteredHeaders = useMemo(() => {
    const headers = responseData.requestRun.headers ?? {};
    console.log('Headers in response viewer:', headers);
    console.log('Headers type:', typeof headers);
    
    if (!searchTerm) return Object.entries(headers);
    
    return Object.entries(headers).filter(
      ([key, value]) =>
        key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        value.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [responseData.requestRun.headers, searchTerm]);

  return (
    <div className="w-full min-h-[600px] flex flex-col bg-background rounded-lg border border-border shadow-lg overflow-hidden">
      {/* Status Bar - Compact and Modern */}
      <div className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getStatusBgColor(status)} ${getStatusColor(status)}`}>
                {getStatusIcon(status)}
                <span className="font-semibold text-sm">
                  {status ?? "—"}
                </span>
                <span className="text-xs opacity-80">
                  {statusText ?? "No Response"}
                </span>
              </div>
            </div>

            {/* Metrics */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-medium">
                  {duration ? `${duration}ms` : "—"}
                </span>
              </div>
              
              <div className="h-4 w-px bg-border" />
              
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <HardDrive className="w-3.5 h-3.5" />
                <span className="font-medium">{formatBytes(size)}</span>
              </div>
              
              <div className="h-4 w-px bg-border" />
              
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <FileJson className="w-3.5 h-3.5" />
                <span className="font-medium capitalize">{isJson ? "JSON" : "Text"}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(formattedJsonString, "Response")}
              className="h-8 text-xs"
            >
              <Copy className="w-3.5 h-3.5 mr-1.5" />
              Copy
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={downloadResponse}
              className="h-8 text-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download
            </Button>
          </div>
        </div>
      </div>

      {/* Response Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <div className="border-b border-border bg-muted/30">
          <div className="flex items-center justify-between px-4">
            <TabsList className="bg-transparent h-11 p-0 gap-1">
              <TabsTrigger
                value="body"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-t-lg rounded-b-none px-4 h-10 text-sm font-medium"
              >
                <FileJson className="w-4 h-4 mr-2" />
                Body
              </TabsTrigger>
              <TabsTrigger
                value="headers"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-t-lg rounded-b-none px-4 h-10 text-sm font-medium"
              >
                <Settings className="w-4 h-4 mr-2" />
                Headers
                <Badge
                  variant="secondary"
                  className="ml-2 text-xs h-5 px-1.5 bg-primary/10 text-primary border-0"
                >
                  {Object.keys(responseData.requestRun.headers ?? {}).length}
                </Badge>
              </TabsTrigger>
            </TabsList>
            
            {activeTab === "headers" && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search headers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 w-64 pl-9 pr-3 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <TabsContent value="body" className="flex-1 m-0 overflow-hidden min-h-[450px]">
          <div className="h-full relative">
            <MonacoEditor
              height="450px"
              defaultLanguage={isJson ? "json" : "text"}
              theme="vs-light"
              value={formattedJsonString}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 13,
                wordWrap: "on",
                fontFamily: "var(--font-mono)",
                lineNumbers: "on",
                glyphMargin: false,
                folding: true,
                lineDecorationsWidth: 0,
                lineNumbersMinChars: 3,
                renderLineHighlight: "none",
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
                scrollbar: {
                  vertical: "auto",
                  horizontal: "auto",
                  verticalScrollbarSize: 10,
                  horizontalScrollbarSize: 10,
                  useShadows: false,
                },
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="headers" className="flex-1 m-0 overflow-hidden min-h-[450px]">
          <ScrollArea className="h-[450px]">
            <div className="p-4">
              {filteredHeaders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                  <Settings className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm">
                    {searchTerm ? "No headers match your search" : "No headers received"}
                  </p>
                </div>
              ) : (
                <div className="space-y-0">
                  {filteredHeaders.map(([key, value], index) => (
                    <div
                      key={`${key}-${index}`}
                      className="group flex items-start gap-4 py-3 px-3 hover:bg-muted/50 rounded-lg transition-colors border-b border-border last:border-b-0"
                    >
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-medium text-primary">
                            {key}
                          </span>
                          <Badge variant="outline" className="text-xs h-5 px-1.5">
                            {value.length} chars
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground/80 break-all font-mono">
                          {value}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                        onClick={() => copyToClipboard(`${key}: ${value}`, "Header")}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResponseViewer;