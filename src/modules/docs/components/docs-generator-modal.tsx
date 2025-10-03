"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileText, 
  Sparkles, 
  Loader2, 
  Download,
  CheckCircle2,
  AlertCircle,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { useWorkspaceStore } from "@/modules/Layout/Store";
import { useCollectionsForDocs } from "../hooks/useCollectionsForDocs";
import { useGenerateApiDocs } from "@/modules/ai/hooks/aisuggestion";
import { useDocsStore } from "../store/useDocsStore";
import { cn } from "@/lib/utils";
import DocsPreview from "./docs-preview";


interface DocsGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DocsGeneratorModal = ({ isOpen, onClose }: DocsGeneratorModalProps) => {
  const { selectedWorkspace } = useWorkspaceStore();
  const { data: collections, isLoading: isLoadingCollections } = useCollectionsForDocs(
    selectedWorkspace?.id
  );
  const { mutateAsync: generateDocs, isPending: isGenerating } = useGenerateApiDocs();
  const { generatedDocs, addGeneratedDoc, removeGeneratedDoc, clearAllDocs } = useDocsStore();

  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");
  const [selectedRequestId, setSelectedRequestId] = useState<string>("");
  const [previewDocId, setPreviewDocId] = useState<string | null>(null);

  const selectedCollection = collections?.find((c: any) => c.id === selectedCollectionId);
  const requests = selectedCollection?.requests || [];

  const handleGenerateDocs = async () => {
    if (!selectedRequestId) {
      toast.error("Please select a request");
      return;
    }

    try {
      toast.info("Generating documentation...", { duration: 2000 });

      const result = await generateDocs({ requestId: selectedRequestId });

      if (result.success) {
        const docId = addGeneratedDoc({
          title: result.documentation.title,
          description: result.documentation.summary,
          documentation: result.documentation,
          metadata: result.metadata,
        });

        toast.success("Documentation generated successfully!");
        setPreviewDocId(docId);
      }
    } catch (error) {
      console.error("Failed to generate docs:", error);
      toast.error("Failed to generate documentation");
    }
  };

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: "bg-green-500/10 text-green-600 border-green-500/30",
      POST: "bg-blue-500/10 text-blue-600 border-blue-500/30",
      PUT: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
      DELETE: "bg-red-500/10 text-red-600 border-red-500/30",
      PATCH: "bg-orange-500/10 text-orange-600 border-orange-500/30",
    };
    return colors[method] || "bg-gray-500/10 text-gray-600 border-gray-500/30";
  };

  if (previewDocId) {
    return (
      <DocsPreview
        isOpen={isOpen}
        onClose={() => {
          setPreviewDocId(null);
          onClose();
        }}
        docId={previewDocId}
        onBack={() => setPreviewDocId(null)}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">
                  AI Documentation Generator
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Generate comprehensive API documentation with AI
                </p>
              </div>
            </div>
            {generatedDocs.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllDocs}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)]">
          <div className="px-6 py-6 space-y-6">
            {/* Selection Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Workspace</label>
                <div className="p-3 bg-muted/50 rounded-lg border">
                  <p className="text-sm font-medium">{selectedWorkspace?.name || "No workspace selected"}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedWorkspace ? "Ready to generate documentation" : "Select a workspace to continue"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Collection</label>
                <Select
                  value={selectedCollectionId}
                  onValueChange={(value) => {
                    setSelectedCollectionId(value);
                    setSelectedRequestId("");
                  }}
                  disabled={isLoadingCollections || !collections?.length}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a collection..." />
                  </SelectTrigger>
                  <SelectContent>
                    {collections?.map((collection: any) => (
                      <SelectItem key={collection.id} value={collection.id}>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>{collection.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {collection._count?.requests || 0} requests
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCollectionId && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    API Request
                    <span className="text-xs text-muted-foreground ml-2">
                      ({requests.length} available)
                    </span>
                  </label>
                  <ScrollArea className="max-h-[300px] border rounded-lg">
                    <div className="p-2 space-y-2">
                      {requests.length === 0 ? (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                          No requests in this collection
                        </div>
                      ) : (
                        requests.map((request: any) => (
                          <button
                            key={request.id}
                            onClick={() => setSelectedRequestId(request.id)}
                            className={cn(
                              "w-full p-3 text-left rounded-lg border transition-all",
                              selectedRequestId === request.id
                                ? "bg-primary/10 border-primary"
                                : "bg-card hover:bg-accent border-border"
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs font-bold font-mono mt-0.5",
                                  getMethodColor(request.method)
                                )}
                              >
                                {request.method}
                              </Badge>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{request.name}</p>
                                <p className="text-xs text-muted-foreground truncate font-mono">
                                  {request.url}
                                </p>
                              </div>
                              {selectedRequestId === request.id && (
                                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                              )}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>

            <Separator />

            {/* Generate Button */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Ready to generate</p>
                  <p className="text-xs text-muted-foreground">
                    AI will create comprehensive documentation for your API
                  </p>
                </div>
              </div>
              <Button
                onClick={handleGenerateDocs}
                disabled={!selectedRequestId || isGenerating}
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Docs
                  </>
                )}
              </Button>
            </div>

            {/* Generated Docs List */}
            {generatedDocs.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Generated Documentation</h3>
                    <Badge variant="secondary">{generatedDocs.length} docs</Badge>
                  </div>
                  <div className="space-y-2">
                    {generatedDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-4 bg-card border rounded-lg hover:shadow-md transition-all group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm mb-1 truncate">{doc.title}</h4>
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                              {doc.description}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{doc.metadata.collectionName}</span>
                              <span>•</span>
                              <span>{new Date(doc.generatedAt).toLocaleTimeString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setPreviewDocId(doc.id)}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeGeneratedDoc(doc.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DocsGeneratorModal;
