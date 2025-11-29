
import Header from "@/modules/Layout/Components/Header";
import { currentUser } from "@/modules/Authentication/actions";
import React from "react";
import { initWorkSpace } from "@/modules/Workspace/actions";
import TabbedLeftPanel from "@/modules/Workspace/components/TabbedLeftPanel";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

const RootLayout = async ({ children }: Readonly<{ children: React.ReactNode }>) => {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const workspace = await initWorkSpace();  
  
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <Header user={user} />
      <main className="flex flex-1 overflow-hidden">
        <div className="flex h-full w-full">
          <div className="w-16 border-r border-border bg-sidebar flex flex-col items-center py-2 gap-2">
            <TabbedLeftPanel />
          </div>

          <div className="flex-1 bg-background overflow-hidden">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RootLayout;
