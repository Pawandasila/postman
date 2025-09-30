"use client";

import Modal from "@/components/ui/model";
import { useUpdateCollection } from "../hooks/collection";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";
import { toast } from "sonner";
import { Edit } from "lucide-react";

const EditCollectionModal = ({
  isModalOpen,
  setIsModalOpen,
  collectionId,
  initialName,
}: {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  collectionId: string;
  initialName: string;
}) => {
  const [name, setName] = useState(initialName);
  const { mutateAsync, isPending } = useUpdateCollection();

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Please enter a collection name");
      return;
    }
    
    try {
      await mutateAsync({ id: collectionId, name });
      toast.success("Collection updated successfully");
      setIsModalOpen(false);
    } catch (err) {
      toast.error("Failed to update collection");
      console.error("Failed to update collection:", err);
    }
  };

  const handleClose = () => {
    setName(initialName);
    setIsModalOpen(false);
  };

  return (
    <Modal
      title="Edit Collection"
      description="Rename your collection"
      isOpen={isModalOpen}
      onClose={handleClose}
      onSubmit={handleSubmit}
      submitText="Save Changes"
      cancelText="Cancel"
      submitVariant="default"
      size="md"
      headerIcon={<Edit className="h-5 w-5" />}
      loading={isPending}
      disabled={!name.trim()}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="edit-collection-name" className="text-sm font-medium">
            Collection Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="edit-collection-name"
            placeholder="Collection name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
            className="w-full"
            autoFocus
          />
        </div>
      </div>
    </Modal>
  );
};

export default EditCollectionModal;