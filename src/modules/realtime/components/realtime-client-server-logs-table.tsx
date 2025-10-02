import React, { useState, useEffect, useRef } from "react";
import { useWsStore } from "../hooks/useWs";
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Copy,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  MessageCircle,
  Search,
  Filter,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

const RealtimeClientServerLogsTable = () => {
  const { messages, clearMessages } = useWsStore();
  const [selectedMessageIndex, setSelectedMessageIndex] = useState<number>(-1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSent, setShowSent] = useState(true);
  const [showReceived, setShowReceived] = useState(true);
  const tableRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Filter messages based on search and type filters
  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      searchQuery === "" ||
      JSON.stringify(message.data)
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (message.raw &&
        message.raw.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType =
      (message.type === "sent" && showSent) ||
      (message.type === "received" && showReceived);

    return matchesSearch && matchesType;
  });

  const scrollToBottom = () => {
    if (tableRef.current) {
      tableRef.current.scrollTop = tableRef.current.scrollHeight;
    }
  };

  const scrollToRow = (index: number) => {
    const row = rowRefs.current[index];
    if (row && tableRef.current) {
      const containerRect = tableRef.current.getBoundingClientRect();
      const rowRect = row.getBoundingClientRect();

      if (
        rowRect.top < containerRect.top ||
        rowRect.bottom > containerRect.bottom
      ) {
        row.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const handleNavigateUp = () => {
    if (messages.length === 0) return;

    const newIndex =
      selectedMessageIndex === -1
        ? messages.length - 1
        : Math.max(0, selectedMessageIndex - 1);

    setSelectedMessageIndex(newIndex);
    scrollToRow(newIndex);
  };

  const handleNavigateDown = () => {
    if (messages.length === 0) return;

    const newIndex =
      selectedMessageIndex === -1
        ? 0
        : selectedMessageIndex + 1 < messages.length
        ? selectedMessageIndex + 1
        : -1;

    setSelectedMessageIndex(newIndex);

    if (newIndex === -1) {
      scrollToBottom();
    } else {
      scrollToRow(newIndex);
    }
  };

  const handleRowClick = (index: number) => {
    setSelectedMessageIndex(selectedMessageIndex === index ? -1 : index);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log("Copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    }).format(timestamp);
  };

  const formatMessageData = (data: any) => {
    if (typeof data === "string") {
      try {
        return JSON.stringify(JSON.parse(data), null, 2);
      } catch {
        return data;
      }
    }
    return JSON.stringify(data, null, 2);
  };

  const getMessageTypeIcon = (type: "sent" | "received") => {
    return type === "sent" ? (
      <ArrowUpRight size={16} className="text-blue-400" />
    ) : (
      <ArrowDownLeft size={16} className="text-green-400" />
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <MessageCircle className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Message Logs</h3>
              <p className="text-xs text-muted-foreground">
                {filteredMessages.length} of {messages.length} message
                {messages.length !== 1 ? "s" : ""} • Real-time updates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <Filter className="w-3 h-3 mr-1" />
                  Filter
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem
                  checked={showSent}
                  onCheckedChange={setShowSent}
                >
                  <ArrowUpRight className="w-4 h-4 mr-2 text-blue-500" />
                  Sent Messages
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={showReceived}
                  onCheckedChange={setShowReceived}
                >
                  <ArrowDownLeft className="w-4 h-4 mr-2 text-emerald-500" />
                  Received Messages
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleNavigateUp}
              disabled={filteredMessages.length === 0}
              className="h-8 w-8 p-0"
              title="Previous message"
            >
              <ChevronUp size={16} />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleNavigateDown}
              disabled={filteredMessages.length === 0}
              className="h-8 w-8 p-0"
              title="Next message"
            >
              <ChevronDown size={16} />
            </Button>

            <div className="w-px h-6 bg-border mx-1" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  title="More actions"
                >
                  <MoreHorizontal size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={clearMessages}
                  disabled={messages.length === 0}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear all messages
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setSelectedMessageIndex(-1)}
                  disabled={selectedMessageIndex === -1}
                >
                  Clear selection
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
      </div>

      <div ref={tableRef} className="flex-1 overflow-auto">
        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <MessageCircle className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-sm text-center">
              {messages.length === 0
                ? "No messages yet"
                : "No messages match your search"}
              <br />
              <span className="text-xs">
                {messages.length === 0
                  ? "Connect to a WebSocket to see message logs"
                  : "Try adjusting your search terms or message type filters"}
              </span>
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {filteredMessages.map((message, index) => {
              const originalIndex = messages.findIndex((m) => m === message);
              return (
                <div
                  key={message.id}
                  ref={(el) => {
                    rowRefs.current[index] = el;
                  }}
                  className={cn(
                    "group border rounded-lg p-4 cursor-pointer transition-all duration-200",
                    "hover:shadow-sm hover:border-border/80",
                    selectedMessageIndex === originalIndex
                      ? "border-primary/50 bg-primary/5 shadow-sm"
                      : "border-border bg-card hover:bg-muted/30",
                    message.type === "sent"
                      ? "border-l-4 border-l-blue-500"
                      : "border-l-4 border-l-emerald-500"
                  )}
                  onClick={() => handleRowClick(originalIndex)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getMessageTypeIcon(message.type)}
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-sm font-medium capitalize",
                            message.type === "sent"
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-emerald-600 dark:text-emerald-400"
                          )}
                        >
                          {message.type}
                        </span>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          #{originalIndex + 1}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(message.timestamp)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(
                            message.raw || formatMessageData(message.data)
                          );
                        }}
                        className="h-6 w-6 p-0 text-zinc-400 hover:text-white"
                        title="Copy message"
                      >
                        <Copy size={12} />
                      </Button>
                    </div>
                  </div>

                  <div className="text-xs text-zinc-300">
                    <div className="font-mono bg-zinc-800 rounded p-2 overflow-x-auto">
                      {selectedMessageIndex === originalIndex ? (
                        <pre className="whitespace-pre-wrap break-words">
                          {formatMessageData(message.data)}
                        </pre>
                      ) : (
                        <div className="truncate text-muted-foreground">
                          {typeof message.data === "string"
                            ? message.data
                            : JSON.stringify(message.data)}
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedMessageIndex === originalIndex &&
                    message.raw &&
                    message.raw !== formatMessageData(message.data) && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <div className="text-xs text-muted-foreground mb-2 font-medium">
                          Raw Message:
                        </div>
                        <div
                          className={cn(
                            "font-mono text-xs rounded-lg p-3 overflow-x-auto",
                            "bg-muted/30 border border-border/30"
                          )}
                        >
                          <pre className="whitespace-pre-wrap break-words text-muted-foreground">
                            {message.raw}
                          </pre>
                        </div>
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedMessageIndex >= 0 && (
        <div className="px-6 py-3 border-t border-border bg-muted/30">
          <div className="text-xs text-muted-foreground flex items-center justify-between">
            <span>
              Message {selectedMessageIndex + 1} of {filteredMessages.length}{" "}
              selected
            </span>
            <div className="flex items-center gap-4 text-xs">
              {selectedMessageIndex > 0 && (
                <span className="flex items-center gap-1">
                  <ChevronUp className="w-3 h-3" />
                  Previous
                </span>
              )}
              {selectedMessageIndex < filteredMessages.length - 1 && (
                <span className="flex items-center gap-1">
                  <ChevronDown className="w-3 h-3" />
                  Next
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealtimeClientServerLogsTable;
