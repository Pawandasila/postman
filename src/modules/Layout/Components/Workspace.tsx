"use client"

import React, { useEffect, useState } from "react"
import { Check, ChevronsUpDown, FolderOpen, LoaderCircle, AlertCircle, Plus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useWorkspaces } from "@/modules/Workspace/hooks/workspace"
import { useWorkspaceStore } from "../Store"
import { Skeleton } from "@/components/ui/skeleton"
import CreateWorkspace from "./create-workspace"

export default function Workspace() {
  const { data: response, isLoading, error } = useWorkspaces();
  const { selectedWorkspace, setSelectedWorkspace } = useWorkspaceStore();
  const [isModelOpen, setIsModelOpen] = useState(false);

  
  const workspaces = response?.success ? response.workspaces : [];

  
  useEffect(() => {
    if (workspaces && workspaces.length > 0 && !selectedWorkspace) {
      setSelectedWorkspace({
        id: workspaces[0].id,
        name: workspaces[0].name,
      });
    }
  }, [workspaces, selectedWorkspace, setSelectedWorkspace]);

  
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 h-9 px-3">
        <LoaderCircle className="animate-spin size-4 text-muted-foreground" />
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }

  
  if (error) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-2 text-destructive hover:text-destructive"
        disabled
      >
        <AlertCircle className="size-4" />
        <span className="text-sm">Error loading workspaces</span>
      </Button>
    );
  }

  
  if (!workspaces || workspaces.length === 0) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-2"
        disabled
      >
        <FolderOpen className="size-4" />
        <span className="text-sm text-muted-foreground">No workspace</span>
      </Button>
    );
  }

  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground min-w-[180px] justify-start"
        >
          <div className="bg-primary text-primary-foreground flex aspect-square size-6 items-center justify-center rounded-md">
            <FolderOpen className="size-3.5" />
          </div>
          <div className="flex flex-col items-start leading-none flex-1 min-w-0">
            <span className="text-sm font-medium truncate max-w-[120px]">
              {selectedWorkspace?.name || "Select workspace"}
            </span>
            <span className="text-xs text-muted-foreground">
              {workspaces.length} {workspaces.length === 1 ? "workspace" : "workspaces"}
            </span>
          </div>
          <ChevronsUpDown className="ml-auto size-4 opacity-50 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[280px]"
        align="start"
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Your Workspaces
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onSelect={() => setSelectedWorkspace({
              id: workspace.id,
              name: workspace.name,
            })}
            className="gap-2 cursor-pointer"
          >
            <div className="bg-primary/10 text-primary flex aspect-square size-6 items-center justify-center rounded-md shrink-0">
              <FolderOpen className="size-3.5" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-medium truncate">{workspace.name}</span>
              {workspace.description && (
                <span className="text-xs text-muted-foreground truncate">
                  {workspace.description}
                </span>
              )}
            </div>
            {selectedWorkspace?.id === workspace.id && (
              <Check className="size-4 text-primary shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => setIsModelOpen(true)}
          className="gap-2 cursor-pointer text-primary hover:text-primary focus:text-primary"
        >
          <div className="bg-primary/10 text-primary flex aspect-square size-6 items-center justify-center rounded-md shrink-0">
            <Plus className="size-3.5" />
          </div>
          <span className="text-sm font-medium">Create New Workspace</span>
        </DropdownMenuItem>
      </DropdownMenuContent>

      {/* Create Workspace Modal */}
      <CreateWorkspace 
        isModalOpen={isModelOpen} 
        setIsModalOpen={setIsModelOpen} 
      />
    </DropdownMenu>
  );
}