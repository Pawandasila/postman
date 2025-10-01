"use client";

import { Folder, Search, X, ChevronRight, FolderOpen } from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";

import { REST_METHOD } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWorkspaceStore } from "@/modules/Layout/Store";
import { useCollections } from "../hooks/collection";
import { useAddRequestToCollection } from "@/modules/request/hooks/Request";
import Modal from "@/components/ui/model";


const SaveRequestToCollectionModal = ({
  isModalOpen,
  setIsModalOpen,
  requestData = {
    name: "Untitled",
    url: "https://echo.hoppscotch.io",
    method: REST_METHOD.GET,
  },
  initialName = "Untitled",
  collectionId
}: {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  requestData?: {
    name: string;
    method: REST_METHOD;
    url: string;
  };
  initialName?: string;
  collectionId?: string
}) => {
  const [requestName, setRequestName] = useState(initialName);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>(collectionId || "");
  const [searchTerm, setSearchTerm] = useState("");

  
  const { selectedWorkspace } = useWorkspaceStore();
  const { data: collections, isLoading, isError } = useCollections(selectedWorkspace?.id!);
  const { mutateAsync, isPending } = useAddRequestToCollection(selectedCollectionId);


  useEffect(() => {
    if (isModalOpen) {
      setRequestName(requestData.name || initialName);
      setSelectedCollectionId(collectionId || "");
      setSearchTerm("");
    }
  }, [isModalOpen, requestData.name, initialName]);


  useEffect(() => {
    if (!isModalOpen) return;
    if (collectionId) return; 
    const collectionsList = collections?.collections || [];
    if (!selectedCollectionId && collectionsList.length > 0) {
      setSelectedCollectionId(collectionsList[0].id);
    }
  }, [isModalOpen, collections, collectionId, selectedCollectionId]);


  

  const requestMethodStyles: Record<REST_METHOD, { variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
    [REST_METHOD.GET]: { 
      variant: "outline", 
      className: "bg-green-500/10 text-green-600 border-green-500/30 hover:bg-green-500/20 dark:text-green-400 dark:border-green-400/30" 
    },
    [REST_METHOD.POST]: { 
      variant: "outline", 
      className: "bg-blue-500/10 text-blue-600 border-blue-500/30 hover:bg-blue-500/20 dark:text-blue-400 dark:border-blue-400/30" 
    },
    [REST_METHOD.PUT]: { 
      variant: "outline", 
      className: "bg-yellow-500/10 text-yellow-700 border-yellow-500/30 hover:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-400/30" 
    },
    [REST_METHOD.DELETE]: { 
      variant: "destructive", 
      className: "bg-red-500/10 text-red-600 border-red-500/30 hover:bg-red-500/20 dark:text-red-400 dark:border-red-400/30" 
    },
    [REST_METHOD.PATCH]: { 
      variant: "outline", 
      className: "bg-orange-500/10 text-orange-600 border-orange-500/30 hover:bg-orange-500/20 dark:text-orange-400 dark:border-orange-400/30" 
    },
  };

  const collectionsList = collections?.collections || [];
  const filteredCollections = collectionsList.filter(collection =>
    collection.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCollection = collectionsList.find(c => c.id === selectedCollectionId);

  const handleSubmit = async () => {
    if (!requestName.trim()) {
      toast.error("Request Name Required", {
        description: "Please enter a name for your request before saving.",
        duration: 3000,
      });
      return;
    }

    if (!selectedCollectionId) {
      toast.error("Collection Not Selected", {
        description: "Please select a collection to save your request.",
        duration: 3000,
      });
      return;
    }
    
    try {
      await mutateAsync({
        url: requestData.url.trim(),
        method: requestData.method,
        name: requestName.trim(),
      });
     
      toast.success("Request Saved Successfully!", {
        description: `${requestName} has been added to "${selectedCollection?.name}" collection`,
        action: {
          label: "View Collection",
          onClick: () => {
            // Future: Navigate to collection view
            console.log("View collection:", selectedCollectionId);
          },
        },
        duration: 5000,
      });
      setIsModalOpen(false);
    } catch (err) {
      toast.error("Failed to Save Request", {
        description: "There was an error saving your request. Please try again.",
        duration: 4000,
      });
      console.error("Failed to save request to collection:", err);
    }
  };

  return (
    <Modal
      title="Save Request"
      description="Add this request to a collection for easy access later"
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onSubmit={handleSubmit}
      submitText={isPending ? "Saving..." : "Save Request"}
      submitVariant="default"
    >
      <div className="space-y-5">
        
        <div className="space-y-2">
          <Label htmlFor="request-name" className="text-sm font-medium">
            Request Name
          </Label>
          <div className="relative">
            <Input
              id="request-name"
              placeholder="Enter request name..."
              value={requestName}
              onChange={(e) => setRequestName(e.target.value)}
              autoFocus
              className="pr-24"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Badge 
                variant={requestMethodStyles[requestData.method].variant} 
                className={`font-mono font-bold text-xs ${requestMethodStyles[requestData.method].className}`}
              >
                {requestData.method}
              </Badge>
            </div>
          </div>
        </div>

        
        <div className="p-4 bg-muted/50 rounded-lg border border-border">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-xs font-semibold text-muted-foreground">Request Details</Label>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={requestMethodStyles[requestData.method].variant} 
                className={`font-mono font-bold text-xs ${requestMethodStyles[requestData.method].className}`}
              >
                {requestData.method}
              </Badge>
              <div className="flex-1 min-w-0 bg-background/50 rounded px-3 py-1.5 border border-border/50">
                <p className="text-sm text-foreground font-mono truncate">{requestData.url}</p>
              </div>
            </div>
          </div>
        </div>

        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Select Collection</Label>
            {selectedCollection && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/5 border border-primary/20">
                <FolderOpen className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary">{selectedCollection.name}</span>
              </div>
            )}
          </div>

          
          <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-md border border-border/50">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-foreground">{selectedWorkspace?.name || "Workspace"}</span>
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">Collections</span>
            </div>
          </div>

          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          
          <ScrollArea className="h-[240px] border border-border rounded-lg">
            <div className="p-2 space-y-1">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading collections...</span>
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <X className="w-8 h-8 text-destructive" />
                  <span className="text-sm text-destructive">Failed to load collections</span>
                </div>
              ) : filteredCollections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <Folder className="w-8 h-8 text-muted-foreground/50" />
                  <span className="text-sm text-muted-foreground">
                    {searchTerm ? "No collections found" : "No collections available"}
                  </span>
                </div>
              ) : (
                filteredCollections.map((collection) => {
                  const isSelected = selectedCollectionId === collection.id;
                  return (
                    <div
                      key={collection.id}
                      onClick={() => setSelectedCollectionId(collection.id)}
                      className={`
                        flex items-center gap-3 p-3 rounded-md cursor-pointer transition-all
                        ${isSelected 
                          ? "bg-primary/10 border border-primary/50 shadow-sm" 
                          : "hover:bg-accent border border-transparent"
                        }
                      `}
                    >
                      <div className="shrink-0">
                        {isSelected ? (
                          <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                          </div>
                        ) : (
                          <Folder className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <span className={`text-sm font-medium flex-1 truncate ${
                        isSelected ? "text-primary" : "text-foreground"
                      }`}>
                        {collection.name}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>

        
        {selectedCollection && (
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10">
                <FolderOpen className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground">Saving to</p>
                <p className="text-sm font-semibold text-primary truncate">{selectedCollection.name}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SaveRequestToCollectionModal;