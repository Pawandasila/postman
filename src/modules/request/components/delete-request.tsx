"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { REST_METHOD } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import Modal from "@/components/ui/model";
import { useDeleteRequest } from "../hooks/Request";

interface DeleteRequestModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  requestId: string;
  requestName: string;
  requestUrl: string;
  requestMethod: REST_METHOD;
  collectionId?: string;
}

const DeleteRequestModal = ({
  isModalOpen,
  setIsModalOpen,
  requestId,
  requestName,
  requestUrl,
  requestMethod,
  collectionId,
}: DeleteRequestModalProps) => {
  const { mutateAsync, isPending } = useDeleteRequest(collectionId);

  const requestMethodStyles: Record<REST_METHOD, { className: string; bgColor: string }> = {
    [REST_METHOD.GET]: { 
      className: "bg-green-500/10 text-green-600 border-green-500/30 dark:text-green-400 dark:border-green-400/30",
      bgColor: "bg-green-500/5 border-green-500/20"
    },
    [REST_METHOD.POST]: { 
      className: "bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400 dark:border-blue-400/30",
      bgColor: "bg-blue-500/5 border-blue-500/20"
    },
    [REST_METHOD.PUT]: { 
      className: "bg-yellow-500/10 text-yellow-700 border-yellow-500/30 dark:text-yellow-400 dark:border-yellow-400/30",
      bgColor: "bg-yellow-500/5 border-yellow-500/20"
    },
    [REST_METHOD.DELETE]: { 
      className: "bg-red-500/10 text-red-600 border-red-500/30 dark:text-red-400 dark:border-red-400/30",
      bgColor: "bg-red-500/5 border-red-500/20"
    },
    [REST_METHOD.PATCH]: { 
      className: "bg-orange-500/10 text-orange-600 border-orange-500/30 dark:text-orange-400 dark:border-orange-400/30",
      bgColor: "bg-orange-500/5 border-orange-500/20"
    },
  };

  const handleDelete = async () => {
    try {
      await mutateAsync(requestId);
      
      toast.success("Request Deleted", {
        description: `"${requestName}" has been permanently deleted.`,
        duration: 4000,
      });
      
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to Delete Request", {
        description: "There was an error deleting the request. Please try again.",
        duration: 4000,
      });
      console.error("Failed to delete request:", error);
    }
  };

  return (
    <Modal
      title="Delete Request"
      description="This action cannot be undone. All data associated with this request will be permanently removed from the collection."
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onSubmit={handleDelete}
      submitText={isPending ? "Deleting..." : "Delete Request"}
      submitVariant="destructive"
      headerVariant="error"
    >
      <div className="space-y-4">
       
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Request Details</h4>
          
          <div className={`p-4 rounded-lg border ${requestMethodStyles[requestMethod].bgColor}`}>
            <div className="space-y-3">
              {/* Request Name */}
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Request Name
                </span>
                <p className="text-sm font-semibold text-foreground">{requestName}</p>
              </div>

              {/* HTTP Method */}
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  HTTP Method
                </span>
                <div>
                  <Badge 
                    variant="outline" 
                    className={`font-mono font-bold text-xs ${requestMethodStyles[requestMethod].className}`}
                  >
                    {requestMethod}
                  </Badge>
                </div>
              </div>

              {/* Request URL */}
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Request URL
                </span>
                <div className="p-2 bg-background/50 rounded border border-border">
                  <p className="text-xs font-mono text-foreground break-all">
                    {requestUrl}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Text */}
        <div className="text-center py-2 px-4 bg-muted/30 rounded-lg border border-border">
          <p className="text-sm font-medium text-foreground">
            Are you sure you want to delete this request?
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            This action cannot be undone.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteRequestModal;
