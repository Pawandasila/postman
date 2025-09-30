
import Header from "@/modules/Layout/Components/Header";
import { currentUser } from "@/modules/Authentication/actions";
import React from "react";

const RootLayout = async ({ children }: Readonly<{ children: React.ReactNode }>) => {
  const user = await currentUser();
  
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <Header user={user} />
      <main className="flex flex-1 overflow-hidden">
        <div className="flex h-full w-full">
          {/* Left Sidebar Panel */}
          <div className="w-12 border-r border-border bg-sidebar flex flex-col items-center py-2 gap-2">
            {/* Add your sidebar icons here */}
          </div>
          
          {/* Main Content Area */}
          <div className="flex-1 bg-background overflow-hidden">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RootLayout;
