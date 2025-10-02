"use client";

import RealtimeConnectionBar from "@/modules/realtime/components/realtime-connection-bar";
import RealtimeMessageEditor from "@/modules/realtime/components/realtime-message-editor";
import React from "react";
import { Zap, Globe } from "lucide-react";

const page = () => {
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="px-8 py-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                WebSocket Testing
              </h1>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Real-time bi-directional communication testing
              </p>
            </div>
          </div>

          <div className="mt-6">
            <RealtimeConnectionBar />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full px-4 py-4">
          <RealtimeMessageEditor />
        </div>
      </div>
    </div>
  );
};

export default page;
