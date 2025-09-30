"use client";

import Modal from "@/components/ui/model";
import { useCreateCollection } from "@/modules/collections/hooks/collection";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";
import { toast } from "sonner";
import { FolderPlus } from "lucide-react";

const CreateCollection = ({
  workspaceId,
  isModalOpen,
  setIsModalOpen,
}: {
  workspaceId: string;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}) => {
  const [name, setName] = useState("");
  const { mutateAsync, isPending } = useCreateCollection(workspaceId);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Please enter a collection name");
      return;
    }
    
    try {
      await mutateAsync({ name });
      toast.success("Collection created successfully");
      setName("");
      setIsModalOpen(false);
    } catch (err) {
      toast.error("Failed to create collection");
      console.error("Failed to create collection:", err);
    }
  };

  const handleClose = () => {
    setName("");
    setIsModalOpen(false);
  };

  return (
    <Modal
      title="Create New Collection"
      description="Create a new collection to organize your API requests"
      isOpen={isModalOpen}
      onClose={handleClose}
      onSubmit={handleSubmit}
      submitText="Create Collection"
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
          <Label htmlFor="collection-name" className="text-sm font-medium">
            Collection Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="collection-name"
            placeholder="e.g., User API, Payment Service"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
            className="w-full"
            autoFocus
          />
          <p className="text-xs text-muted-foreground">
            Choose a descriptive name for your collection
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default CreateCollection;