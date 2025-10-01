import React, { useState } from "react";
import { RequestTab } from "../store/useRequestStore";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, Check, AlertCircle } from "lucide-react";
import { useRunRequest } from "../hooks/Request";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  tab: RequestTab;
  updateTab: (id: string, data: Partial<RequestTab>) => void;
}

const RequestBar = ({ tab, updateTab }: Props) => {
  const [isUrlFocused, setIsUrlFocused] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const { mutateAsync, isPending, isError } = useRunRequest(tab);

  const requestMethodConfig: Record<
    string,
    {
      text: string;
      bg: string;
      border: string;
      badge: string;
    }
  > = {
    GET: {
      text: "text-green-600 dark:text-green-400",
      bg: "bg-green-500/10 dark:bg-green-500/20",
      border: "border-green-500/30",
      badge:
        "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30",
    },
    POST: {
      text: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10 dark:bg-blue-500/20",
      border: "border-blue-500/30",
      badge:
        "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
    },
    PUT: {
      text: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-500/10 dark:bg-yellow-500/20",
      border: "border-yellow-500/30",
      badge:
        "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
    },
    DELETE: {
      text: "text-red-600 dark:text-red-400",
      bg: "bg-red-500/10 dark:bg-red-500/20",
      border: "border-red-500/30",
      badge: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
    },
    PATCH: {
      text: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-500/10 dark:bg-orange-500/20",
      border: "border-orange-500/30",
      badge:
        "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30",
    },
  };

  const currentMethod = requestMethodConfig[tab.method] || {
    text: "text-muted-foreground",
    bg: "bg-muted",
    border: "border-border",
    badge: "bg-muted text-muted-foreground border-border",
  };

  const isValidUrl = tab.url && tab.url.trim().length > 0;

  const onSendRequest = async () => {
    if (!isValidUrl) {
      toast.error("Please enter a valid URL");
      return;
    }

    setIsSending(true);
    try {
      const res = await mutateAsync();

      toast.success("Request sent successfully!", {
        description: `${tab.method} ${tab.url}`,
        duration: 3000,
      });
    } catch (error) {
      toast.error("Failed to send request.", {
        description: "Please check your network connection and try again.",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="w-full">
      
      <div className="flex items-center gap-2">
        
        <div className="flex-shrink-0">
          <Select
            value={tab.method}
            onValueChange={(value) => updateTab(tab.id, { method: value })}
          >
            <SelectTrigger
              className={cn(
                "w-[100px] h-[48px] rounded-lg border-2 font-bold font-mono text-sm shadow-sm",
                currentMethod.bg,
                currentMethod.text,
                currentMethod.border,
                "hover:brightness-110 transition-all hover:shadow-md"
              )}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border min-w-[140px]">
              <SelectGroup>
                <SelectItem
                  value="GET"
                  className="text-green-600 dark:text-green-400 font-bold font-mono hover:bg-green-500/10 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span>GET</span>
                  </div>
                </SelectItem>
                <SelectItem
                  value="POST"
                  className="text-blue-600 dark:text-blue-400 font-bold font-mono hover:bg-blue-500/10 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span>POST</span>
                  </div>
                </SelectItem>
                <SelectItem
                  value="PUT"
                  className="text-yellow-600 dark:text-yellow-400 font-bold font-mono hover:bg-yellow-500/10 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span>PUT</span>
                  </div>
                </SelectItem>
                <SelectItem
                  value="DELETE"
                  className="text-red-600 dark:text-red-400 font-bold font-mono hover:bg-red-500/10 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span>DELETE</span>
                  </div>
                </SelectItem>
                <SelectItem
                  value="PATCH"
                  className="text-orange-600 dark:text-orange-400 font-bold font-mono hover:bg-orange-500/10 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span>PATCH</span>
                  </div>
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        
        <div
          className={cn(
            "flex-1 flex items-center gap-2 h-[40px] rounded-lg border-2 bg-background px-4 shadow-sm transition-all duration-200",
            isUrlFocused
              ? "border-primary/60 shadow-md ring-2 ring-primary/20"
              : "border-border hover:border-primary/40"
          )}
        >
          <Input
            value={tab.url || ""}
            onChange={(e) => updateTab(tab.id, { url: e.target.value })}
            onFocus={() => setIsUrlFocused(true)}
            onBlur={() => setIsUrlFocused(false)}
            placeholder="Enter URL"
            className="w-full bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-muted-foreground/60 font-mono text-sm p-1 h-auto"
          />

          
          {tab.url && (
            <div className="flex-shrink-0">
              {isValidUrl ? (
                <Check className="h-4 w-4 text-green-500 dark:text-green-400" />
              ) : (
                <AlertCircle className="h-4 w-4 text-destructive" />
              )}
            </div>
          )}
        </div>

        
        <Button
          type="button"
          onClick={onSendRequest}
          disabled={isSending || !isValidUrl}
          className={cn(
            "h-[40px] px-8 rounded-lg font-bold text-sm transition-all duration-200 flex-shrink-0",
            "bg-primary hover:bg-primary/90 text-primary-foreground",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "shadow-sm hover:shadow-md hover:brightness-110"
          )}
        >
          {isSending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send
            </>
          )}
        </Button>
      </div>

      {tab.url && !isValidUrl && (
        <div className="flex items-center gap-2 mt-2 px-2 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" />
          <span>Please enter a valid URL</span>
        </div>
      )}
    </div>
  );
};

export default RequestBar;
