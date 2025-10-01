import React from "react";
import { RequestTab } from "../store/useRequestStore";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import KeyValueFormEditor from "./key-value-form";
import BodyEditor from "./body-editor";
import { toast } from "sonner";

interface Props {
  tab: RequestTab;
  updateTab: (id: string, data: Partial<RequestTab>) => void;
}

const RequestEditorArea = ({ tab, updateTab }: Props) => {
  

  const parseKeyValueData = (jsonString?: string) => {
    if (!jsonString) return [];
    try {
      return JSON.parse(jsonString);
    } catch {
      return [];
    }
  };


  const getHeadersData = () => {
    const parsed = parseKeyValueData(tab.headers);
    return parsed.length > 0 ? parsed : [{ key: "", value: "", enabled: true }];
  };


  const getParametersData = () => {
    const parsed = parseKeyValueData(tab.parameters);
    return parsed.length > 0 ? parsed : [{ key: "", value: "", enabled: true }];
  };

  const getBodyData = () => {
    return {
      contentType: 'application/json' as const,
      body: tab.body || ''
    };
  };

  const handleHeadersChange = (data: { key: string; value: string; enabled?: boolean }[]) => {
 
    const filteredHeaders = data.filter((item) => 
      item.enabled !== false && (item.key.trim() || item.value.trim())
    );
    updateTab(tab.id, { headers: JSON.stringify(filteredHeaders) });
    toast.success("Headers updated successfully")
  };

  const handleParametersChange = (data: { key: string; value: string; enabled?: boolean }[]) => {
  
    const filteredParams = data.filter((item) => 
      item.enabled !== false && (item.key.trim() || item.value.trim())
    );
    updateTab(tab.id, { parameters: JSON.stringify(filteredParams) });
    toast.success("Parameters updated successfully")
  };

  const handleBodyChange = (data: { contentType: string; body?: string }) => {
    updateTab(tab.id, { body: data.body || '' });
    toast.success("Body updated successfully")
  };

  return (
    <Tabs
      defaultValue="parameters"
      className="bg-gradient-to-br from-card via-card to-muted/20 rounded-xl w-full border border-border shadow-xl overflow-hidden backdrop-blur-sm"
    >
      <TabsList className="bg-muted/50 border-b border-border rounded-none w-full justify-start px-2 py-1 h-auto">
        <TabsTrigger 
          value="parameters" 
          className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md px-6 py-2.5 rounded-lg font-medium transition-all duration-200 text-muted-foreground hover:text-foreground"
        >
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 data-[state=active]:animate-pulse"></span>
            Parameters
          </span>
        </TabsTrigger>
        <TabsTrigger 
          value="headers" 
          className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md px-6 py-2.5 rounded-lg font-medium transition-all duration-200 text-muted-foreground hover:text-foreground"
        >
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400"></span>
            Headers
          </span>
        </TabsTrigger>
        <TabsTrigger 
          value="body" 
          className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md px-6 py-2.5 rounded-lg font-medium transition-all duration-200 text-muted-foreground hover:text-foreground"
        >
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500 dark:bg-purple-400"></span>
            Body
          </span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="parameters" className="p-6 mt-0">
        <KeyValueFormEditor
          initialData={getParametersData()}
          onSubmit={handleParametersChange}
          placeholder={{
            key: "Parameter Name",
            value: "Parameter Value",
            description: "URL Parameter",
          }}
        />
      </TabsContent>
      
      <TabsContent value="headers" className="p-6 mt-0">
        <KeyValueFormEditor
          initialData={getHeadersData()}
          onSubmit={handleHeadersChange}
          placeholder={{
            key: "Header Name",
            value: "Header Value",
            description: "HTTP Header",
          }}
        />
      </TabsContent>
      
      <TabsContent value="body" className="p-6 mt-0">
        <BodyEditor 
          initialData={getBodyData()}
          onSubmit={handleBodyChange} 
        />
      </TabsContent>
      
    </Tabs>
  );
};

export default RequestEditorArea;