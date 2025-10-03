"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useWorkspaceStore } from "@/modules/Layout/Store";
import { useGetWorkspace } from "@/modules/Workspace/hooks/workspace";
import { Loader, FolderOpen, Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TabbedSidebar from "@/modules/Workspace/components/Sidebar";
import { useCollections } from "@/modules/collections/hooks/collection";
import SaveRequestToCollectionModal from "@/modules/collections/components/add-requests";
import PlaygroundPage from "@/modules/request/components/request-playground";
import HistoryList from "@/modules/history/component/history-list";
import DocsGeneratorModal from "@/modules/docs/components/docs-generator-modal";
import { useState } from "react";

const Page = () => {
  const { selectedWorkspace } = useWorkspaceStore();
  const { data: currentWorkspace, isLoading } = useGetWorkspace(selectedWorkspace?.id!);
  const { data: collectionsResponse } = useCollections(selectedWorkspace?.id!);
  const [isAddRequestOpen, setIsAddRequestOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);

  const collections = collectionsResponse?.success ? collectionsResponse.collections : [];
  
  const totalRequests = collections?.reduce((total, collection) => {

    return total + (collection._count?.requests || 0);
  }, 0) || 0;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader className="animate-spin h-8 w-8 text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Loading workspace...</p>
      </div>
    );
  }

  if (!currentWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <FolderOpen className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No Workspace Selected</h2>
        <p className="text-muted-foreground">Please select a workspace to get started</p>
      </div>
    );
  }

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      
      <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
        <TabbedSidebar currentWorkspace={currentWorkspace} />
      </ResizablePanel>

      <ResizableHandle withHandle />

      
      <ResizablePanel defaultSize={55} minSize={40}>
        <div className="flex flex-col h-full">
          {showWelcome ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <Card className="max-w-2xl w-full">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Send className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl">Welcome to {currentWorkspace.name}</CardTitle>
                  <CardDescription className="text-base">
                    {currentWorkspace.description || "Start building and testing your APIs"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <Button 
                      className="w-full" 
                      size="lg" 
                      onClick={() => {
                        setShowWelcome(false);
                        setIsAddRequestOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Request
                    </Button>
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline">
                        <FolderOpen className="h-4 w-4 mr-2" />
                        New Collection
                      </Button>
                      <Button variant="outline">
                        Import Collection
                      </Button>
                    </div>
                  </div>
                  
                  
                  <div className="mt-6 pt-6 border-t">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="group cursor-default">
                        <div className="text-3xl font-bold text-primary group-hover:scale-110 transition-transform">
                          {collections?.length || 0}
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">Collections</div>
                      </div>
                      <div className="group cursor-default">
                        <div className="text-3xl font-bold text-primary group-hover:scale-110 transition-transform">
                          {totalRequests}
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">Requests</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex-1 h-full">
              <PlaygroundPage />
            </div>
          )}
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      
      <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
        <div className="flex flex-col h-full border-l">
          <Tabs defaultValue="history" className="flex-1 flex flex-col">
            <div className="border-b px-4">
              <TabsList className="w-full justify-start h-12 bg-transparent p-0">
                <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
                <TabsTrigger value="docs" className="flex-1">Docs</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="history" className="flex-1 m-0">
              <HistoryList workspaceId={selectedWorkspace?.id} />
            </TabsContent>
            
            <TabsContent value="docs" className="flex-1 m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-6">
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Send className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">AI Documentation Generator</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-md">
                      Generate professional API documentation with AI. Select any request from your collections and get comprehensive markdown docs instantly.
                    </p>
                    <Button onClick={() => setIsDocsModalOpen(true)} size="lg">
                      <Send className="h-4 w-4 mr-2" />
                      Generate Docs
                    </Button>
                  </div>
                  
                  <div className="border-t pt-6">
                    <h4 className="text-sm font-medium mb-3">What you'll get:</h4>
                    <ul className="space-y-2 text-xs text-muted-foreground">
                      <li>• Complete endpoint documentation with examples</li>
                      <li>• Request/Response schemas and descriptions</li>
                      <li>• Header and parameter documentation</li>
                      <li>• Error codes and handling guidelines</li>
                      <li>• Download as Markdown (.md) file</li>
                      <li>• Professional formatting ready for GitHub/GitLab</li>
                    </ul>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </ResizablePanel>

      <SaveRequestToCollectionModal
        isModalOpen={isAddRequestOpen}
        setIsModalOpen={setIsAddRequestOpen}
      />

      <DocsGeneratorModal
        isOpen={isDocsModalOpen}
        onClose={() => setIsDocsModalOpen(false)}
      />
    </ResizablePanelGroup>
  );
};

export default Page;