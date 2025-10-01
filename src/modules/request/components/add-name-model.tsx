"use client";
import Modal from "@/components/ui/model";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRequestPlaygroundStore } from "../store/useRequestStore";
import { Sparkles, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { useSuggestRequestName } from "@/modules/ai/hooks/ai-suggestion";

const AddNameModal = ({
  isModalOpen,
  setIsModalOpen,
  tabId,
}: {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  tabId: string;
}) => {
  const { updateTab, tabs, markUnsaved } = useRequestPlaygroundStore();
//   const {mutateAsync , data , isPending , isError} = useSuggestRequestName();
  const tab = tabs.find((t) => t.id === tabId);

  const [name, setName] = useState(tab?.title || "");
  const [suggestions, setSuggestions] = useState<Array<{name: string; reasoning: string}>>([]);

 
  useEffect(() => {
    if (tab) setName(tab.title);
  }, [tabId]);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    try {
      updateTab(tabId, { title: name });
      markUnsaved(tabId, true); 
      toast.success("Request name updated");
      setIsModalOpen(false);
      setSuggestions([]);
    } catch (err) {
      toast.error("Failed to update request name");
      console.error(err);
    }
  };

  return (
    <Modal
      title="Rename Request"
      description="Give your request a meaningful and descriptive name"
      isOpen={isModalOpen}
      onClose={() => {
        setIsModalOpen(false);
        setSuggestions([]);
      }}
      onSubmit={handleSubmit}
      submitText="Save Changes"
      submitVariant="default"
    >
      <div className="space-y-5">
        
        <div className="space-y-3">
          <Label htmlFor="request-name" className="text-sm font-medium text-foreground flex items-center gap-2">
            <span className="w-1 h-4 bg-primary rounded-full"></span>
            Request Name
          </Label>
          
          <div className="flex items-center gap-2">
            <Input
              id="request-name"
              className="flex-1 bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="e.g., Get User Profile, Create Order..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />

            <Button 
              variant="outline" 
              size="icon" 
              className="shrink-0 border-primary/30 hover:border-primary/50 hover:bg-primary/10 transition-all"
              title="Generate name suggestions with AI"
            //   onClick={async () => {
            //     if (!tab) return;
            //     try {
            //       const result = await mutateAsync({
            //         workspaceName: tab.workspaceId || "Default Workspace",
            //         method: (tab.method as "GET" | "POST" | "PUT" | "PATCH" | "DELETE") || "GET",
            //         url: tab.url || "",
            //         description: `Request in collection ${tab.collectionId || ""}`
            //       });
                  
            //       if (result.suggestions && result.suggestions.length > 0) {
            //         setSuggestions(result.suggestions);
            //         setName(result.suggestions[0].name);
            //         toast.success("Generated name suggestions");
            //       }
            //     } catch (error) {
            //       toast.error("Failed to generate name suggestions");
            //     }
            //   }} 
            //   disabled={isPending}
            >
              <Sparkles className="h-4 w-4 text-primary" />
            </Button>
          </div>

          
          {tab && (
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center gap-2">
                <span className={`
                  text-xs font-bold font-mono px-2 py-1 rounded
                  ${tab.method === 'GET' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/30' : ''}
                  ${tab.method === 'POST' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30' : ''}
                  ${tab.method === 'PUT' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30' : ''}
                  ${tab.method === 'DELETE' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30' : ''}
                  ${tab.method === 'PATCH' ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30' : ''}
                `}>
                  {tab.method}
                </span>
                <span className="text-xs text-muted-foreground font-mono truncate max-w-[300px]">
                  {tab.url || 'No URL set'}
                </span>
              </div>
            </div>
          )}
        </div>

        
        {suggestions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              <Label className="text-sm font-semibold text-foreground">
                AI Suggestions
              </Label>
              <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                {suggestions.length} suggestions
              </span>
            </div>
            
            <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="group flex flex-col gap-2 p-3 border border-border rounded-lg bg-card hover:bg-accent hover:border-primary/50 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md"
                  onClick={() => {
                    setName(suggestion.name);
                    toast.success(`Selected: ${suggestion.name}`);
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {suggestion.name}
                    </span>
                    <span className="shrink-0 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                      #{index + 1}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {suggestion.reasoning}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        
        <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg border border-border">
          <Lightbulb className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Tip:</span> Use descriptive names that clearly indicate what the request does. Click the sparkle icon to generate AI-powered name suggestions based on your request URL and method.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default AddNameModal;