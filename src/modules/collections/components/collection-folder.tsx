import {
  EllipsisVertical,
  FilePlus,
  Folder,
  Trash,
  Edit,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import EditCollectionModal from "./edit-collection";
import DeleteCollectionModal from "./delete-collection";
import SaveRequestToCollectionModal from "./add-requests";
import EditRequestModal from "@/modules/request/components/edit-request";
import DeleteRequestModal from "@/modules/request/components/delete-request";
import { useGetAllRequestsInCollection } from "@/modules/request/hooks/Request";
import { REST_METHOD } from "@prisma/client";

interface Props {
  collection: {
    id: string;
    name: string;
    updatedAt: Date;
    workspaceId: string;
  };
}

const CollectionFolder = ({ collection }: Props) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAddRequestOpen, setIsAddRequestOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const folderRef = useRef<HTMLDivElement>(null);
  
  const [isEditRequestOpen, setIsEditRequestOpen] = useState(false);
  const [isDeleteRequestOpen, setIsDeleteRequestOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<{
    id: string;
    name: string;
    url: string;
    method: REST_METHOD;
  } | null>(null);

  const {
    data: requests,
    isPending,
    isError,
  } = useGetAllRequestsInCollection(collection.id);

  const requestMethodStyles: Record<REST_METHOD, string> = {
    [REST_METHOD.GET]: "bg-green-500/10 text-green-600 dark:text-green-400",
    [REST_METHOD.POST]: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    [REST_METHOD.PUT]: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    [REST_METHOD.DELETE]: "bg-red-500/10 text-red-600 dark:text-red-400",
    [REST_METHOD.PATCH]: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  };

  const hasRequests = requests && requests.length > 0;

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
  
      if (!isFocused) return;

      const isModifierKey = e.metaKey || e.ctrlKey;
      
      if (isModifierKey) {
        switch (e.key.toLowerCase()) {
          case 'r':
            e.preventDefault();
            setIsAddRequestOpen(true);
            break;
          case 'e':
            e.preventDefault();
            setIsEditOpen(true);
            break;
          case 'd':
            e.preventDefault();
            setIsDeleteOpen(true);
            break;
        }
      }
    };

    if (isFocused) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFocused]);

  return (
    <>
      <Collapsible
        open={isCollapsed}
        onOpenChange={setIsCollapsed}
        className="w-full"
      >
        <div className="flex flex-col w-full">
          
          <div 
            ref={folderRef}
            tabIndex={0}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`flex flex-row justify-between items-center p-2 flex-1 w-full hover:bg-accent rounded-md group transition-colors outline-none ${
              isFocused ? 'ring-2 ring-primary/50 bg-accent/50' : ''
            }`}
          >
            <CollapsibleTrigger className="flex flex-row justify-start items-center space-x-2 flex-1">
              <div className="flex items-center space-x-1">
                {hasRequests ? (
                  isCollapsed ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )
                ) : (
                  <div className="w-4 h-4" /> 
                )}
                <Folder className="w-4 h-4 text-primary" />
              </div>
              <div className="flex items-center space-x-2 flex-1">
                <span className="text-sm font-medium capitalize truncate">
                  {collection.name}
                </span>
                {hasRequests && (
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-500/50"></div>
                    <span className="text-xs text-muted-foreground font-medium">
                      {requests.length}
                    </span>
                  </div>
                )}
              </div>
            </CollapsibleTrigger>

            <div className="flex flex-row justify-center items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                className="p-1 hover:bg-accent rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAddRequestOpen(true);
                }}
              >
                <FilePlus className="w-3.5 h-3.5 text-muted-foreground hover:text-primary transition-colors" />
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="p-1 hover:bg-accent rounded"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <EllipsisVertical className="w-3.5 h-3.5 text-muted-foreground hover:text-primary transition-colors" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setIsAddRequestOpen(true)}>
                    <div className="flex flex-row justify-between items-center w-full">
                      <div className="font-medium flex justify-center items-center">
                        <FilePlus className="text-green-500 mr-2 w-4 h-4" />
                        Add Request
                      </div>
                      <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        ⌘R
                      </span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                    <div className="flex flex-row justify-between items-center w-full">
                      <div className="font-medium flex justify-center items-center">
                        <Edit className="text-blue-500 mr-2 w-4 h-4" />
                        Rename
                      </div>
                      <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        ⌘E
                      </span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsDeleteOpen(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <div className="flex flex-row justify-between items-center w-full">
                      <div className="font-medium flex justify-center items-center">
                        <Trash className="mr-2 w-4 h-4" />
                        Delete
                      </div>
                      <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        ⌘D
                      </span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          
          <CollapsibleContent className="w-full">
            {isPending ? (
              <div className="pl-7 py-2">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  <span className="text-xs text-muted-foreground">
                    Loading requests...
                  </span>
                </div>
              </div>
            ) : isError ? (
              <div className="pl-7 py-2">
                <span className="text-xs text-destructive">
                  Failed to load requests
                </span>
              </div>
            ) : hasRequests ? (
              <div className="ml-6 border-l border-border pl-3 space-y-0.5 py-1">
                {requests.map((request: any) => (
                  <div
                    key={request.id}
                    onClick={() => {
                      
                      console.log("Open request:", request.id);
                    }}
                    className="flex items-center justify-between py-1.5 px-2 hover:bg-accent/50 rounded-md cursor-pointer group/request transition-colors"
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <div className="flex items-center space-x-1.5 shrink-0">
                        <span
                          className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${
                            requestMethodStyles[request.method as REST_METHOD]
                          }`}
                        >
                          {request.method}
                        </span>
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-500/50"></div>
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-xs font-medium truncate">
                          {request.name || request.url}
                        </span>
                        {request.url && request.name && (
                          <span className="text-[10px] text-muted-foreground truncate">
                            {request.url}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="opacity-0 group-hover/request:opacity-100 transition-opacity shrink-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="p-0.5 hover:bg-accent rounded"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <EllipsisVertical className="w-3 h-3 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-32">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRequest({
                                id: request.id,
                                name: request.name,
                                url: request.url,
                                method: request.method,
                              });
                              setIsEditRequestOpen(true);
                            }}
                          >
                            <Edit className="text-blue-500 mr-2 w-3 h-3" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRequest({
                                id: request.id,
                                name: request.name,
                                url: request.url,
                                method: request.method,
                              });
                              setIsDeleteRequestOpen(true);
                            }}
                          >
                            <Trash className="mr-2 w-3 h-3" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="pl-7 py-2">
                <span className="text-xs text-muted-foreground italic">
                  No requests yet
                </span>
              </div>
            )}
          </CollapsibleContent>
        </div>
      </Collapsible>

      
      <SaveRequestToCollectionModal
        isModalOpen={isAddRequestOpen}
        setIsModalOpen={setIsAddRequestOpen}
        collectionId={collection.id}
      />

      <EditCollectionModal
        isModalOpen={isEditOpen}
        setIsModalOpen={setIsEditOpen}
        collectionId={collection.id}
        initialName={collection.name}
      />

      <DeleteCollectionModal
        isModalOpen={isDeleteOpen}
        setIsModalOpen={setIsDeleteOpen}
        collectionId={collection.id}
        collectionName={collection.name}
      />

      {selectedRequest && (
        <>
          <EditRequestModal
            isModalOpen={isEditRequestOpen}
            setIsModalOpen={setIsEditRequestOpen}
            requestId={selectedRequest.id}
            collectionId={collection.id}
            initialData={{
              name: selectedRequest.name,
              url: selectedRequest.url,
              method: selectedRequest.method,
            }}
          />

          <DeleteRequestModal
            isModalOpen={isDeleteRequestOpen}
            setIsModalOpen={setIsDeleteRequestOpen}
            requestId={selectedRequest.id}
            requestName={selectedRequest.name}
            requestUrl={selectedRequest.url}
            requestMethod={selectedRequest.method}
            collectionId={collection.id}
          />
        </>
      )}
    </>
  );
};

export default CollectionFolder;
