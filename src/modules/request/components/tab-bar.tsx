"use client";
import { X, Plus } from "lucide-react";
import { useState } from "react";
import { useRequestPlaygroundStore } from "../store/useRequestStore";
import AddNameModal from "./add-name-model";


export default function TabBar() {
  const { tabs, activeTabId, setActiveTab, addTab, closeTab } =
    useRequestPlaygroundStore();
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [selectedTabId, setSelectedTabId] = useState<string | null>(null);

  const requestColorMap: Record<string, { text: string; bg: string; border: string }> = {
    GET: {
      text: "text-green-600 dark:text-green-400",
      bg: "bg-green-500/10 dark:bg-green-500/20",
      border: "border-green-500/50",
    },
    POST: {
      text: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10 dark:bg-blue-500/20",
      border: "border-blue-500/50",
    },
    PUT: {
      text: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-500/10 dark:bg-yellow-500/20",
      border: "border-yellow-500/50",
    },
    DELETE: {
      text: "text-red-600 dark:text-red-400",
      bg: "bg-red-500/10 dark:bg-red-500/20",
      border: "border-red-500/50",
    },
    PATCH: {
      text: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-500/10 dark:bg-orange-500/20",
      border: "border-orange-500/50",
    },
  };

  const onDoubleClick = (tabId: string) => {
    setSelectedTabId(tabId);
    setRenameModalOpen(true);
  }

  return (
    <>
      <div className="flex items-center gap-1 border-b border-border bg-card px-2 py-1.5 shadow-sm">
        {tabs.map((tab) => {
          const colors = requestColorMap[tab.method] || {
            text: "text-muted-foreground",
            bg: "bg-muted",
            border: "border-border",
          };
          
          return (
            <div
              key={tab.id}
              onDoubleClick={() => onDoubleClick(tab.id)}
              onClick={() => setActiveTab(tab.id)}
              className={`
                group relative px-3 py-2 flex items-center gap-2 cursor-pointer
                rounded-md transition-all duration-200
                ${activeTabId === tab.id
                  ? `bg-background text-foreground shadow-sm border border-border/50 ${colors.bg}`
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }
              `}
            >
              {/* Active indicator */}
              {activeTabId === tab.id && (
                <div className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-md bg-gradient-to-r from-primary/50 via-primary to-primary/50`} />
              )}

              {/* HTTP Method Badge */}
              <span
                className={`
                  px-1.5 py-0.5 rounded text-[10px] font-bold font-mono uppercase
                  ${colors.text} ${colors.bg} border ${colors.border}
                  transition-colors duration-200
                `}
              >
                {tab.method}
              </span>

              {/* Tab Title */}
              <p className="max-w-[150px] truncate text-sm font-medium flex items-center gap-1.5">
                {tab.title}
                {tab.unsavedChanges && (
                  <span className="text-destructive group-hover:hidden transition-all text-xl leading-none">
                    •
                  </span>
                )}
              </p>

              {/* Close Button */}
              <X
                className={`
                  w-3.5 h-3.5 ml-1 rounded-sm
                  opacity-0 group-hover:opacity-100
                  hover:bg-destructive/10 hover:text-destructive
                  transition-all duration-200
                  ${tab.unsavedChanges ? 'group-hover:block' : ''}
                `}
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
              />
            </div>
          );
        })}

        {/* Add Tab Button */}
        <button
          onClick={() => addTab()}
          className="
            flex items-center justify-center
            w-8 h-8 rounded-md
            text-muted-foreground hover:text-foreground
            hover:bg-muted/50 active:bg-muted
            transition-all duration-200
            group
          "
          title="New Request (Ctrl+G)"
        >
          <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {selectedTabId && (
        <AddNameModal
          isModalOpen={renameModalOpen}
          setIsModalOpen={setRenameModalOpen}
          tabId={selectedTabId}
        />
      )}
    </>
  );
}