"use client";

import React, { useState, useEffect } from "react";
import { Edit } from "lucide-react";
import { toast } from "sonner";
import { REST_METHOD } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Modal from "@/components/ui/model";
import { useEditRequest } from "../hooks/Request";

interface EditRequestModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  requestId: string;
  collectionId?: string;
  initialData: {
    name: string;
    url: string;
    method: REST_METHOD;
  };
}

const EditRequestModal = ({
  isModalOpen,
  setIsModalOpen,
  requestId,
  collectionId,
  initialData,
}: EditRequestModalProps) => {
  const [requestName, setRequestName] = useState(initialData.name);
  const [requestUrl, setRequestUrl] = useState(initialData.url);
  const [requestMethod, setRequestMethod] = useState<REST_METHOD>(initialData.method);

  const { mutateAsync, isPending } = useEditRequest(requestId, collectionId);

  useEffect(() => {
    if (isModalOpen) {
      setRequestName(initialData.name);
      setRequestUrl(initialData.url);
      setRequestMethod(initialData.method);
    }
  }, [isModalOpen, initialData]);

  const requestMethodStyles: Record<REST_METHOD, { className: string }> = {
    [REST_METHOD.GET]: { 
      className: "bg-green-500/10 text-green-600 border-green-500/30 dark:text-green-400 dark:border-green-400/30" 
    },
    [REST_METHOD.POST]: { 
      className: "bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400 dark:border-blue-400/30" 
    },
    [REST_METHOD.PUT]: { 
      className: "bg-yellow-500/10 text-yellow-700 border-yellow-500/30 dark:text-yellow-400 dark:border-yellow-400/30" 
    },
    [REST_METHOD.DELETE]: { 
      className: "bg-red-500/10 text-red-600 border-red-500/30 dark:text-red-400 dark:border-red-400/30" 
    },
    [REST_METHOD.PATCH]: { 
      className: "bg-orange-500/10 text-orange-600 border-orange-500/30 dark:text-orange-400 dark:border-orange-400/30" 
    },
  };

  const handleSubmit = async () => {
    if (!requestName.trim()) {
      toast.error("Request Name Required", {
        description: "Please enter a name for your request.",
        duration: 3000,
      });
      return;
    }

    if (!requestUrl.trim()) {
      toast.error("URL Required", {
        description: "Please enter a URL for your request.",
        duration: 3000,
      });
      return;
    }

    try {
      await mutateAsync({
        name: requestName.trim(),
        url: requestUrl.trim(),
        method: requestMethod,
      });

      toast.success("Request Updated Successfully!", {
        description: `"${requestName}" has been updated.`,
        duration: 4000,
      });

      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to Update Request", {
        description: "There was an error updating your request. Please try again.",
        duration: 4000,
      });
      console.error("Failed to update request:", error);
    }
  };

  return (
    <Modal
      title="Edit Request"
      description="Update your request details"
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onSubmit={handleSubmit}
      submitText={isPending ? "Updating..." : "Update Request"}
      submitVariant="default"
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="edit-request-name" className="text-sm font-medium">
            Request Name
          </Label>
          <Input
            id="edit-request-name"
            placeholder="Enter request name..."
            value={requestName}
            onChange={(e) => setRequestName(e.target.value)}
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-request-method" className="text-sm font-medium">
            HTTP Method
          </Label>
          <Select
            value={requestMethod}
            onValueChange={(value) => setRequestMethod(value as REST_METHOD)}
          >
            <SelectTrigger id="edit-request-method">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={`font-mono font-bold text-xs ${requestMethodStyles[requestMethod].className}`}
                  >
                    {requestMethod}
                  </Badge>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.values(REST_METHOD).map((method) => (
                <SelectItem key={method} value={method}>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`font-mono font-bold text-xs ${requestMethodStyles[method].className}`}
                    >
                      {method}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-request-url" className="text-sm font-medium">
            Request URL
          </Label>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={`font-mono font-bold text-xs ${requestMethodStyles[requestMethod].className} shrink-0`}
            >
              {requestMethod}
            </Badge>
            <Input
              id="edit-request-url"
              placeholder="https://api.example.com/endpoint"
              value={requestUrl}
              onChange={(e) => setRequestUrl(e.target.value)}
              className="flex-1 font-mono"
            />
          </div>
        </div>

        <div className="p-3 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-start gap-2">
            <Edit className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Editing Request
              </p>
              <p className="text-[11px] text-muted-foreground">
                Changes will be saved to the collection immediately after updating.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EditRequestModal;
