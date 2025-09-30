"use client"
import { Search, FileText, Folder, Globe, Clock, Star } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"

const SearchBar = () => {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <>
      {/* Search Button */}
      <button 
        onClick={() => setOpen(true)}
        className="relative flex w-full items-center justify-between rounded-lg border border-input bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="inline-flex items-center gap-2">
          <Search size={14} />
          <span>Search requests, collections...</span>
        </span>
        <span className="flex items-center gap-1">
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium">
            <span className="text-xs">⌘</span>K
          </kbd>
        </span>
      </button>

      {mounted && (
        <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="bg-popover border border-border">
          <CommandInput 
            placeholder="Search requests, collections, or commands..." 
            className="border-none focus:ring-0 text-foreground placeholder:text-muted-foreground"
          />
          <CommandList className="max-h-[400px]">
            <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </CommandEmpty>
            
            {/* Recent Searches */}
            <CommandGroup heading="Recent">
              <CommandItem onSelect={() => setOpen(false)} className="gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>GET /api/users</span>
                <CommandShortcut>5m ago</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => setOpen(false)} className="gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>POST /api/auth/login</span>
                <CommandShortcut>1h ago</CommandShortcut>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            {/* Collections */}
            <CommandGroup heading="Collections">
              <CommandItem onSelect={() => setOpen(false)} className="gap-2">
                <Folder className="h-4 w-4 text-primary" />
                <span>User Management</span>
                <CommandShortcut>12 requests</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => setOpen(false)} className="gap-2">
                <Folder className="h-4 w-4 text-primary" />
                <span>Authentication</span>
                <CommandShortcut>8 requests</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => setOpen(false)} className="gap-2">
                <Folder className="h-4 w-4 text-primary" />
                <span>Payment API</span>
                <CommandShortcut>15 requests</CommandShortcut>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            {/* Requests */}
            <CommandGroup heading="Requests">
              <CommandItem onSelect={() => setOpen(false)} className="gap-2">
                <Globe className="h-4 w-4 text-green-500" />
                <span>Get All Users</span>
                <CommandShortcut className="text-green-500">GET</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => setOpen(false)} className="gap-2">
                <Globe className="h-4 w-4 text-blue-500" />
                <span>Create User</span>
                <CommandShortcut className="text-blue-500">POST</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => setOpen(false)} className="gap-2">
                <Globe className="h-4 w-4 text-orange-500" />
                <span>Update User</span>
                <CommandShortcut className="text-orange-500">PUT</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => setOpen(false)} className="gap-2">
                <Globe className="h-4 w-4 text-red-500" />
                <span>Delete User</span>
                <CommandShortcut className="text-red-500">DELETE</CommandShortcut>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            {/* Actions */}
            <CommandGroup heading="Actions">
              <CommandItem onSelect={() => setOpen(false)} className="gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>New Request</span>
                <CommandShortcut>⌘N</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => setOpen(false)} className="gap-2">
                <Folder className="h-4 w-4 text-muted-foreground" />
                <span>New Collection</span>
                <CommandShortcut>⌘⇧N</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => setOpen(false)} className="gap-2">
                <Star className="h-4 w-4 text-muted-foreground" />
                <span>View Favorites</span>
                <CommandShortcut>⌘B</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
          
          {/* Bottom navigation hints */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-muted/50">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-xs font-mono">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-xs font-mono">↓</kbd>
                <span>navigate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-xs font-mono">↵</kbd>
                <span>select</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-xs font-mono">ESC</kbd>
              <span>close</span>
            </div>
          </div>
        </div>
      </CommandDialog>
      )}
    </>
  )
}

export default SearchBar