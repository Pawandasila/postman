import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlugZap, Plug, AlertCircle, Wifi, WifiOff } from "lucide-react";
import React, { useState, useCallback, useEffect } from "react";
import { useWsStore } from "../hooks/useWs";
import { cn } from "@/lib/utils";

const RealtimeConnectionBar = () => {
  const {
    status,
    isConnected,
    error,
    url: connectedUrl,
    reconnectAttempts,
    maxReconnectAttempts,
    connect,
    disconnect,
  } = useWsStore();

  const [url, setUrl] = useState(connectedUrl || "");

  // keep local input in sync with connectedUrl
  useEffect(() => {
    setUrl(connectedUrl || "");
  }, [connectedUrl]);

  const onConnect = useCallback(() => {
    if (!url.trim()) {
      alert("Please enter a WebSocket URL");
      return;
    }

    const trimmedUrl = url.trim();
    if (!trimmedUrl.startsWith('ws://') && !trimmedUrl.startsWith('wss://')) {
      alert("URL must start with ws:// or wss://");
      return;
    }

    if (isConnected) {
      disconnect();
    } else {
      connect(trimmedUrl, {
        onOpen: (event) => {
          console.log("Successfully connected to:", trimmedUrl);
        },
        onClose: (event) => {
          console.log("Disconnected from WebSocket:", {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean
          });
        },
        onError: (error) => {
          console.error("WebSocket connection failed:", {
            url: trimmedUrl,
            timestamp: new Date().toISOString(),
            error: error
          });
        },
        onMessage: (event) => {
          console.log("Received message:", event.data);
        },
        autoReconnect: true,
        reconnectDelay: 3000,
      });
    }
  }, [url, isConnected, connect, disconnect]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        onConnect();
      }
    },
    [onConnect]
  );

  const getConnectionColor = () => {
    switch (status) {
      case "connected":
        return "bg-emerald-500 hover:bg-emerald-600 text-emerald-50";
      case "connecting":
      case "reconnecting":
        return "bg-amber-500 hover:bg-amber-600 text-amber-50";
      case "error":
        return "bg-red-500 hover:bg-red-600 text-red-50";
      default:
        return "bg-primary hover:bg-primary/90 text-primary-foreground";
    }
  };

  const getConnectionIcon = () => {
    switch (status) {
      case "connected":
        return <Wifi size={18} />;
      case "connecting":
      case "reconnecting":
        return <PlugZap size={18} className="animate-pulse" />;
      case "error":
        return <WifiOff size={18} />;
      default:
        return <Plug size={18} />;
    }
  };

  const getButtonText = () => {
    switch (status) {
      case "connected":
        return "Disconnect";
      case "connecting":
        return "Connecting...";
      case "reconnecting":
        return `Reconnecting... (${reconnectAttempts}/${maxReconnectAttempts})`;
      case "error":
        return "Retry";
      default:
        return "Connect";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "reconnecting":
        return `reconnecting (${reconnectAttempts}/${maxReconnectAttempts})`;
      default:
        return status;
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-foreground mb-2">
            WebSocket URL
          </label>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="ws://localhost:8080 or wss://echo.websocket.org"
            className="bg-background border-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20"
            disabled={status === "connecting" || status === "reconnecting"}
          />
        </div>

        <div className="flex items-end gap-3">
          <div className="flex flex-col items-center justify-center px-4 py-2 rounded-lg bg-muted/50 min-w-[120px]">
            <div className="flex items-center gap-2 mb-1">
              <div
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  status === "connected"
                    ? "bg-emerald-500"
                    : status === "connecting" || status === "reconnecting"
                    ? "bg-amber-500 animate-pulse"
                    : status === "error"
                    ? "bg-red-500"
                    : "bg-muted-foreground"
                )}
              />
              <span className="text-xs font-medium text-foreground capitalize">
                {getStatusText()}
              </span>
            </div>

            {connectedUrl && (
              <div className="text-xs text-muted-foreground text-center max-w-[100px] truncate">
                {new URL(connectedUrl).host}
              </div>
            )}

            {status === "reconnecting" && (
              <div className="text-xs text-amber-600 dark:text-amber-400">
                Attempt {reconnectAttempts}/{maxReconnectAttempts}
              </div>
            )}
          </div>

          <Button
            type="button"
            onClick={onConnect}
            disabled={status === "connecting" || status === "reconnecting"}
            className={cn(
              "font-medium transition-all duration-200 shadow-sm",
              getConnectionColor()
            )}
            size="lg"
          >
            <span className="flex items-center gap-2">
              {getConnectionIcon()}
              {getButtonText()}
            </span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="mt-3 space-y-2">
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
            <AlertCircle size={16} className="text-destructive flex-shrink-0" />
            <span className="text-sm text-destructive">{error}</span>
          </div>
          
          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <div className="text-xs font-medium text-foreground mb-2">💡 Troubleshooting Tips:</div>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Make sure the WebSocket server is running and accessible</li>
              <li>• Check if the URL format is correct (ws:// or wss://)</li>
              <li>• For secure sites (https://), use wss:// instead of ws://</li>
              <li>• Verify the server accepts connections from your domain</li>
              <li>• Try a public WebSocket echo server: wss://echo.websocket.org</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealtimeConnectionBar;
