import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AdminTabsProps {
  children: React.ReactNode;
}

export function AdminTabs({ children }: AdminTabsProps) {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="api-calls">API Calls</TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}
