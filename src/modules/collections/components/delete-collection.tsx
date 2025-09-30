"use client";

import Modal from "@/components/ui/model";
import { useDeleteCollection } from "../hooks/collection";
import React from "react";
import { toast } from "sonner";
import { Trash2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const DeleteCollectionModal = ({
  isModalOpen,
  setIsModalOpen,
  collectionId,
  collectionName,
}: {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  collectionId: string;
  collectionName: string;
}) => {
  const { mutateAsync, isPending } = useDeleteCollection();

  const handleDelete = async () => {
    try {
      await mutateAsync(collectionId);
      toast.success("Collection deleted successfully");
      setIsModalOpen(false);
    } catch (err) {
      toast.error("Failed to delete collection");
      console.error("Failed to delete collection:", err);
    }
  };

  return (
    <Modal
      title="Delete Collection"
      description={`Are you sure you want to delete "${collectionName}"?`}
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onSubmit={handleDelete}
      submitText="Delete Collection"
      cancelText="Cancel"
      submitVariant="destructive"
      size="md"
      headerIcon={<Trash2 className="h-5 w-5" />}
      headerVariant="error"
      loading={isPending}
    >
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          This action cannot be undone. All requests and data in this collection will be permanently removed.
        </AlertDescription>
      </Alert>
    </Modal>
  );
};

export default DeleteCollectionModal;