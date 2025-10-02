"use client";

import { Hint } from "@/components/ui/hint";
import { Globe, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { cn } from "@/lib/utils";

const TabbedLeftPanel = () => {
  const pathname = usePathname();
  const activeTab = pathname.split("/")[1] || "rest";

  const sidebarItems = [
    { 
      icon: LinkIcon, 
      label: "REST", 
      value: "rest",
      link: "/",
      description: "REST API Testing"
    },
    { 
      icon: Globe, 
      label: "WebSocket", 
      value: "realtime",
      link: "/realtime",
      description: "Real-time WebSocket Testing"
    },
  ];

  return (
    <div className="flex h-screen bg-background">
      
      <div className="w-16 bg-sidebar flex flex-col py-6 relative">
        
        <div className="flex items-center justify-center mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-sidebar-primary-foreground font-bold text-sm">P</span>
          </div>
        </div>

        
        <nav className="flex flex-col space-y-3 px-3">
          {sidebarItems.map((item, index) => {
            const isActive = activeTab === item.value;
            
            return (
              <Hint 
                label={item.label} 
                key={index} 
                side="right"
                sideOffset={8}
              >
                <Link
                  href={item.link}
                  className={cn(
                    "group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ease-out",
                    "hover:scale-105 hover:shadow-lg",
                    isActive 
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md ring-2 ring-sidebar-ring/20" 
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  
                  {isActive && (
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-6 bg-sidebar-primary rounded-r-full" />
                  )}
                  
                  
                  <item.icon 
                    className={cn(
                      "w-4 h-4 transition-all duration-200",
                      isActive 
                        ? "scale-110" 
                        : "group-hover:scale-110"
                    )} 
                  />
                  
                  
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl bg-sidebar-primary/20 blur-xl -z-10" />
                  )}
                </Link>
              </Hint>
            );
          })}
        </nav>

        
       
        
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-sidebar/50 pointer-events-none" />
      </div>
    </div>
  );
};

export default TabbedLeftPanel;
