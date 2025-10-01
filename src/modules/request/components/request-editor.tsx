"use client";

import { useRequestPlaygroundStore } from "../store/useRequestStore";
import RequestBar from "./request-bar";
import RequestEditorArea from "./request-editor-area";
import ResponseViewer from "./response-viewer";


export default function RequestEditor() {
  const { tabs, activeTabId, updateTab  } = useRequestPlaygroundStore();
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  if (!activeTab) return null;

  return (
   <div className="flex flex-col items-center justify-start h-full w-full bg-background">
      {/* Enhanced Header Section with gradient background */}
      <div className="w-full bg-gradient-to-br from-card via-card to-muted/30 border-b border-border shadow-md">
        <div className="px-6 py-5">
          <RequestBar tab={activeTab} updateTab={updateTab} />
        </div>
      </div>

      {/* Main Content Area with better spacing */}
      <div className="flex-1 w-full overflow-y-auto bg-background">
        <div className="px-6 py-6">
          <div className="mb-6">
            <RequestEditorArea tab={activeTab} updateTab={updateTab} />
          </div>
          
          {/* {responseViewerData && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ResponseViewer responseData={responseViewerData} />
            </div>
          )} */}
        </div>
      </div>
   </div>
  );
}