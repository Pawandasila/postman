import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Send,
  Copy,
  Trash2,
  RefreshCw,
  MessageSquare,
  FileText,
  Settings2,
  Download,
  Upload,
  ChevronDown,
} from "lucide-react";
import { useWsStore } from "../hooks/useWs";
import Editor from "@monaco-editor/react";
import { toast } from "sonner";
import RealtimeClientServerLogsTable from "./realtime-client-server-logs-table";
import { cn } from "@/lib/utils";
import type { editor } from "monaco-editor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const RealtimeMessageEditor = () => {
  const { send, status, isConnected, draftMessage, setDraftMessage, messages } =
    useWsStore();

  const [isSending, setIsSending] = useState(false);
  const [lastSent, setLastSent] = useState("");
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  // Message templates
  const messageTemplates = [
    {
      name: "Basic Message",
      content:
        '{\n  "type": "message",\n  "content": "Hello WebSocket!",\n  "timestamp": "' +
        new Date().toISOString() +
        '"\n}',
    },
    {
      name: "Authentication",
      content:
        '{\n  "type": "auth",\n  "token": "your-auth-token",\n  "userId": "user123"\n}',
    },
    {
      name: "Subscribe",
      content:
        '{\n  "type": "subscribe",\n  "channel": "notifications",\n  "filters": {\n    "userId": "user123"\n  }\n}',
    },
    {
      name: "Ping",
      content:
        '{\n  "type": "ping",\n  "timestamp": "' +
        new Date().toISOString() +
        '"\n}',
    },
  ];

  useEffect(() => {
    if (!draftMessage) {
      setDraftMessage(messageTemplates[0].content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEditorDidMount = useCallback(
    (editor: editor.IStandaloneCodeEditor, monaco: any) => {
      editorRef.current = editor;

      // Add Ctrl+Enter shortcut to send message
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
        handleSendMessage();
      });
    },
    []
  );

  const handleSendMessage = useCallback(async () => {
    if (!status || status !== "connected") {
      toast.error("WebSocket is not connected!");
      return;
    }

    if (!draftMessage || !draftMessage.trim()) {
      toast.error("Please enter a message!");
      return;
    }

    try {
      setIsSending(true);

      // Try to parse JSON to validate
      let messageToSend;
      try {
        messageToSend = JSON.parse(draftMessage);
      } catch (parseError) {
        // If not valid JSON, send as string
        messageToSend = draftMessage;
      }

      // Send the message
      const success = send(messageToSend);

      if (success) {
        setLastSent(draftMessage);
        toast.success("Message sent successfully!");
      } else {
        toast.error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error sending message");
    } finally {
      setIsSending(false);
    }
  }, [draftMessage, status, send]);

  const handleFormatJSON = useCallback(() => {
    try {
      const parsed = JSON.parse(draftMessage);
      const formatted = JSON.stringify(parsed, null, 2);
      setDraftMessage(formatted);
      if (editorRef.current) {
        editorRef.current.setValue(formatted);
      }
      toast.success("JSON formatted successfully!");
    } catch (error) {
      toast.error("Invalid JSON format");
    }
  }, [draftMessage, setDraftMessage]);

  const handleCopyMessage = useCallback(() => {
    navigator.clipboard
      .writeText(draftMessage)
      .then(() => {
        toast.success("Message copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy message:", err);
        toast.error("Failed to copy message");
      });
  }, [draftMessage]);

  const handleClearMessage = useCallback(() => {
    const emptyMessage = "{\n  \n}";
    setDraftMessage(emptyMessage);
    if (editorRef.current) {
      editorRef.current.setValue(emptyMessage);
      editorRef.current.focus();
    }
  }, [setDraftMessage]);

  const handleTemplateSelect = useCallback(
    (template: (typeof messageTemplates)[0]) => {
      setDraftMessage(template.content);
      if (editorRef.current) {
        editorRef.current.setValue(template.content);
      }
      toast.success(`Template "${template.name}" loaded!`);
    },
    [setDraftMessage]
  );

  const handleExportMessages = useCallback(() => {
    const dataStr = JSON.stringify(messages, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `websocket-messages-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Messages exported successfully!");
  }, [messages]);

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-6 min-h-0">
        <div className="flex flex-col bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                  <MessageSquare className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    Message Editor
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Compose and send WebSocket messages
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8">
                      <Settings2 className="w-3 h-3 mr-1" />
                      Templates
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {messageTemplates.map((template) => (
                      <DropdownMenuItem
                        key={template.name}
                        onClick={() => handleTemplateSelect(template)}
                      >
                        {template.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-full font-medium",
                    status === "connected"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  )}
                >
                  {status === "connected" ? "Connected" : "Disconnected"}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 relative">
              <Editor
                height="100%"
                language="json"
                theme="vs-dark"
                value={draftMessage}
                onChange={(value) => setDraftMessage(value || "")}
                onMount={handleEditorDidMount}
                options={{
                  fontSize: 14,
                  fontFamily:
                    'JetBrains Mono, Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  formatOnPaste: true,
                  formatOnType: true,
                  automaticLayout: true,
                  tabSize: 2,
                  insertSpaces: true,
                  folding: true,
                  lineNumbers: "on",
                  renderWhitespace: "boundary",
                  cursorStyle: "line",
                  contextmenu: true,
                  mouseWheelZoom: false,
                  padding: { top: 16, bottom: 16 },
                  smoothScrolling: true,
                  cursorBlinking: "smooth",
                }}
                loading={
                  <div className="w-full h-full bg-muted/20 flex items-center justify-center">
                    <div className="text-muted-foreground text-sm">
                      Loading Monaco Editor...
                    </div>
                  </div>
                }
              />

              <div className="absolute top-4 right-4 flex gap-1 opacity-60 hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleFormatJSON}
                  className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-accent"
                  title="Format JSON"
                >
                  <RefreshCw size={14} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyMessage}
                  className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-accent"
                  title="Copy to clipboard"
                >
                  <Copy size={14} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleClearMessage}
                  className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-accent"
                  title="Clear message"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <FileText className="w-3 h-3" />
                  Press Ctrl+Enter to send • JSON validation enabled
                  {lastSent && (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      • Last sent: {new Date().toLocaleTimeString()}
                    </span>
                  )}
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={status !== "connected" || isSending}
                  className={cn(
                    "font-medium shadow-sm",
                    status === "connected"
                      ? "bg-primary hover:bg-primary/90"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                >
                  <Send size={16} className="mr-2" />
                  {isSending ? "Sending..." : "Send Message"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <RealtimeClientServerLogsTable />
        </div>
      </div>

      {messages.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
          <div className="text-sm text-muted-foreground">
            {messages.length} message{messages.length !== 1 ? "s" : ""} in
            session
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportMessages}
            className="flex items-center gap-2"
          >
            <Download size={14} />
            Export Messages
          </Button>
        </div>
      )}
    </div>
  );
};

export default RealtimeMessageEditor;
