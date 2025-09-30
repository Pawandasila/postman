'use client'

import React, { useState } from "react"
import Modal from "@/components/ui/model"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCreateWorkspace } from "@/modules/Workspace/hooks/workspace"
import { toast } from "sonner"
import { FolderPlus } from "lucide-react"

const CreateWorkspace = ({isModalOpen, setIsModalOpen}: {
    isModalOpen: boolean,
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const { mutateAsync, isPending } = useCreateWorkspace();

    const handleSubmit = async () => {
        if (!name.trim()) {
            toast.error("Please enter a workspace name");
            return;
        }
        
        try {
            await mutateAsync({ 
                name, 
                description: description.trim() || undefined 
            });
            toast.success("Workspace created successfully");
            setName("");
            setDescription("");
            setIsModalOpen(false);
        } catch (err) {
            toast.error("Failed to create workspace");
            console.error("Failed to create workspace:", err);
        }
    };

    const handleClose = () => {
        setName("");
        setDescription("");
        setIsModalOpen(false);
    };

    return (
        <Modal
            title="Create New Workspace"
            description="Create a new workspace to organize your API collections and requests"
            isOpen={isModalOpen}
            onClose={handleClose}
            onSubmit={handleSubmit}
            submitText="Create Workspace"
            cancelText="Cancel"
            submitVariant="default"
            size="md"
            headerIcon={<FolderPlus className="h-5 w-5" />}
            headerVariant="default"
            loading={isPending}
            disabled={!name.trim()}
        >
            <div className="space-y-4">
                
                <div className="space-y-2">
                    <Label htmlFor="workspace-name" className="text-sm font-medium">
                        Workspace Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="workspace-name"
                        placeholder="e.g., My API Project"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isPending}
                        className="w-full"
                        autoFocus
                    />
                    <p className="text-xs text-muted-foreground">
                        Choose a descriptive name for your workspace
                    </p>
                </div>

                
                <div className="space-y-2">
                    <Label htmlFor="workspace-description" className="text-sm font-medium">
                        Description <span className="text-xs text-muted-foreground">(Optional)</span>
                    </Label>
                    <Textarea
                        id="workspace-description"
                        placeholder="What's this workspace for?"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={isPending}
                        className="w-full resize-none"
                        rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                        Add a brief description to help you remember what this workspace is for
                    </p>
                </div>
            </div>
        </Modal>
    )
}

export default CreateWorkspace