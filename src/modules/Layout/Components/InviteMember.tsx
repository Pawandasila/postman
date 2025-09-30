import { Button } from "@/components/ui/button";
import { Hint } from "@/components/ui/hint";
import { UserPlus } from "lucide-react";
import React from "react";

const InviteMember = () => {
  return (
    <Hint label="Invite Member" side="bottom">
      <Button size="sm" variant="outline" className="gap-2 h-9 px-3">
        <UserPlus className="h-4 w-4" />
        <span className="hidden md:inline">Invite</span>
      </Button>
    </Hint>
  );
};

export default InviteMember;
