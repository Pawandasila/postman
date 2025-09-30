"use client";

import React from "react";
import UserButton from "@/modules/Authentication/components/user-button";
import { UserProps } from "../Types";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import SearchBar from "./SearchBar";
import InviteMember from "./InviteMember";
import Workspace from "./Workspace";
import { Hint } from "@/components/ui/hint";

interface HeaderProps {
  user: UserProps | null;
}

const Header = ({ user }: HeaderProps) => {
  return (
    <header className="h-14 w-full border-b border-border bg-background flex items-center justify-between px-4 gap-3">
      
      <div className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer shrink-0">
        <Image
          src={"/logo/logo.png"}
          alt="Postman Logo"
          width={32}
          height={32}
          quality={100}
          className="h-8 w-8 object-contain"
        />
        <span className="font-semibold text-lg">PostBoy</span>
      </div>

      <Workspace />
      
      <div className="flex-1 max-w-md">
        <SearchBar />
      </div>
      
      <div className="flex items-center gap-2 shrink-0">
        <Hint label="Settings" side="bottom">
          <Button size="sm" variant="ghost" className="h-9 w-9 p-0">
            <Settings className="h-4 w-4" />
          </Button>
        </Hint>

        <InviteMember />
        
        <div className="h-6 w-px bg-border hidden sm:block" />
        
        <UserButton user={user} size="md" showEmail={true} showMemberSince={true} />
      </div>
    </header>
  );
};

export default Header;
