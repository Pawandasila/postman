"use client";

import { Folder, Search, X, ChevronRight, FolderOpen, Plus, Zap } from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";

import { REST_METHOD } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWorkspaceStore } from "@/modules/Layout/Store";
import { useCollections } from "@/modules/collections/hooks/collection";
import { useAddRequestToCollection } from "../hooks/Request";
import Modal from "@/components/ui/model";
import { useRequestPlaygroundStore } from "../store/useRequestStore";

interface AddRequestModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

const AddRequestModal = ({ isModalOpen, setIsModalOpen }: AddRequestModalProps) => {
  const [requestName, setRequestName] = useState("");
  const [requestUrl, setRequestUrl] = useState("https://api.example.com/endpoint");
  const [requestMethod, setRequestMethod] = useState<REST_METHOD>(REST_METHOD.GET);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const { selectedWorkspace } = useWorkspaceStore();
  const { data: collections, isLoading, isError } = useCollections(selectedWorkspace?.id!);
  const { mutateAsync, isPending } = useAddRequestToCollection(selectedCollectionId);
  const { addTab } = useRequestPlaygroundStore();

  useEffect(() => {
    if (isModalOpen) {
      setRequestName("");
      setRequestUrl("https://api.example.com/endpoint");
      setRequestMethod(REST_METHOD.GET);
      setSelectedCollectionId("");
      setSearchTerm("");
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) return;
    const collectionsList = collections?.collections || [];
    if (!selectedCollectionId && collectionsList.length > 0) {
      setSelectedCollectionId(collectionsList[0].id);
    }
  }, [isModalOpen, collections, selectedCollectionId]);

  const requestMethodStyles: Record<
    REST_METHOD,
    { className: string; bgColor: string }
  > = {
    [REST_METHOD.GET]: {
      className: "bg-green-500/10 text-green-600 border-green-500/30 dark:text-green-400",
      bgColor: "bg-green-500/5 border-green-500/20",
    },
    [REST_METHOD.POST]: {
      className: "bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400",
      bgColor: "bg-blue-500/5 border-blue-500/20",
    },
    [REST_METHOD.PUT]: {
      className: "bg-yellow-500/10 text-yellow-700 border-yellow-500/30 dark:text-yellow-400",
      bgColor: "bg-yellow-500/5 border-yellow-500/20",
    },
    [REST_METHOD.DELETE]: {
      className: "bg-red-500/10 text-red-600 border-red-500/30 dark:text-red-400",
      bgColor: "bg-red-500/5 border-red-500/20",
    },
    [REST_METHOD.PATCH]: {
      className: "bg-orange-500/10 text-orange-600 border-orange-500/30 dark:text-orange-400",
      bgColor: "bg-orange-500/5 border-orange-500/20",
    },
  };

  const collectionsList = collections?.collections || [];
  const filteredCollections = collectionsList.filter((collection) =>
    collection.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCollection = collectionsList.find((c) => c.id === selectedCollectionId);

  const handleSubmit = async () => {
    if (!requestName.trim()) {
      toast.error("Request Name Required", {
        description: "Please enter a name for your request.",
        duration: 3000,
      });
      return;
    }

    if (!requestUrl.trim()) {
      toast.error("URL Required", {
        description: "Please enter a valid URL for your request.",
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
      const result = await mutateAsync({
        url: requestUrl.trim(),
        method: requestMethod,
        name: requestName.trim(),
      });

      addTab({
        title: requestName.trim(),
        url: requestUrl.trim(),
        method: requestMethod.toString(),
        collectionId: selectedCollectionId,
        requestId: result.id,
      });

      toast.success("Request Created Successfully!", {
        description: `"${requestName}" has been added to "${selectedCollection?.name}" and opened in playground`,
        action: {
          label: "View",
          onClick: () => {
            console.log("View request:", result.id);
          },
        },
        duration: 5000,
      });
      
      setIsModalOpen(false);
    } catch (err) {
      toast.error("Failed to Create Request", {
        description: "There was an error creating your request. Please try again.",
        duration: 4000,
      });
      console.error("Failed to create request:", err);
    }
  };

  if (!isModalOpen) return null;

  return (
    <Modal
      title="Create New Request"
      description="Add a new API request to your collection and start testing"
      isOpen={isModalOpen}
      onClose={() => {
        console.log("Modal close called");
        setIsModalOpen(false);
      }}
      onSubmit={handleSubmit}
      submitText={isPending ? "Creating..." : "Create Request"}
      submitVariant="default"
    >
      <div className="space-y-5">
        {/* Request Name Input */}
        <div className="space-y-2">
          <Label htmlFor="new-request-name" className="text-sm font-medium flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Request Name
          </Label>
          <Input
            id="new-request-name"
            placeholder="e.g., Get User Profile, Create Order..."
            value={requestName}
            onChange={(e) => setRequestName(e.target.value)}
            autoFocus
          />
        </div>

        {/* HTTP Method Selector */}
        <div className="space-y-2">
          <Label htmlFor="new-request-method" className="text-sm font-medium">
            HTTP Method
          </Label>
          <Select
            value={requestMethod}
            onValueChange={(value) => setRequestMethod(value as REST_METHOD)}
          >
            <SelectTrigger id="new-request-method">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`font-mono font-bold text-xs ${requestMethodStyles[requestMethod].className}`}
                  >
                    {requestMethod}
                  </Badge>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.values(REST_METHOD).map((method) => (
                <SelectItem key={method} value={method}>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`font-mono font-bold text-xs ${requestMethodStyles[method].className}`}
                    >
                      {method}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Request URL Input */}
        <div className="space-y-2">
          <Label htmlFor="new-request-url" className="text-sm font-medium">
            Request URL
          </Label>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`font-mono font-bold text-xs ${requestMethodStyles[requestMethod].className} shrink-0`}
            >
              {requestMethod}
            </Badge>
            <Input
              id="new-request-url"
              placeholder="https://api.example.com/endpoint"
              value={requestUrl}
              onChange={(e) => setRequestUrl(e.target.value)}
              className="flex-1 font-mono text-sm"
            />
          </div>
        </div>

        {/* URL Preview Card */}
        <div className={`p-4 rounded-lg border ${requestMethodStyles[requestMethod].bgColor}`}>
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Request Preview
            </Label>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`font-mono font-bold text-xs ${requestMethodStyles[requestMethod].className}`}
              >
                {requestMethod}
              </Badge>
              <div className="flex-1 min-w-0 bg-background/50 rounded px-3 py-1.5 border border-border/50">
                <p className="text-sm text-foreground font-mono truncate">
                  {requestUrl || "https://api.example.com/endpoint"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Collection Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Folder className="w-4 h-4 text-primary" />
              Select Collection
            </Label>
            {selectedCollection && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/5 border border-primary/20">
                <FolderOpen className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary">
                  {selectedCollection.name}
                </span>
              </div>
            )}
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-md border border-border/50">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-foreground">
                {selectedWorkspace?.name || "Workspace"}
              </span>
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">Collections</span>
            </div>
          </div>

          {/* Search */}
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

          {/* Collections List */}
          <ScrollArea className="h-[200px] border border-border rounded-lg">
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
                        ${
                          isSelected
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
                      <span
                        className={`text-sm font-medium flex-1 truncate ${
                          isSelected ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {collection.name}
                      </span>
                      {collection._count?.requests !== undefined && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          {collection._count.requests}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Selected Collection Confirmation */}
        {selectedCollection && (
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <Plus className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground">Adding to</p>
                <p className="text-sm font-semibold text-primary truncate">
                  {selectedCollection.name}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AddRequestModal;