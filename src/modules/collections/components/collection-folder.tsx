import {
  EllipsisVertical,
  FilePlus,
  Folder,
  Trash,
  Edit,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import React, { useState } from "react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import EditCollectionModal from "./edit-collection";
import DeleteCollectionModal from "./delete-collection";

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
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      <TooltipProvider delayDuration={300}>
        <Collapsible
          open={isCollapsed}
          onOpenChange={setIsCollapsed}
          className="w-full"
        >
          <div className="flex flex-col w-full">
            
            <div className="flex flex-row justify-between items-center p-2 flex-1 w-full hover:bg-accent rounded-md group">
              <CollapsibleTrigger className="flex flex-row justify-start items-center space-x-2 flex-1">
                <div className="flex items-center space-x-1">
                  {isCollapsed ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                  <Folder className="w-4 h-4 text-primary" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium capitalize">
                    {collection.name}
                  </span>
                </div>
              </CollapsibleTrigger>

              <div className="flex flex-row justify-center items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="p-1 hover:bg-accent rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <FilePlus className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Add Request</p>
                  </TooltipContent>
                </Tooltip>

                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <button 
                          className="p-1 hover:bg-accent rounded"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <EllipsisVertical className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
                        </button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>More Options</p>
                    </TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Rename Collection
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setIsDeleteOpen(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash className="w-4 h-4 mr-2" />
                      Delete Collection
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            
            <CollapsibleContent className="pl-6">
              <div className="py-2 text-xs text-muted-foreground">
                No requests yet
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </TooltipProvider>

      
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
    </>
  );
};

export default CollectionFolder;
                     