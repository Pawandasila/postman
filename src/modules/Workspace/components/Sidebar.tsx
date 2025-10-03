'use client';

import { Button } from '@/components/ui/button';
import { Archive, Clock, Code, Share2, Plus, Loader, FolderOpen } from 'lucide-react';
import React, { useState } from 'react';
import CreateCollection from '../../collections/components/create-collection';
import { useCollections } from '@/modules/collections/hooks/collection';
import CollectionFolder from '@/modules/collections/components/collection-folder';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCanCreateCollection } from '@/hooks/use-workspace-permissions';

interface Props {
  currentWorkspace: any;
}

const TabbedSidebar = ({ currentWorkspace }: Props) => {
  const [activeTab, setActiveTab] = useState('Collections');
  const [isModalOpen, setIsModalOpen] = useState(false); 

  const { data: collectionsResponse, isLoading, isError } = useCollections(currentWorkspace?.id);
  
  const collections = collectionsResponse?.success ? collectionsResponse.collections : [];
  
  const canCreateCollection = useCanCreateCollection(currentWorkspace?.id || '');

  const sidebarItems = [
    { icon: Archive, label: 'Collections', tooltip: 'Collections' },
    { icon: Clock, label: 'History', tooltip: 'Request History' },
    { icon: Share2, label: 'Share', tooltip: 'Share & Collaborate' },
    { icon: Code, label: 'Code', tooltip: 'Code Snippets' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Collections':
        return (
          <div className="flex flex-col h-full">
            
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{currentWorkspace?.name}</span>
                <span className="text-muted-foreground">&rsaquo;</span>
                <h2 className="text-sm font-semibold">Collections</h2>
              </div>
              {canCreateCollection && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8"
                      onClick={() => setIsModalOpen(true)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Create New Collection</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            
            <div className="p-4 border-b">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search collections..."
                  className="w-full h-9 pl-3 pr-4 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            
            <ScrollArea className="flex-1">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader className="animate-spin h-6 w-6 text-primary" />
                </div>
              ) : collections && collections.length > 0 ? (
                <div className="p-2 space-y-1">
                  {collections.map((collection: any) => (
                    <CollectionFolder key={collection.id} collection={collection} />
                  ))}
                </div>
              ) : (
                <div className="p-4">
                  <div className="text-center py-8 text-muted-foreground">
                    <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm mb-2">No collections yet</p>
                    {canCreateCollection ? (
                      <>
                        <p className="text-xs mb-4">Create your first collection to get started</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setIsModalOpen(true)}
                        >
                          <Plus className="h-3 w-3 mr-2" />
                          Create Collection
                        </Button>
                      </>
                    ) : (
                      <p className="text-xs">You have read-only access to this workspace</p>
                    )}
                  </div>
                </div>
              )}
            </ScrollArea>
          </div>
        );

      case 'History':
        return (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{currentWorkspace?.name}</span>
                <span className="text-muted-foreground">&rsaquo;</span>
                <h2 className="text-sm font-semibold">History</h2>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center p-8">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No request history yet</p>
                <p className="text-xs mt-2">Your API requests will appear here</p>
              </div>
            </div>
          </div>
        );

      case 'Share':
        return (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{currentWorkspace?.name}</span>
                <span className="text-muted-foreground">&rsaquo;</span>
                <h2 className="text-sm font-semibold">Share</h2>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center p-8">
                <Share2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Share & Collaborate</p>
                <p className="text-xs mt-2">Coming soon</p>
              </div>
            </div>
          </div>
        );

      case 'Code':
        return (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{currentWorkspace?.name}</span>
                <span className="text-muted-foreground">&rsaquo;</span>
                <h2 className="text-sm font-semibold">Code Snippets</h2>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center p-8">
                <Code className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Code Generation</p>
                <p className="text-xs mt-2">Coming soon</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-full">
      
      <TooltipProvider delayDuration={300}>
        <div className="w-12 border-r flex flex-col items-center py-4 space-y-2 flex-shrink-0">
          {sidebarItems.map((item, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setActiveTab(item.label)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                    activeTab === item.label
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                <p>{item.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>

      
      <div className="flex-1 min-w-0 overflow-hidden">
        {renderTabContent()}
      </div>

      
      <CreateCollection
        workspaceId={currentWorkspace?.id}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
    </div>
  );
};

export default TabbedSidebar;