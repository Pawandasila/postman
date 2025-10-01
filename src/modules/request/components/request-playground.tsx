"use client";

import { useHotkeys } from "react-hotkeys-hook";

import TabBar from "./tab-bar";
import { useRequestPlaygroundStore } from "../store/useRequestStore";
import { useState } from "react";
import { toast } from "sonner";

import { REST_METHOD } from "@prisma/client";

import RequestEditor from "./request-editor";
import SaveRequestToCollectionModal from "@/modules/collections/components/add-requests";
import AddRequestModal from "./add-request-model";
import { useSaveRequest } from "../hooks/Request";
import Image from "next/image";

export default function PlaygroundPage() {
  const { tabs, activeTabId } = useRequestPlaygroundStore();

  const activeTab = tabs.find((t) => t.id === activeTabId);

  const {mutateAsync, isPending} = useSaveRequest(activeTab?.requestId!);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showAddRequestModal, setShowAddRequestModal] = useState(false);


  const getCurrentRequestData = () => {
    if (!activeTab) {
      return {
        name: "Untitled Request",
        method: REST_METHOD.GET as REST_METHOD,
        url: "https://echo.hoppscotch.io"
      };
    }

    return {
      name: activeTab.title || "Untitled Request",
      method: (activeTab.method as REST_METHOD) || REST_METHOD.GET,
      url: activeTab.url || "https://echo.hoppscotch.io"
    };
  };

 useHotkeys(
  "ctrl+s, meta+s",
  async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!activeTab) {
      toast.error("No active request to save");
      return;
    }

    if (activeTab.collectionId) {
  
      try {
        await mutateAsync({
          url: activeTab.url || "https://echo.hoppscotch.io",
          method: activeTab.method as REST_METHOD,
          name: activeTab.title || "Untitled Request",
          body: activeTab.body,
          headers: activeTab.headers,
          parameters: activeTab.parameters,
          
        });
        toast.success("Request updated");
      } catch (err) {
        console.error("Failed to update request:", err);
        toast.error("Failed to update request");
      }
    } else {
     
      setShowSaveModal(true);
    }
  },
  { preventDefault: true, enableOnFormTags: true },
  [activeTab]
);


  useHotkeys(
    "ctrl+g, meta+g",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("Ctrl+G pressed - opening add request modal");
      setShowAddRequestModal(true);
    },
    {
      preventDefault: true,
      enableOnFormTags: true,
    },
    []
  );

  if (!activeTab) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-6 px-8 max-w-xl">
          
          <div className="flex flex-col justify-center items-center h-32 w-32 rounded-full bg-card border border-border shadow-lg">
            <Image
              src="/logo/logo.svg" 
              alt="PostBoy Logo" 
              width={400} 
              height={400}
              quality={100}
              className="object-cover"
            />
          </div>

          
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">
              No Active Request
            </h2>
            <p className="text-muted-foreground text-sm">
              Start testing your APIs by creating a new request or opening an existing one from your collections
            </p>
          </div>

          
          <div className="bg-card border border-border rounded-lg shadow-md p-6 space-y-5 w-full">
            <div className="flex items-center gap-2 pb-2 border-b border-border/50">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Keyboard Shortcuts</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center hover:bg-accent/50 p-3 rounded-lg transition-all duration-200 group">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <kbd className="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 bg-gradient-to-b from-muted to-muted/80 text-foreground text-xs font-semibold font-mono rounded border border-border shadow-sm group-hover:border-primary/50 group-hover:shadow-md transition-all">
                      Ctrl
                    </kbd>
                    <span className="text-muted-foreground text-xs">+</span>
                    <kbd className="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 bg-gradient-to-b from-muted to-muted/80 text-foreground text-xs font-semibold font-mono rounded border border-border shadow-sm group-hover:border-primary/50 group-hover:shadow-md transition-all">
                      G
                    </kbd>
                  </div>
                  <span className="text-foreground text-sm font-medium">New Request</span>
                </div>
                <span className="text-muted-foreground text-xs font-mono">⌘G</span>
              </div>
              
              <div className="flex justify-between items-center hover:bg-accent/50 p-3 rounded-lg transition-all duration-200 group">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <kbd className="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 bg-gradient-to-b from-muted to-muted/80 text-foreground text-xs font-semibold font-mono rounded border border-border shadow-sm group-hover:border-primary/50 group-hover:shadow-md transition-all">
                      Ctrl
                    </kbd>
                    <span className="text-muted-foreground text-xs">+</span>
                    <kbd className="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 bg-gradient-to-b from-muted to-muted/80 text-foreground text-xs font-semibold font-mono rounded border border-border shadow-sm group-hover:border-primary/50 group-hover:shadow-md transition-all">
                      S
                    </kbd>
                  </div>
                  <span className="text-foreground text-sm font-medium">Save Request</span>
                </div>
                <span className="text-muted-foreground text-xs font-mono">⌘S</span>
              </div>
            </div>

            
            <div className="pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Tip:</span> Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-primary font-mono text-xs">Ctrl+G</kbd> to quickly create a new request
              </p>
            </div>
          </div>
        </div>

        <AddRequestModal
          isModalOpen={showAddRequestModal}
          setIsModalOpen={setShowAddRequestModal}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <TabBar />
      <div className="flex-1 overflow-auto">
        <RequestEditor />
      </div>

      
      <SaveRequestToCollectionModal
        isModalOpen={showSaveModal}
        setIsModalOpen={setShowSaveModal}
        requestData={getCurrentRequestData()}
        initialName={getCurrentRequestData().name}
      />

      <AddRequestModal
        isModalOpen={showAddRequestModal}
        setIsModalOpen={setShowAddRequestModal}
      />
    </div>
  );
}