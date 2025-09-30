"use client"

import * as React from "react"
import { Check, ChevronsUpDown, FolderOpen } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export default function Workspace() {
  const workspaces = [
    { id: "1", name: "My Workspace", icon: FolderOpen },
    { id: "2", name: "Team Workspace", icon: FolderOpen },
    { id: "3", name: "Project Alpha", icon: FolderOpen },
  ]

  const [selectedWorkspace, setSelectedWorkspace] = React.useState(workspaces[0])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
        >
          <div className="bg-primary text-primary-foreground flex aspect-square size-6 items-center justify-center rounded-md">
            <FolderOpen className="size-3.5" />
          </div>
          <div className="flex flex-col items-start leading-none">
            <span className="text-sm font-medium">{selectedWorkspace.name}</span>
          </div>
          <ChevronsUpDown className="ml-auto size-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[240px]"
        align="start"
      >
        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onSelect={() => setSelectedWorkspace(workspace)}
            className="gap-2"
          >
            <div className="bg-primary/10 text-primary flex aspect-square size-6 items-center justify-center rounded-md">
              <workspace.icon className="size-3.5" />
            </div>
            <span className="flex-1">{workspace.name}</span>
            {workspace.id === selectedWorkspace.id && <Check className="size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}